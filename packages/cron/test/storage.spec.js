/* eslint-env mocha */
import {
  createUser,
  createUserWithFiles
} from '../../db/test/utils.js'
import assert from 'assert'
import { getDBClient, getPg } from '../src/lib/utils.js'
import { EMAIL_TYPE } from '@web3-storage/db'
import { checkStorageUsed } from '../src/jobs/storage.js'
import { EmailService, EMAIL_PROVIDERS } from '../src/lib/email/service.js'
// import DummyEmailProvider from '../src/lib/email/providers/dummy.js'
import sinon from 'sinon'
import { EmailSendError } from '../src/lib/email/errors.js'

const env = {
  ...process.env,
  ENV: 'dev',
  RO_PG_CONNECTION: 'postgres://postgres:postgres@127.0.0.1:5432/postgres'
}

/**
 *
 * @param {sinon.SinonStub} stub
 * @param {string} emailType
 */
function getEmailStubCallFromEmailType (stub, emailType) {
  return stub.getCalls().filter((call) => call.args[1] === emailType)
}

describe('cron - check user storage quotas', () => {
  let dbClient
  let roPg
  let adminUser, test2user, testUser90percent1, testUser90percent2, testUserOver100, emailService
  before(async () => {
    dbClient = getDBClient(env)
    roPg = await getPg(env, 'ro')
  })

  after(async () => {
    await roPg.end()
  })

  beforeEach(async () => {
    emailService = new EmailService({ db: dbClient, provider: EMAIL_PROVIDERS.dummy })
    adminUser = await createUser(dbClient, {
      email: 'support@web3.storage',
      name: 'Web3 Storage Admin'
    })

    await createUserWithFiles(dbClient, {
      email: 'test1@email.com',
      percentStorageUsed: 60
    })

    test2user = await createUserWithFiles(dbClient, {
      email: 'test2@email.com',
      percentStorageUsed: 79
    })

    testUser90percent1 = await createUserWithFiles(dbClient, {
      email: 'testUser90percent1@email.com',
      percentStorageUsed: 90
    })

    testUser90percent2 = await createUserWithFiles(dbClient, {
      email: 'testUser90percent2@email.com',
      percentStorageUsed: 91
    })

    testUserOver100 = await createUserWithFiles(dbClient, {
      email: 'test4@email.com',
      percentStorageUsed: 145,
      storageQuota: 2199023255552
    })
  })

  it('can be executed', async () => {
    sinon.spy(emailService.provider, 'sendEmail')

    await checkStorageUsed({ roPg, emailService, userBatchSize: 1 })

    assert.equal(emailService.provider.sendEmail.callCount, 5)

    // Admin email
    emailService.provider.sendEmail.calledWith(EMAIL_TYPE.AdminStorageExceeded, 'support@web3.storage')

    // Users email
    emailService.provider.sendEmail.calledWith(EMAIL_TYPE.User75PercentStorage, 'test2@email.com')
    emailService.provider.sendEmail.calledWith(EMAIL_TYPE.User85PercentStorage, 'test3@email.com')
    emailService.provider.sendEmail.calledWith(EMAIL_TYPE.User100PercentStorage, 'test4@email.com')

    const adminUser = await dbClient.getUserByEmail('support@web3.storage')
    assert.ok(adminUser, 'admin user found')
    const adminStorageExceeded = await dbClient.emailHasBeenSent({
      userId: adminUser._id,
      emailType: EMAIL_TYPE.AdminStorageExceeded,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(adminStorageExceeded, true, 'Admin storage exceeded email sent')

    const over75EmailSent = await dbClient.emailHasBeenSent({
      userId: test2user._id,
      emailType: EMAIL_TYPE.User75PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over75EmailSent, true, 'Over 75% email sent')

    const over90Email1Sent = await dbClient.emailHasBeenSent({
      userId: testUser90percent1._id,
      emailType: EMAIL_TYPE.User90PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over90Email1Sent, true, 'Over 90% email sent')

    const over90Email2Sent = await dbClient.emailHasBeenSent({
      userId: testUser90percent2._id,
      emailType: EMAIL_TYPE.User90PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over90Email2Sent, true, 'Over 90% email sent')

    const over100EmailSent = await dbClient.emailHasBeenSent({
      userId: testUserOver100._id,
      emailType: EMAIL_TYPE.User100PercentStorage,
      secondsSinceLastSent: 60 * 60 * 23
    })
    assert.strictEqual(over100EmailSent, true, 'Over 100% email sent')

    // Ensure emails are not re-sent
    emailService.provider.sendEmail.resetHistory()
    await checkStorageUsed({ roPg, emailService })

    sinon.assert.notCalled(emailService.provider.sendEmail)
  })

  it('calls the email service with the correct parameters', async () => {
    const sendEmailStub = sinon.stub(emailService, 'sendEmail')
    await checkStorageUsed({ roPg, emailService, userBatchSize: 1 })

    assert.strictEqual(sendEmailStub.getCalls().length, 5, 'email service called 5 times')

    const emailUsers100Calls = getEmailStubCallFromEmailType(sendEmailStub, 'User100PercentStorage')
    assert.strictEqual(emailUsers100Calls.length, 1, 'User100PercentStorage called once')

    assert.strictEqual(emailUsers100Calls[0].args[0].email, 'test4@email.com')
    assert.strictEqual(emailUsers100Calls[0].args[2].secondsSinceLastSent, 60 * 60 * 23)

    const emailAdminCalls = getEmailStubCallFromEmailType(sendEmailStub, 'AdminStorageExceeded')
    assert.strictEqual(emailAdminCalls.length, 1, 'AdminStorageExceeded called once')

    assert.strictEqual(emailAdminCalls[0].args[0].id, adminUser.id)
    assert.strictEqual(emailAdminCalls[0].args[1], 'AdminStorageExceeded', 'admin exceeded daily check')
    assert.strictEqual(emailAdminCalls[0].args[2].secondsSinceLastSent, 60 * 60 * 23)

    const tVars = emailAdminCalls[0].args[2].templateVars
    assert.ok(tVars, 'users passed to email template')
    assert.strictEqual(tVars.users.length, 1)
    assert.ok(tVars.users.some((u) => u.id === testUserOver100._id))

    const emailUsers90Calls = getEmailStubCallFromEmailType(sendEmailStub, 'User90PercentStorage')
    assert.strictEqual(emailUsers90Calls.length, 2, 'User90PercentStorage called twice')

    assert.strictEqual(emailUsers90Calls[0].args[0].email, 'testUser90percent1@email.com')
    assert.strictEqual(emailUsers90Calls[0].args[1], 'User90PercentStorage', 'user daily check over 90')
    assert.strictEqual(emailUsers90Calls[0].args[2].secondsSinceLastSent, 60 * 60 * 23)

    assert.strictEqual(emailUsers90Calls[1].args[0].email, 'testUser90percent2@email.com')
    assert.strictEqual(emailUsers90Calls[1].args[1], 'User90PercentStorage', 'user daily check over 90')
    assert.strictEqual(emailUsers90Calls[1].args[2].secondsSinceLastSent, 60 * 60 * 23)

    const emailUsers75Calls = getEmailStubCallFromEmailType(sendEmailStub, 'User75PercentStorage')
    assert.strictEqual(emailUsers75Calls.length, 1, 'User75PercentStorage called twice')

    assert.strictEqual(emailUsers75Calls[0].args[0].email, 'test2@email.com')
    assert.strictEqual(emailUsers75Calls[0].args[1], 'User75PercentStorage', 'user weekly check over 75')
    assert.strictEqual(emailUsers75Calls[0].args[2].secondsSinceLastSent, 60 * 60 * 24 * 7 - (60 * 60))
  })

  it('handles email send errors', async () => {
    const providerSendEmailStub = sinon.stub(emailService.provider, 'sendEmail')
    providerSendEmailStub.onFirstCall().throws(new EmailSendError())
    providerSendEmailStub.returns('message ID 123')
    await checkStorageUsed({ roPg, emailService })
    assert.ok(
      providerSendEmailStub.called,
      'cron should have tried to send an email using its email provider'
    )
  })
})
