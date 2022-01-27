import { useState, useEffect } from 'react'

import useLocalStorage from '../lib/useLocalStorage'

import SidebarNavigation from '../components/SidebarNavigation'
import HeaderNavigation from '../components/HeaderNavigation'
import KPIs from '../components/KPIs'
import Feed from '../components/Feed'
import Tasks from '../components/Tasks'
import Members from '../components/Members'
import TreasuryChart from '../components/TreasuryChart'
import UpcomingEvents from '../components/UpcomingEvents'

export default function Dashboard() {
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true)

  const onShowMobileSidebar = () => setShowSidebarMobile(true)
  const onToggleDarkMode = () => setDarkMode(!darkMode)

  useEffect(() => {
    console.log(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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
        <HeaderNavigation onShowSidebar={onShowMobileSidebar} onToggleDarkMode={onToggleDarkMode} />
        <div className="md:pl-64 flex-row md:flex overflow-hidden dark:bg-daonative-dark-300 dark:text-daonative-gray-100">
          <main className="w-full py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-daonative-gray-200">DAOnative</h1>
              <p className="py-2 text-sm">We help you focus on your community by making it easy to create, fund, and manage a DAO.</p>
            </div>
            <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
              <KPIs />
            </div>
            <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
              <Feed />
            </div>
            <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
              <Tasks />
            </div>
          </main>
          <aside className="py-6 w-full md:max-w-xs">
            <div className="py-4 px-4">
              <UpcomingEvents />
            </div>
            <div className="py-4 px-4">
              <TreasuryChart />
            </div>
            <div className="py-4 px-4">
              <Members />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}