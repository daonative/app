import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import useLocalStorage from '../../../lib/useLocalStorage'
import { isFirestoreDate } from '../../../lib/utils';

import SidebarNavigation from '../../../components/SidebarNavigation'
import HeaderNavigation from '../../../components/HeaderNavigation'
import KPIs from '../../../components/KPIs'
import Feed from '../../../components/Feed'
import Tasks from '../../../components/Tasks'
import Members from '../../../components/Members'
import TreasuryChart from '../../../components/TreasuryChart'
import UpcomingEvents from '../../../components/UpcomingEvents'

const db = getFirestore()

const getMembers = async (roomId) => {
  const db = getFirestore()
  const membershipsRef = collection(db, 'memberships')
  const membershipsQuery = query(membershipsRef, where('roomId', '==', roomId))
  const snapshot = await getDocs(membershipsQuery)
  return snapshot.docs.map((doc) => ({ membershipId: doc.id, ...doc.data()}))
}

const getFeed = async (roomId) => {
  const db = getFirestore()
  const feedRef = collection(db, 'feed')
  const feedQuery = query(feedRef, where('roomId', '==', roomId), orderBy('created', 'desc'))
  const snapshot = await getDocs(feedQuery)
  return snapshot.docs.map((doc) => {
    const item = doc.data()
    return {
      ...item,
      created: isFirestoreDate(item?.created) ? item.created.toMillis() : '',
      eventId: doc.id
    }
  })
}

export const getServerSideProps = async ({ params }) => {
  const { daoId: roomId } = params
  const members = await getMembers(roomId)
  const feed = await getFeed(roomId)

  return {
    props: { members, feed }
  }
}

export default function Dashboard({ members, feed }) {
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true)
  const [newFeedItems] = useCollectionData(
    query(collection(db, 'feed'), where('roomId', '==', roomId), orderBy('created', 'desc'))
  )

  const feedEvents = newFeedItems?.map((event) => ({
    ...event,
    created: isFirestoreDate(event?.created) ? event.created.toMillis() : '',
  })) || feed

  const onShowMobileSidebar = () => setShowSidebarMobile(true)
  const onToggleDarkMode = () => setDarkMode(!darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <>
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
              <Feed feed={feedEvents} />
            </div>
            <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
              <Tasks />
            </div>
          </main>
          <aside className="w-full md:max-w-xs md:py-6">
            <div className="px-4">
              <UpcomingEvents />
            </div>
            <div className="py-4 px-4">
              <TreasuryChart />
            </div>
            <div className="py-4 px-4">
              <Members members={members} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}