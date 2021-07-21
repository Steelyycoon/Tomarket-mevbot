import Router from 'next/router'
import Link from 'next/link'
import { getMagic } from '../lib/magic.js'
import { useQueryClient } from 'react-query'
import Button from './button.js'

/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 * @param {any} [props.user]
 */
export default function Navbar({ bgColor = 'white', user }) {
  const queryClient = useQueryClient()
  async function logout() {
    await getMagic().user.logout()
    await queryClient.invalidateQueries('magic-user')
    Router.push('/')
  }

  return (
    <nav className={`bg-${bgColor} w-full border border-gray-400`}>
      <div className="flex items-center justify-between py-3 mx-auto max-w-screen-2xl">
        <Link href="/">
          <a title="Web3 Storage">⁂</a>
        </Link>
        <div>
          <Link href="/about">
            <a className="text-black font-bold no-underline hover:underline align-middle mr-12">
              About
            </a>
          </Link>
          <a href="https://web3-storage-docs.on.fleek.co/" className="text-black font-bold no-underline hover:underline align-middle mr-12">
            Documentation
          </a>
          {user ? (
            <>
              <Link href="/files">
                <a className="text-black font-bold no-underline hover:underline align-middle mr-12">
                  Files
                </a>
              </Link>
              <Link href="/profile">
                <a className="text-black font-bold no-underline hover:underline align-middle mr-12">
                  Profile
                </a>
              </Link>
            </>
          ) : null}
          {user ? (
            <Button onClick={logout} id="logout" wrapperClassName="inline-block">
              Logout
            </Button>
          ) : (
            <Button href="/login" id="login" wrapperClassName="inline-block" rounded>
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
