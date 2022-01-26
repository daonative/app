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
import { useState } from 'react'

import SidebarNavigation from '../components/SidebarNavigation'
import HeaderNavigation from '../components/HeaderNavigation'
import KPIs from '../components/KPIs'
import Feed from '../components/Feed'
import Tasks from '../components/Tasks'

const people = [
  {
    name: 'Calvin Hawkins',
    email: 'calvin.hawkins@example.com',
    image:
      'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Kristen Ramos',
    email: 'kristen.ramos@example.com',
    image:
      'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Ted Fox',
    email: 'ted.fox@example.com',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

const People = () => (
  <ul role="list" className="divide-y divide-gray-200">
    {people.map((person) => (
      <li key={person.email} className="py-4 flex">
        <img className="h-10 w-10 rounded-full" src={person.image} alt="" />
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{person.name}</p>
          <p className="text-sm text-gray-500">{person.email}</p>
        </div>
      </li>
    ))}
  </ul>
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
          <main className="flex-row lg:grid lg:grid-cols-12">
            <div className="py-6 md:col-span-9">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">DAOnative</h1>
                <p className="py-2 text-sm">We help you focus on your community by making it easy to create, fund, and manage a DAO.</p>
              </div>
              <div className="py-4 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <KPIs />
              </div>
              <div className="py-4 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Feed />
              </div>
              <div className="py-4 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Tasks />
              </div>
            </div>
            <div className="py-4 max-w-md mx-auto px-4 sm:px-6 md:px-8">
              <People />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}