import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';

import useLocalStorage from '../../../lib/useLocalStorage'

import SidebarNavigation from '../../../components/SidebarNavigation'
import HeaderNavigation from '../../../components/HeaderNavigation'
import useMembership from '../../../lib/useMembership';
import { useWallet } from 'use-wallet';

const db = getFirestore()

export const getServerSideProps = async ({ params }) => {
  const { daoId: roomId } = params
  const room = await getRoom(roomId)

  return {
    props: { dao: room }
  }
}

const Mission = ({ roomId, mission }) => {
  const [showForm, setShowForm] = useState(false)
  const [currentMission, setCurrentMission] = useState(mission)
  const { register, handleSubmit } = useForm({ defaultValues: { mission } })
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const isMember = !!membership

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
      {isMember ? (
        <span onClick={handleEditClick} className="hover:cursor-pointer">
          {currentMission || "Write your mission here..."}
        </span>
      ) : (
        <>{currentMission}</>
      )}
    </p >
  )
}

export default function Dashboard({ members: initialMembers, feed: initialFeed, dao: initialDAO }) {
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true)
  const [daoSnapshot] = useDocument(doc(db, 'rooms', roomId))

  const dao = daoSnapshot ? {
    ...daoSnapshot.data(),
    roomId: daoSnapshot.id
  } : initialDAO

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
          </main>
        </div>
      </div>
    </>
  )
}