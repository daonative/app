import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useCollection, useCollectionData, useDocument } from 'react-firebase-hooks/firestore';

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
import { useForm } from 'react-hook-form';

const db = getFirestore()

const getMembers = async (roomId) => {
  const membershipsRef = collection(db, 'memberships')
  const membershipsQuery = query(membershipsRef, where('roomId', '==', roomId))
  const snapshot = await getDocs(membershipsQuery)
  return snapshot.docs.map((doc) => ({ membershipId: doc.id, ...doc.data() }))
}

const getFeed = async (roomId) => {
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

const getRoom = async (roomId) => {
  const roomRef = doc(db, 'rooms', roomId)
  const roomSnap = await getDoc(roomRef)

  if (!roomSnap.exists()) {
    return null
  }

  return {
    ...roomSnap.data(),
    roomId: roomSnap.id
  }
}

export const getServerSideProps = async ({ params }) => {
  const { daoId: roomId } = params
  const members = await getMembers(roomId)
  const feed = await getFeed(roomId)
  const room = await getRoom(roomId)

  return {
    props: { members, feed, dao: room }
  }
}

const Mission = ({ roomId, mission }) => {
  const [showForm, setShowForm] = useState(false)
  const [currentMission, setCurrentMission] = useState(mission)
  const { register, handleSubmit } = useForm({ defaultValues: { mission } })

  const setMission = async (data) => {
    const { mission } = data
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, { mission })

    setCurrentMission(mission)
    setShowForm(false)
  }

  const handleEditClick = () => setShowForm(true)

  if (showForm) {
    return (
      <form onSubmit={handleSubmit(setMission)}>
        <input type="text" {...register('mission')} className="md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-daonative-dark-100 dark:border-transparent dark:text-daonative-gray-300" />
      </form>
    )
  }

  return (
    <p className="py-2 text-sm">
      <span onClick={handleEditClick} className="hover:cursor-pointer">
        {currentMission || "Write your mission here..."}
      </span>
    </p >
  )
}

export default function Dashboard({ members: initialMembers, feed: initialFeed, dao: initialDAO }) {
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true)
  const [daoSnapshot] = useDocument(doc(db, 'rooms', roomId))
  const [feedSnapshot] = useCollection(
    query(collection(db, 'feed'), where('roomId', '==', roomId), orderBy('created', 'desc'))
  )
  const [membersSnapshot] = useCollection(
    query(collection(db, 'memberships'), where('roomId', '==', roomId))
  )

  const dao = daoSnapshot ? {
    ...daoSnapshot.data(),
    roomId: daoSnapshot.id
  } : initialDAO

  const feed = feedSnapshot?.docs.map((doc) => {
    const event = doc.data()
    return {
      ...event,
      created: isFirestoreDate(event?.created) ? event.created.toMillis() : '',
      eventId: doc.id
    }
  }) || initialFeed

  const members = membersSnapshot?.docs.map((doc) => {
    const membership = doc.data()
    const totalPraise = feed
      .filter(event => event.authorAccount === membership.account)
      .filter(event => event.praises?.length > 0)
      .map(event => event.praises.reduce((totalPraiseAmount, currentPraise) => totalPraiseAmount + currentPraise.praise, 0))
      .reduce((totalPraiseAmount, currentPraiseAmount) => totalPraiseAmount + currentPraiseAmount, 0)
    return {
      membershipId: doc.id,
      totalPraise,
      ...membership
    }
  }) || initialMembers

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
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-daonative-gray-200">{dao.name}</h1>
              <Mission roomId={roomId} mission={dao.mission} />
            </div>
            <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
              <KPIs roomId={roomId} kpis={dao.kpis} />
            </div>
            <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
              <Feed roomId={roomId} feed={feed} kpis={dao.kpis} />
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