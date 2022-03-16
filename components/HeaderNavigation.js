import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, MenuAlt2Icon, MoonIcon, SunIcon } from '@heroicons/react/solid';
import { useConnectWalletModal } from './ConnectWalletModal';
import { useWallet } from 'use-wallet';
import useIsConnected from '../lib/useIsConnected';
import ShortAddress from './ShortAddress';
import { useForm } from 'react-hook-form';
import { useRequireAuthentication } from '../lib/authenticate';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Spinner from './Spinner';
import useMembership from '../lib/useMembership';
import PFP from './PFP';
import useUser from '../lib/useUser';

import PolygonLogo from '../public/PolygonLogo.svg'
import EthereumLogo from '../public/EthereumLogo.svg'

const ChainLogo = ({chainId, className}) => {
  if (chainId === 137)
    return <PolygonLogo className={className} />

  if (chainId === 1)
    return <EthereumLogo className={className} />
  console.log(chainId)
  return <></>
}

const HeaderNavigation = ({ onShowSidebar, showLogWork = true }) => {
  const { openConnectWalletModal } = useConnectWalletModal()
  const { chainId, account, reset: disconnect } = useWallet()
  const isConnected = useIsConnected()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const requireAuthentication = useRequireAuthentication()
  const membership = useMembership(account, roomId)
  const user = useUser()
  const isMember = !!membership

  const logWork = async (data) => {
    await requireAuthentication()

    const db = getFirestore()
    const feedRef = collection(db, 'feed')

    await addDoc(feedRef, {
      roomId,
      description: data.work,
      authorAccount: account,
      authorName: membership?.name || null,
      created: serverTimestamp(),
      type: "work"
    })

    reset()
  }

  return (
    <div className="md:pl-64 flex flex-col ">
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-16  shadow bg-daonative-dark-200">
        <button
          type="button"
          className="px-4 border-r border-daonative-dark-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
          onClick={onShowSidebar}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex items-center">
            {showLogWork && isMember && (
              <form className="hidden md:flex" onSubmit={handleSubmit(logWork)}>
                <input
                  {...register("work")}
                  type="text"
                  className="md:w-96 border-none shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md bg-daonative-dark-100 text-daonative-gray-300"
                  placeholder="What did you do today?"
                />
                {isSubmitting ? (
                  <div
                    className="mx-2 inline-flex items-center px-4 py-2 border border-2 border-daonative-gray-100 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-dark-100 text-daonative-gray-100 w-24"
                  >
                    <span className="w-4 h-4 mx-auto"><Spinner /></span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="mx-2 w-max font-sans items-center px-4 py-2 border border-2 border-daonative-gray-100 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-dark-100 text-daonative-gray-100 "
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
              className="mx-2 bg-daonative-dark-100  p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {!isConnected && (
              <button
                className="font-sans flex h-8 px-2 items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500  bg-daonative-dark-100 text-daonative-gray-100 rounded-full"
                onClick={openConnectWalletModal}
              >
                Connect
              </button>
            )}

            {isConnected && (
              <Menu as="div" className="ml-2">
                <div>
                  <Menu.Button className="font-sans flex gap-2 px-2 h-8 items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-dark-100 text-daonative-gray-100 rounded-md">
                    <span className="sr-only">Open user menu</span>
                    <div className="border-r border-daonative-dark-300 h-full flex items-center pr-2">
                        <ChainLogo chainId={chainId} className="w-4 h-4"/>
                    </div>
                    <div>
                      {user ? (
                        <>{user.name}</>
                      ) : (
                        <ShortAddress>{account}</ShortAddress>
                      )}
                    </div>
                    <PFP address={account} size={24} />
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
                  <Menu.Items
                    style={{
                      boxShadow: '0px 0px 15px rgb(160 163 189 / 10%)',
                    }}
                    className=" origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1  ring-1 ring-black ring-opacity-5 focus:outline-none bg-daonative-dark-300 border-[1px] border-daonative-border">
                    <Menu.Item>
                      <button
                        className="font-sans block px-4 py-2 text-sm text-daonative-gray-100 w-full h-full"
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