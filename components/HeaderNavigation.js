import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, MenuAlt2Icon, MoonIcon, SunIcon } from '@heroicons/react/solid';
import { useConnectWalletModal } from './ConnectWalletModal';
import { useWallet } from 'use-wallet';
import useIsConnected from '../lib/useIsConnected';
import ShortAddress from './ShortAddress';
import { useForm } from 'react-hook-form';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import authenticate from '../lib/authenticate';
import useProvider from '../lib/useProvider';
import { addDoc, collection, getFirestore, serverTimestamp, where, query } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import Spinner from './Spinner';

const auth = getAuth()
const db = getFirestore()

const HeaderNavigation = ({ onShowSidebar, onToggleDarkMode }) => {
  const { openConnectWalletModal } = useConnectWalletModal()
  const { account, reset: disconnect } = useWallet()
  const isConnected = useIsConnected()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [user] = useAuthState(auth)
  const provider = useProvider()
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const [memberships] = useCollectionDataOnce(
    query(collection(db, 'memberships'), where('account', '==', account || ''), where('roomId', '==', roomId))
  )
  const membership = memberships?.length > 0 && memberships[0]
  const isMember = !!membership

  const isAuthenticated = !!user

  const logWork = async (data) => {
    if (!isAuthenticated) {
      await authenticate(account, provider)
    }

    const db = getFirestore()
    const feedRef = collection(db, 'feed')

    await addDoc(feedRef, {
      roomId,
      description: data.work,
      authorAccount: account,
      authorName: membership?.name || null,
      created: serverTimestamp()
    })

    reset()
  }

  return (
    <div className="md:pl-64 flex flex-col">
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow dark:bg-daonative-dark-200">
        <button
          type="button"
          className="px-4 border-r border-gray-200 dark:border-daonative-dark-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
          onClick={onShowSidebar}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex items-center">
            {isMember && (
              <form className="invisible md:visible flex" onSubmit={handleSubmit(logWork)}>
                <input
                  {...register("work")}
                  type="text"
                  className="md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-daonative-dark-100 dark:border-transparent dark:text-daonative-gray-300"
                  placeholder="What did you do today?"
                />
                {isSubmitting ? (
                  <div
                    className="mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-daonative-dark-100 dark:text-daonative-gray-100 w-24"
                  >
                    <span className="w-4 h-4 mx-auto"><Spinner /></span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-daonative-dark-100 dark:text-daonative-gray-100 w-24"
                  >
                    Log work
                  </button>
                )}
              </form>
            )}
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <button
              type="button"
              className="mx-2 dark:bg-daonative-dark-100 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            <button
              type="button"
              className="mx-2 dark:bg-daonative-dark-100 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onToggleDarkMode}
            >
              <span className="sr-only">Toggle dark or light mode</span>
              <MoonIcon className="h-6 w-6 hidden dark:block" aria-hidden="true" />
              <SunIcon className="h-6 w-6 dark:hidden" aria-hidden="true" />
            </button>

            {!isConnected && (
              <button
                className="flex h-8 px-2 items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500  dark:bg-daonative-dark-100 dark:text-daonative-gray-100 rounded-full"
                onClick={openConnectWalletModal}
              >
                Connect
              </button>
            )}

            {isConnected && (
              <Menu as="div" className="ml-2 relative">
                <div>
                  <Menu.Button className="flex items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500  dark:bg-daonative-dark-100 dark:text-daonative-gray-100 rounded-full">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://ipfs.io/ipfs/Qmc1DJWoEsVkjbJsMCnceFH1roF8QSnwK7iEhRKiBDqy9d"
                      alt="" />
                    <div className="px-2">
                      <ShortAddress>{account}</ShortAddress>
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      <button
                        className="block px-4 py-2 text-sm text-gray-700 w-full h-full"
                        onClick={disconnect}
                      >
                        Disconnect
                      </button>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderNavigation