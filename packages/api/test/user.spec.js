/* eslint-env mocha */
import assert from 'assert'
import fetch, { Request } from '@web-std/fetch'
import { endpoint } from './scripts/constants.js'
import { getTestJWT, getDBClient } from './scripts/helpers.js'
import userUploads from './fixtures/pgrest/get-user-uploads.js'
import { AuthorizationTestContext } from './contexts/authorization.js'
import { userLoginPost } from '../src/user.js'
import { Magic } from '@magic-sdk/admin'
import { createMockCustomerService, createMockSubscriptionsService, storagePriceNames } from '../src/utils/billing.js'

describe('GET /user/account', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/account', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user account data', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const data = await res.json()
    assert.strictEqual(data.usedStorage.uploaded, 32000)
    assert.strictEqual(data.usedStorage.psaPinned, 710000)
  })
})

describe('GET /user/info', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/account', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/account', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user account data', async function () {
    const db = getDBClient()
    const authorization = AuthorizationTestContext.use(this)
    const token = authorization.createUserToken()
    const user = await db.getUser(authorization.bypass.defaults.issuer, {})
    let res, userInfo

    // Set PSA access to true and check response
    await db.createUserTag(user._id, { tag: 'HasPsaAccess', value: 'true', reason: 'testing' })
    res = await fetch(new URL('user/info', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    userInfo = await res.json()
    assert.strictEqual(userInfo.info._id, user._id)
    assert.strictEqual(userInfo.info.tags.HasPsaAccess, true)

    // Set PSA access to false and check response
    await db.createUserTag(user._id, { tag: 'HasPsaAccess', value: 'false', reason: 'testing' })
    res = await fetch(new URL('user/info', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    userInfo = await res.json()
    assert.strictEqual(userInfo.info._id, user._id)
    assert.strictEqual(userInfo.info.tags.HasPsaAccess, false)
  })
})

describe('GET /user/tokens', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens', endpoint))
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('retrieves user tokens', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/tokens', endpoint), {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const tokens = await res.json()
    assert(Array.isArray(tokens))
    tokens.forEach(t => {
      assert(t._id)
      assert(t.name)
      assert(t.secret)
      assert(t.created)
    })
  })
})

describe('POST /user/tokens', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'test' })
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      body: JSON.stringify({ name: 'test' })
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('creates a new token', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'test' })
    })
    assert(res.ok)
    assert.strictEqual(res.status, 201)
    const { _id } = await res.json()
    assert(_id)
  })

  it('requires valid name', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/tokens', endpoint), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: null })
    })
    assert(!res.ok)
    const { message } = await res.json()
    assert.strictEqual(message, 'invalid name')
  })
})

describe('DELETE /user/tokens/:id', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE'
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('removes a token', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/tokens/2', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const data = await res.json()
    assert(data._id)
  })
})

describe('GET /user/uploads', () => {
  it('lists uploads', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads)
  })

  it('lists uploads sorted by name', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?page=1&sortBy=Name', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, [...userUploads].sort((a, b) => b.name.localeCompare(a.name)))
  })

  it('lists uploads sorted by date', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?page=1&sortBy=Date', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, [...userUploads].sort((a, b) => b.created.localeCompare(a.created)))
  })

  it('lists uploads in reverse order when sorting by Asc', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads?page=1&sortBy=Name&sortOrder=Asc', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    assert(res.ok)

    const uploads = await res.json()
    const sortedUploads = [...userUploads].sort((a, b) => a.name.localeCompare(b.name))

    assert.deepStrictEqual(uploads, sortedUploads)
  })

  it('filters results by before date', async () => {
    const token = await getTestJWT()

    const beforeFilterDate = new Date('2021-07-10T00:00:00.000000+00:00').toISOString()
    const res = await fetch(new URL(`/user/uploads?before=${beforeFilterDate}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    assert(res.ok)

    const uploads = await res.json()

    assert(uploads.length < userUploads.length, 'Ensure some results are filtered out.')
    assert(uploads.length > 0, 'Ensure some results are returned.')

    // Filter uploads fixture by the filter date.
    const uploadsBeforeFilterDate = userUploads.filter((upload) => {
      return upload.created <= beforeFilterDate
    })

    assert.deepStrictEqual(uploads, [...uploadsBeforeFilterDate])
  })

  it('lists uploads via magic auth', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('/user/uploads', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads)
  })

  it('paginates by page', async () => {
    const token = await getTestJWT()
    const size = 1
    const page = 2
    const res = await fetch(new URL(`/user/uploads?size=${size}&page=${page}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)

    // Ensure we have all pagination metadata in the headers.
    const link = res.headers.get('link')
    assert(link, 'has a link header for the next page')
    assert.strictEqual(link, `</user/uploads?size=${size}&page=${page + 1}>; rel="next", </user/uploads?size=${size}&page=${Math.ceil(userUploads.length / size)}>; rel="last", </user/uploads?size=${size}&page=1>; rel="first", </user/uploads?size=${size}&page=${page - 1}>; rel="previous"`)

    // Should get second result (page 2).
    const uploads = await res.json()
    const expected = [userUploads[1]]
    assert.deepStrictEqual(uploads, expected)
  })

  it('does not paginate when all results are returned', async () => {
    const token = await getTestJWT()
    const size = 1000
    const res = await fetch(new URL(`/user/uploads?size=${size}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)

    const uploads = await res.json()
    const expected = userUploads
    assert.deepStrictEqual(uploads, expected)
  })
})

describe('GET /user/upload/:cid', () => {
  it('gets a single upload', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL(`/user/uploads/${userUploads[0].cid}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const uploads = await res.json()
    assert.deepStrictEqual(uploads, userUploads[0])
  })

  it('returns 404 when no upload is found', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('/user/uploads/notfound', endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 404)
  })
})

describe('DELETE /user/uploads/:cid', () => {
  it('error if not authenticated with magic.link', async () => {
    const token = await getTestJWT()
    const res = await fetch(new URL('user/uploads/bafybeibq5kfbnbvjgjg6bop4anhhaqopkc7t6mp2v3er3fkcv6ezhgvavg', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('error if no auth header', async () => {
    const res = await fetch(new URL('user/uploads/bafybeibq5kfbnbvjgjg6bop4anhhaqopkc7t6mp2v3er3fkcv6ezhgvavg', endpoint), {
      method: 'DELETE'
    })
    assert(!res.ok)
    assert.strictEqual(res.status, 401)
  })

  it('removes an upload', async function () {
    const token = AuthorizationTestContext.use(this).createUserToken()
    const res = await fetch(new URL('user/uploads/bafkreiajkbmpugz75eg2tmocmp3e33sg5kuyq2amzngslahgn6ltmqxxfa', endpoint), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    assert(res.ok)
    const { _id } = await res.json()
    assert(_id)
  })
})

describe('GET /user/pins', () => {
  it('accepts the `size` and `page` options', async () => {
    const size = 1
    const opts = new URLSearchParams({
      page: (1).toString(),
      size: size.toString(),
      status: 'queued,pinning,pinned,failed'
    })
    const token = await getTestJWT('test-pinning', 'test-pinning')
    const res = await fetch(new URL(`user/pins?${opts}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    assert(res.ok)
    const body = (await res.json())
    assert.equal(body.results.length, size)
    assert.equal(res.headers.get('size'), size)
    assert.strictEqual(res.headers.get('link'), '</user/pins?size=1&page=2>; rel="next", </user/pins?size=1&page=8>; rel="last", </user/pins?size=1&page=1>; rel="first"')
  })
  it('returns the correct headers for pagination', async () => {
    const size = 1
    const page = 2
    const opts = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      status: 'queued,pinning,pinned,failed'
    })
    const token = await getTestJWT('test-pinning', 'test-pinning')
    const res = await fetch(new URL(`user/pins?${opts}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    assert(res.ok)
    const body = await res.json()
    assert.equal(body.results.length, size)
    assert.equal(res.headers.get('size'), size)
    assert(res.headers.get('count'))
    assert.equal(res.headers.get('page'), page)
    assert.strictEqual(res.headers.get('link'), '</user/pins?size=1&page=3>; rel="next", </user/pins?size=1&page=8>; rel="last", </user/pins?size=1&page=1>; rel="first", </user/pins?size=1&page=1>; rel="previous"')
  })
  it('returns all pins regardless of the token used', async () => {
    const opts = new URLSearchParams({
      status: 'queued,pinning,pinned,failed'
    })
    const token = await getTestJWT('test-pinning', 'test-pinning')
    const res = await fetch(new URL(`user/pins?${opts}`, endpoint).toString(), {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    })

    assert(res.ok)
    const body = await res.json()
    assert.equal([...new Set(body.results.map(x => x.pin.authKey))].length, 2)
  })
})

describe('userLoginPost', function () {
  it('brand new users have a storageSubscription with price=free', async function () {
    const user1Authentication = {
      issuer: `user1-${Math.random().toString().slice(2)}`,
      publicAddress: `user1-${Math.random().toString().slice(2)}`,
      email: 'user1@example.com'
    }
    const env = {
      MODE: /** @type {const} */ ('rw'),
      db: getDBClient(),
      magic: new Magic(process.env.MAGIC_SECRET_KEY),
      authenticateRequest: async () => user1Authentication,
      customers: createMockCustomerService(),
      subscriptions: createMockSubscriptionsService()
    }
    const request = new Request(new URL('/user/login', endpoint).toString(), {
      method: 'post',
      body: JSON.stringify({
        data: {}
      })
    })
    const response = await userLoginPost(request, env)
    assert.equal(response.status, 200, 'response.status is as expected')

    // now ensure it has desired subscription
    const gotUser = await env.db.getUser(user1Authentication.issuer, {})
    const gotSubscription = await env.subscriptions.getSubscription(
      (await env.customers.getOrCreateForUser({ id: gotUser._id })).id
    )
    assert.ok(!(gotSubscription instanceof Error), 'gotSubscription is not an error')
    assert.ok(gotSubscription, 'gotSubscription is truthy')
    assert.equal(gotSubscription.storage?.price, storagePriceNames.free)
  })
})
