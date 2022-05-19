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
  CogIcon
} from '@heroicons/react/solid'

import DAOnativeLogo from '../public/DAOnativeLogo.svg'
import ComingSoonBadge from './ComingSoonBadge'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useWallet } from '@/lib/useWallet'
import { UserAvatar, UserName } from './PFP'
import { useProfileModal } from './ProfileModal'
import { ConnectButton } from '@rainbow-me/rainbowkit'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const ProfileButton = () => {
  const { openProfileModal } = useProfileModal()
  const { account } = useWallet()
  const isConnected = !!account

  if (!isConnected)
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            className="font-sans rounded-lg text-gray-100 bg-daonative-dark-900 hover:bg-daonative-dark-300 hover:text-daonative-gray-200 flex items-center h-full w-full p-4"
            onClick={openConnectModal}
          >
            Connect
          </button>
        )}
      </ConnectButton.Custom>
    )

  return (
    <>
      <button
        className="font-sans rounded-lg text-gray-100 bg-daonative-dark-900 hover:bg-daonative-dark-300 hover:text-daonative-gray-200 flex items-center h-full w-full p-4 gap-4"
        onClick={openProfileModal}
      >
        <UserAvatar account={account} />
        <UserName account={account} />
      </button>
    </>
  )
}


const SidebarNavigation = ({ showMobile, onClose }) => {
  const { query, asPath } = useRouter()
  const roomId = query.daoId
  const path = asPath?.split('?')[0] || ''

  const dashboardUrl = roomId ? `/dao/${roomId}` : '/'
  const challengesUrl = roomId ? `/dao/${roomId}/challenges` : '/'
  const leaderboardUrl = roomId ? `/dao/${roomId}/leaderboard` : '/'
  const rewardsUrl = roomId ? `/dao/${roomId}/rewards` : '/'
  //const workUrl = roomId ? `/dao/${roomId}/work` : '/'
  const nftsUrl = roomId ? `/dao/${roomId}/nfts` : '/nfts'

  const navigation = [
    { name: 'Dashboard', href: dashboardUrl, icon: HomeIcon, match: "^/dao/[a-zA-Z0-9]*$|/$" },
    { name: 'Challenges', disabled: !roomId, href: challengesUrl, icon: LightningBoltIcon, match: "^/dao/[a-zA-Z0-9]*/challenges(/[a-zA-Z0-9/]*)?$" },
    { name: 'Leaderboard', disabled: !roomId, href: leaderboardUrl, icon: FireIcon, match: "^/dao/[a-zA-Z0-9]*/leaderboard$" },
    { name: 'Members', disabled: !roomId, href: `/dao/${roomId}/members`, icon: UsersIcon, match: "^/dao/[a-zA-Z0-9]*/members$" },
    { name: 'Rewards', disabled: !roomId, href: rewardsUrl, icon: HeartIcon, match: "^/dao/[a-zA-Z0-9]*/rewards$" },
    // { name: 'Work', disabled: !roomId, href: workUrl, icon: BriefcaseIcon, match: "^/dao/[a-zA-Z0-9]*/work$" },
    { name: 'NFTs', href: nftsUrl, icon: CollectionIcon, match: "^/(dao/[a-zA-Z0-9]*/nfts|nfts)(/[0-9]*/[a-zA-Z0-9]*(/mint)?)?$" },
    { name: 'Settings', disabled: false, comingSoon: false, href: '#', icon: CogIcon },
    { name: 'Events', disabled: true, comingSoon: true, href: '#', icon: CalendarIcon },
    // { name: 'Members', disabled: false, comingSoon: true, href: '#', icon: UsersIcon },
  ]

  const NavLink = ({ disabled = false, href, current, children }) => (
    <>
      {disabled ? (
        <a
          className={classNames(
            current ? 'bg-daonative-component-bg text-daonative-gray-100' : 'text-daonative-gray-300 hover:bg-daonative-dark-300 hover:text-daonative-gray-100',
            'group flex justify-between px-2 py-2 text-sm font-medium rounded-md opacity-50'
          )}
        >
          {children}
        </a>
      ) : (
        <Link href={href} >
          <a
            className={classNames(
              current ? 'bg-daonative-component-bg text-daonative-gray-100' : 'text-daonative-gray-300 hover:bg-daonative-dark-300 hover:text-daonative-gray-100',
              'group flex justify-between px-2 py-2 text-sm font-medium rounded-md'
            )}
          >
            {children}
          </a>
        </Link>
      )}
    </>
  )

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
              <div className="flex-shrink-0 flex justify-center items-center p-4 mx-2 border-daonative-component-bg">
                <Link href="/">
                  <a>
                    <div className="h-8 w-8 fill-daonative-white">
                      <DAOnativeLogo />
                    </div>
                  </a>
                </Link>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => {
                    const current = !item.disabled && !!path.match(item.match)
                    return (
                      <NavLink key={item.name} current={current} disabled={item.disabled} href={item.href}>
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
                      </NavLink>
                    )
                  })}
                </nav>
                <div className="py-5 px-4 flex flex-col gap-2">
                  <div className="h-14">
                    <ProfileButton />
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
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 rounded-lg">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex-1 flex flex-col min-h-0 rounded-lg">
          <div className="flex-shrink-0 flex justify-center items-center p-4 mx-2  border-daonative-component-bg">
            <Link href="/">
              <a>
                <div className="h-8 w-8 fill-daonative-white">
                  <DAOnativeLogo />
                </div>
              </a>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const current = !item.disabled && !!path.match(item.match)
                return (
                  <NavLink key={item.name} current={current} disabled={item.disabled} href={item.href}>
                    <div className="flex items-center font-semibold tracking-wide">
                      <item.icon
                        className={classNames(
                          current ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                          'mr-3 flex-shrink-0 h-6 w-6 font-bold'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                    <div>
                      {item.comingSoon && <ComingSoonBadge />}
                    </div>
                  </NavLink>
                )
              })}
            </nav>
            <div className="py-5 px-4 flex flex-col gap-2">
              <div className="h-14">
                <ProfileButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SidebarNavigation