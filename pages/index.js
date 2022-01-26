/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import {
  BeakerIcon,
  BellIcon,
  ChartBarIcon,
  ChevronUpIcon,
  MenuAlt2Icon,
  SearchIcon
} from '@heroicons/react/solid'
import SidebarNavigation from '../components/SidebarNavigation'
import Moment from 'react-moment'

const userNavigation = [
  { name: 'Disconnect', href: '#' },
]

const HeaderNavigation = ({ onShowSidebar }) => {
  return (
    <div className="md:pl-64 flex flex-col">
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
        <button
          type="button"
          className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
          onClick={onShowSidebar}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex">
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <button
              type="button"
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="ml-3 relative">
              <div>
                <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
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
                  {userNavigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <a
                          href={item.href}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          {item.name}
                        </a>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}

const feed = [
  { description: 'Deployed app.daonative.xyz', pfp: 'https://ipfs.io/ipfs/Qmc1DJWoEsVkjbJsMCnceFH1roF8QSnwK7iEhRKiBDqy9d', author: 'Laurent', date: new Date() },
  { description: 'Landed our first user interview', pfp: 'https://ipfs.io/ipfs/QmbvBgaAqGVAs3KiEgsuDY2u4BUnuA9ueG96NFSPK4z6b6', author: 'Ben', date: new Date() },
]

const Feed = () => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Feed
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {feed.map((event, eventIdx) => (
                  <tr key={event.email} className={eventIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <img className="h-10 w-10 rounded-full" src={event.pfp} alt="" />
                        {event.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Moment date={event.date} fromNowDuring={1000} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const KPIs = () => (
  <div className="grid grid-cols-3 py-4 gap-6">
    <div className="bg-gray-100 rounded-lg flex gap-4 p-4">
      <div className="h-min rounded-full bg-blue-100 p-4">
        <ChartBarIcon className="h-8 text-blue-500" />
      </div>
      <div>
        <div>
          <span className="font-bold">10</span>
        </div>
        <div>
          <span className="">DAOs organized</span>
        </div>
        <div>
          <span>
            <ChevronUpIcon className="h-5 text-green-600 inline-block" />
          </span>
          <span className="text-sm text-green-600">25%</span>{' '}
          <span className="text-sm">last month</span>
        </div>
      </div>
    </div>
    <div className="bg-gray-100 rounded-lg flex gap-4 p-4">
      <div className="h-min rounded-full bg-blue-100 p-4">
        <ChartBarIcon className="h-8 text-blue-500" />
      </div>
      <div>
        <div>
          <span className="font-bold">10</span>
        </div>
        <div>
          <span className="">DAOs organized</span>
        </div>
        <div>
          <span>
            <ChevronUpIcon className="h-5 text-green-600 inline-block" />
          </span>
          <span className="text-sm text-green-600">25%</span>{' '}
          <span className="text-sm">last month</span>
        </div>
      </div>
    </div>
    <div className="bg-gray-100 rounded-lg flex gap-4 p-4">
      <div className="h-min rounded-full bg-blue-100 p-4">
        <ChartBarIcon className="h-8 text-blue-500" />
      </div>
      <div>
        <div>
          <span className="font-bold">10</span>
        </div>
        <div>
          <span className="">DAOs organized</span>
        </div>
        <div>
          <span>
            <ChevronUpIcon className="h-5 text-green-600 inline-block" />
          </span>
          <span className="text-sm text-green-600">25%</span>{' '}
          <span className="text-sm">last month</span>
        </div>
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div>
        <SidebarNavigation showMobile={showSidebarMobile} onClose={() => setShowSidebarMobile(false)} />
        <HeaderNavigation onShowSidebar={() => setShowSidebarMobile(true)} />
        <div className="md:pl-64 flex flex-col">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">DAOnative</h1>
                <p className="py-4 text-sm">We help you focus on your community by making it easy to create, fund, and manage a DAO.</p>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">KPIs</h1>
                <KPIs />
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Feed />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}