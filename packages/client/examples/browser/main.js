import { Web3Storage, Web3File } from 'web3.storage'

const endpoint = 'https://api.web3.storage' // the default
const token =
  new URLSearchParams(window.location.search).get('key') || 'API_KEY' // your API key from https://web3.storage/manage

async function main() {
  const storage = new Web3Storage({ endpoint, token })

  const files = prepareFiles()

  // send the files to web3.storage
  const cid = await storage.put(files)

  // TODO
  console.log('added', cid)
  // check that the CID is pinned
  // const status = await store.status(cid)
  // log(status)
}

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

main()
