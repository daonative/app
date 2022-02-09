import { useState, useEffect } from 'react'
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useDocument } from 'react-firebase-hooks/firestore';

import useLocalStorage from '../../../lib/useLocalStorage'

import SidebarNavigation from '../../../components/SidebarNavigation'
import HeaderNavigation from '../../../components/HeaderNavigation'
import PFP from '../../../components/PFP';
import ShortAddress from '../../../components/ShortAddress';
import Moment from 'react-moment';

const db = getFirestore()

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
  const room = await getRoom(roomId)

  return {
    props: { dao: room }
  }
}

const TasksTable = ({ showAssignee = false }) => {
  const tasks = [
    { description: 'Prepare metapod pitch', assigneeName: 'lrnt', assigneeAccount: '0x12345', deadline: new Date(2022, 1, 11, 0, 0, 0) }
  ]
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 dark:border-daonative-gray-900 rounded-lg">
            <table className="table-fixed min-w-full divide-y divide-gray-200 dark:divide-daonative-gray-900">
              <thead className="bg-gray-50 dark:bg-daonative-dark-100 text-gray-500 dark:text-daonative-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Tasks
                  </th>
                  {showAssignee && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      Assignee
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  >
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  return (
                    <tr key={task.eventId} className="bg-white dark:bg-daonative-dark-100 text-gray-900 dark:text-daonative-gray-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{task.description}</td>
                      {showAssignee && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-4">
                            <PFP address={task.assigneeAccount} size={40} />
                            {/* <img className="h-10 w-10 rounded-full" src="https://ipfs.io/ipfs/QmbvBgaAqGVAs3KiEgsuDY2u4BUnuA9ueG96NFSPK4z6b6" alt="" />*/}
                            {task.assigneeName ? (
                              <>{task.assigneeName}</>
                            ) : (
                              <ShortAddress>{task.assigneeAccount}</ShortAddress>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {console.log(task.deadline)}
                        <Moment date={task.deadline} fromNowDuring={24 * 60 * 60 * 1000} format="yyyy-MM-DD" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ dao: initialDAO }) {
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
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-daonative-gray-200">{dao.name}</h1>
                  <p className="py-2 text-sm">{dao.mission}</p>
                </div>
                <div>
                  <button
                    className="mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-daonative-dark-100 dark:text-daonative-gray-100"
                  >
                    Add a task
                  </button>
                </div>
              </div>
            </div>
            <div className="mx-auto py-8 px-4 sm:px-6 md:px-8">
              <TasksTable showAssignee={true} />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}