import { Fragment, } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  CalendarIcon,
  CollectionIcon,
  HomeIcon,
  UsersIcon,
  XIcon,
  LightningBoltIcon,
  FireIcon,
  HeartIcon,
} from '@heroicons/react/solid'

import DAOnativeLogo from '../public/DAOnativeLogo.svg'
import ConnectWalletButton from '../components/ConnectWalletButton'
import ComingSoonBadge from './ComingSoonBadge'
import { useRouter } from 'next/router'
import Link from 'next/link'
import PolygonWarning from './ChainWarning'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const SidebarNavigation = ({ showMobile, onClose }) => {
  const { query, asPath } = useRouter()
  const roomId = query.daoId

  const dashboardUrl = roomId ? `/dao/${roomId}` : '/'
  const challengesUrl = roomId ? `/dao/${roomId}/challenges` : '/'
  const leaderboardUrl = roomId ? `/dao/${roomId}/leaderboard` : '/'
  const nftsUrl = roomId ? `/dao/${roomId}/nfts` : '/nfts'

  const navigation = [
    { name: 'Dashboard', href: dashboardUrl, icon: HomeIcon, match: "^/dao/[a-zA-Z0-9]*$|\/$" },
    { name: 'Challenges', disabled: !roomId, href: challengesUrl, icon: LightningBoltIcon, match: "^/dao/[a-zA-Z0-9]*/challenges(/[a-zA-Z0-9]*)?$" },
    { name: 'Leaderboard', disabled: !roomId, href: leaderboardUrl, icon: FireIcon, match: "^/dao/[a-zA-Z0-9]*/leaderboard$" },
    //{ name: 'Members', href: `/dao/${roomId}/members`, icon: UsersIcon },
    { name: 'NFTs', href: nftsUrl, icon: CollectionIcon, match: "^/(dao/[a-zA-Z0-9]*/nfts|nfts)(/[a-zA-Z0-9]*)?$" },
    { name: 'Rewards', disabled: true, comingSoon: true, href: '#', icon: HeartIcon },
    { name: 'Events', disabled: true, comingSoon: true, href: '#', icon: CalendarIcon },
    { name: 'Members', disabled: true, comingSoon: true, href: '#', icon: UsersIcon },
  ]

  return (
    <>
      <Transition.Root show={showMobile} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-800 bg-daonative-dark-200">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-shrink-0 flex justify-center items-center p-4 mx-2 border-b border-daonative-dark-100">
                <div className="h-8 w-8">
                  <DAOnativeLogo />
                </div>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => {
                    const current = !item.disabled && !!asPath.match(item.match)
                    return (
                      // eslint-disable-next-line jsx-a11y/anchor-is-valid
                      <Link key={item.name} href={item.disabled ? "" : item.href}>
                        <a
                          className={classNames(
                            current ? 'bg-daonative-dark-100 text-daonative-gray-100' : 'text-daonative-gray-300 hover:bg-daonative-dark-300 hover:text-daonative-gray-100',
                            'group flex justify-between px-2 py-2 text-sm font-medium rounded-md',
                            item.disabled && 'opacity-50'
                          )}
                        >
                          <div className="flex items-center">
                            <item.icon
                              className={classNames(
                                current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                                'mr-3 flex-shrink-0 h-6 w-6'
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </div>
                          <div>
                            {item.comingSoon && <ComingSoonBadge />}
                          </div>
                        </a>
                      </Link>
                    )
                  })}
                </nav>
                <div className="py-5 px-4 flex flex-col gap-2">
                  {/*<PolygonWarning />*/}
                  <div className="h-14">
                    <ConnectWalletButton />
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex-1 flex flex-col min-h-0 bg-daonative-dark-200">
          <div className="flex-shrink-0 flex justify-center items-center p-4 mx-2 border-b border-daonative-dark-100">
            <div className="h-8 w-8">
              <DAOnativeLogo />
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const current = !item.disabled && !!asPath.match(item.match)
                return (
                  // eslint-disable-next-line jsx-a11y/anchor-is-valid
                  <Link key={item.name} href={item.disabled ? "" : item.href}>
                    <a
                      key={item.name}
                      className={classNames(
                        current ? 'bg-daonative-dark-100 text-daonative-gray-100' : 'text-daonative-gray-300 hover:bg-daonative-dark-300 hover:text-daonative-gray-100',
                        'group flex justify-between px-2 py-2 text-sm font-medium rounded-md',
                        item.disabled && 'opacity-50'
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={classNames(
                            current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                            'mr-3 flex-shrink-0 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                      <div>
                        {item.comingSoon && <ComingSoonBadge />}
                      </div>
                    </a>
                  </Link>
                )
              })}
            </nav>
            <div className="py-5 px-4 flex flex-col gap-2">
              {/*<PolygonWarning />*/}
              <div className="h-14">
                <ConnectWalletButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SidebarNavigation