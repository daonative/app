import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useCollection, useCollectionData, useDocument } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';

import useLocalStorage from '../../../lib/useLocalStorage'
import { isFirestoreDate } from '../../../lib/utils';

import SidebarNavigation from '../../../components/SidebarNavigation'
import HeaderNavigation from '../../../components/HeaderNavigation'
import KPIs from '../../../components/KPIs'
import Feed from '../../../components/Feed'
import TasksTable from '../../../components/TasksTable'
import Members from '../../../components/Members'
import Treasury from '../../../components/Treasury'
import UpcomingEvents from '../../../components/UpcomingEvents'
import useMembership from '../../../lib/useMembership';
import { useWallet } from 'use-wallet';
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../components/Modal';
import Spinner from '../../../components/Spinner';
import { useRequireAuthentication } from '../../../lib/authenticate';

const db = getFirestore()

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
  const feed = await getFeed(roomId)
  const room = await getRoom(roomId)

  return {
    props: { feed, dao: room }
  }
}

const Mission = ({ roomId, mission }) => {
  const [showForm, setShowForm] = useState(false)
  const [currentMission, setCurrentMission] = useState(mission)
  const { register, handleSubmit } = useForm({ defaultValues: { mission } })
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const requireAuthentication = useRequireAuthentication()
  const isAdmin = membership?.roles?.includes('admin')

  const setMission = async (data) => {
    await requireAuthentication()

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
        <input type="text" {...register('mission')} className="md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" />
      </form>
    )
  }

  return (
    <p className="py-2 text-sm">
      {isAdmin ? (
        <span onClick={handleEditClick} className="hover:cursor-pointer">
          {currentMission || "Write your mission here..."}
        </span>
      ) : (
        <>{currentMission}</>
      )}
    </p >
  )
}

const LogWorkModal = ({ show, onClose, task }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({ mode: 'onTouched' })
  const { account } = useWallet()
  const membership = useMembership(account, task?.roomId)

  useEffect(() => {
    reset()
  }, [reset, task])

  const logWork = async (data) => {
    const feedRef = collection(db, 'feed')
    await addDoc(feedRef, {
      roomId: task.roomId,
      taskId: task.taskId,
      workProof: data.proof,
      workWeight: task.weight,
      description: task.description,
      authorAccount: account,
      authorName: membership?.name || null,
      created: serverTimestamp(),
      type: "work"
    })
  }

  const handleLogWork = async (data) => {
    await logWork(data)
    onClose()
  }

  const handleCancel = () => {
    reset()
    onClose()
  }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>{task?.description}</ModalTitle>
      <form onSubmit={handleSubmit(handleLogWork)}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {task?.details &&
              <div className="border border-indigo-200 border-opacity-25 rounded-md p-2 whitespace-pre-wrap overflow-auto">{task?.details}</div>
            }
            <div>
              <label className="block text-sm font-medium pb-2">
                Proof of work
              </label>
              <textarea type="text" {...register("proof", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" />
              {errors.proof && (
                <span className="text-xs text-red-400">{"You need to describe the work you've done"}</span>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <div className="flex gap-2">
            <button
              type="reset"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md daonative-gray-100 bg-daonative-primary-blue hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-dark-100 text-daonative-gray-100"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md daonative-gray-100 bg-daonative-primary-blue hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-dark-100 text-daonative-gray-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="w-4 h-4 mx-auto"><Spinner /></span>
              ) : "Log Work"}
            </button>

          </div>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}


const OpenTasks = ({ openTasks }) => {
  const [taskToLog, setTaskToLog] = useState(null)
  const [showLogWorkModal, setShowLogWorkModal] = useState(false)

  const handleLogWork = (taskId) => {
    const task = openTasks.find(task => task.taskId === taskId)
    setTaskToLog(task)
    setShowLogWorkModal(true)
  }

  const handleCloseLogWorkModal = () => {
    setShowLogWorkModal(false)
  }

  return (
    <>
      <LogWorkModal show={showLogWorkModal} onClose={handleCloseLogWorkModal} task={taskToLog} />
      <TasksTable title="Open Tasks" showWeight={true} tasks={openTasks} onTaskClick={(taskId) => handleLogWork(taskId)} />
    </>
  )
}

const Dashboard = ({ feed: initialFeed, dao: initialDAO }) => {
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const { account } = useWallet()
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true)
  const [daoSnapshot] = useDocument(doc(db, 'rooms', roomId))
  const [feedSnapshot] = useCollection(
    query(collection(db, 'feed'), where('roomId', '==', roomId), orderBy('created', 'desc'))
  )
  const [membersSnapshot] = useCollection(
    query(collection(db, 'rooms', roomId, 'members'))
  )
  const [usersSnapshot] = useCollection(
    query(collection(db, 'users'), where('rooms', 'array-contains', roomId))
  )
  const [tasksSnapshot] = useCollection(
    query(
      collection(db, 'tasks'),
      where('roomId', '==', roomId),
      where('assigneeAccount', '==', account),
      where('status', '!=', 'done'),
      orderBy('status', 'desc'),
      orderBy('deadline', 'desc')
    )
  )

  const [openTasksSnapshot] = useCollection(
    query(
      collection(db, 'tasks'),
      where('roomId', '==', roomId),
      where('assigneeAccount', '==', null),
      where('status', '!=', 'done'),
      orderBy('status', 'desc'),
      orderBy('deadline', 'desc')
    )
  )

  const membership = useMembership(account, roomId)
  const isMember = !!membership

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

  const myTasks = tasksSnapshot?.docs.map((doc) => {
    const task = doc.data()
    return {
      ...task,
      created: isFirestoreDate(task?.created) ? task.created.toMillis() : '',
      deadline: isFirestoreDate(task?.deadline) ? task.deadline.toMillis() : '',
      taskId: doc.id
    }
  }) || []

  const openTasks = openTasksSnapshot?.docs.map((doc) => {
    const task = doc.data()
    return {
      ...task,
      created: isFirestoreDate(task?.created) ? task.created.toMillis() : '',
      deadline: isFirestoreDate(task?.deadline) ? task.deadline.toMillis() : '',
      taskId: doc.id
    }
  }) || []

  const users = usersSnapshot?.docs.map(doc => ({account: doc.id, ...doc.data()}))

  const members = membersSnapshot?.docs.map((doc) => {
    const membership = doc.data()
    const user = users?.find(user => user.account === doc.id)
    return {
      name: user?.name,
      account: doc.id,
      ...membership
    }
  }) || []

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
        <div className="md:pl-64 flex-row md:flex overflow-hidden bg-daonative-dark-300 text-daonative-gray-100">
          <main className="w-full py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 text-daonative-gray-200">{dao.name}</h1>
              <Mission roomId={roomId} mission={dao.mission} />
            </div>
            <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
              <KPIs roomId={roomId} kpis={dao.kpis} />
            </div>
            {openTasks?.length > 0 && (
              <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
                <OpenTasks openTasks={openTasks} />
              </div>
            )}
            {isMember && myTasks?.length > 0 && (
              <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
                <TasksTable title="My Tasks" tasks={myTasks} showWeight={true} />
              </div>
            )}
            <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
              <Feed roomId={roomId} feed={feed} kpis={dao.kpis} />
            </div>
          </main>
          <aside className="w-full md:max-w-xs md:py-6">
            <div className="px-4">
              <UpcomingEvents />
            </div>
            <div className="py-4 px-4">
              <Treasury address={dao.treasury} enabled={false} />
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

const DisabledDashboard = () => {
  const {push, query: {daoId}} = useRouter()
  useEffect(() => push(`/dao/${daoId}/challenges`), [])
  return <></>
}

export default DisabledDashboard