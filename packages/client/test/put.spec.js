import * as assert from 'uvu/assert'
import randomBytes from 'randombytes'
import { Web3Storage, Web3File } from 'web3.storage'

describe('put', () => {
  const { AUTH_TOKEN, API_PORT } = process.env
  const token = AUTH_TOKEN || 'good'
  const endpoint = new URL(API_PORT ? `http://localhost:${API_PORT}` : '')

  it('errors without token', async () => {
    // @ts-ignore
    const client = new Web3Storage({ endpoint })
    const files = prepareFiles()
    try {
      await client.put(files)
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.is(err.message, 'missing token')
    }
  })

  it('errors without content', async () => {
    const client = new Web3Storage({ endpoint, token })
    try {
      await client.put([])
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /input could not be parsed correctly/)
    }
  })

  it('erros with a File that will not be parsed by the Cluster', async function () {
    const client = new Web3Storage({ token, endpoint })
    try {
      await client.put([Web3File.fromText('test-put-fail', 'file.txt')], { maxRetries: 1 })
      assert.unreachable('should have thrown')
    } catch (err) {
      assert.match(err.message, /Request body not a valid CAR file/)
    }
  })

  it('adds Files', async () => {
    const client = new Web3Storage({ token, endpoint })
    const files = prepareFiles()
    const cid = await client.put(files)
    assert.equal(cid, 'bafybeic2rh2it5qegfxbctenw5req2kqxleujl2zu352nmtb6qx3pmji6e', 'returned cid matches the CAR')
  })

  it('adds Big Files', async function () {
    this.timeout(25e3)
    const client = new Web3Storage({ token, endpoint })
    let uploadedChunks = 100

    const files =[
      Web3File.fromBytes(randomBytes(1024e6))
    ]

    await client.put(files, {
      onStoredChunk: () => {
        uploadedChunks++
      }
    })
    assert.ok(uploadedChunks >= 100)
  })
})

function prepareFiles () {
  const data = 'Hello web3.storage!'
  const data2 = 'Hello web3.storage!!'

  return [
    Web3File.fromText(
      data,
      'data.zip',
      { path: '/dir/data.zip' }
    ),
    Web3File.fromText(
      data2,
      'data2.zip',
      { path: '/dir/data2.zip' }
    ),
    Web3File.fromText(
      data,
      'data.zip',
      { path: '/dir/otherdir/data.zip' }
    ),
    Web3File.fromText(
      data2,
      'data2.zip',
      { path: '/dir/otherdir/data2.zip' }
    )
  ]
}
