import { useState, useEffect } from 'react'
import { getFirestore, doc, getDoc, serverTimestamp, addDoc, collection, where, orderBy, query, getDocs, updateDoc } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

import useLocalStorage from '../../../lib/useLocalStorage'

import SidebarNavigation from '../../../components/SidebarNavigation'
import HeaderNavigation from '../../../components/HeaderNavigation'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../components/Modal';
import Spinner from '../../../components/Spinner';
import { useForm } from 'react-hook-form';
import { isFirestoreDate } from '../../../lib/utils';
import TasksTable from '../../../components/TasksTable';
import useMembers from '../../../lib/useMembers';
import { useWallet } from '@/lib/useWallet';
import useMembership from '../../../lib/useMembership';

const db = getFirestore()

const getTasks = async (roomId) => {
  const tasksRef = collection(db, 'tasks')
  const tasksQuery = query(tasksRef, where('roomId', '==', roomId), orderBy('deadline', 'desc'))
  const snapshot = await getDocs(tasksQuery)
  return snapshot.docs.map((doc) => {
    const item = doc.data()
    return {
      ...item,
      created: isFirestoreDate(item?.created) ? item.created.toMillis() : '',
      deadline: isFirestoreDate(item?.deadline) ? item.deadline.toMillis() : '',
      taskId: doc.id
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
  const room = await getRoom(roomId)
  const tasks = await getTasks(roomId)

  return {
    props: { dao: room, tasks }
  }
}

const TaskModal = ({ show, onClose, roomId, taskId, defaultValues = {} }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm()
  const members = useMembers()

  useEffect(() => {
    // fix timezone offset
    const deadline = defaultValues.deadline && (new Date(defaultValues.deadline - new Date().getTimezoneOffset() * 60000).toISOString()).slice(0, -1)
    reset({ ...defaultValues, deadline })
  }, [reset, defaultValues])

  const createTask = async (data) => {
    const assignee = members.find(member => member.membershipId === data.assigneeMembershipId)
    const task = {
      roomId,
      description: data.description,
      details: data.details,
      status: 'todo',
      assigneeMembershipId: assignee?.membershipId || null,
      assigneeAccount: assignee?.account || null,
      assigneeName: assignee?.name || null,
      created: serverTimestamp(),
      deadline: new Date(data.deadline),
      weight: data.weight || null
    }
    await addDoc(collection(db, 'tasks'), task)
  }

  const updateTask = async (data) => {
    const assignee = members.find(member => member.membershipId === data.assigneeMembershipId)
    const task = {
      description: data.description,
      details: data.details,
      deadline: data.deadline,
      weight: data.weight || null,
      assigneeMembershipId: assignee?.membershipId || null,
      assigneeAccount: assignee?.account || null,
      assigneeName: assignee?.name || null,
    }
    await updateDoc(doc(db, 'tasks', taskId), task)
  }

  const handleSaveTask = async (data) => {
    if (taskId) {
      await updateTask(data)
    } else {
      await createTask(data)
    }
    onClose()
  }

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={handleSubmit(handleSaveTask)}>
        <ModalTitle>{taskId ? "Edit task" : "Add a task"}</ModalTitle>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium pb-2">
                Title
              </label>
              <input type="text" {...register("description", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
              {errors.description && (
                <span className="text-xs text-red-400">You need to set a description</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Description (optional)
              </label>
              <textarea rows="8" {...register("details", { required: false })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Deadline
              </label>
              <input type="datetime-local" step={60} {...register("deadline", { required: true, valueAsDate: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
              {errors.deadline && (
                <span className="text-xs text-red-400">You need to set a deadline</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Weight (rewards for task completion)
              </label>
              <input type="number" {...register("weight")} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Assignee
              </label>
              <select
                {...register("assigneeMembershipId")}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300"
              >
                <option value="">Nobody (open task)</option>
                {members.map(member => <option key={member.membershipId} value={member.membershipId}>{member.name}</option>)}
              </select>
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md daonative-gray-100 bg-daonative-primary-blue hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-component-bg text-daonative-gray-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 mx-auto"><Spinner /></span>
            ) : (
              <>{taskId ? "Save task" : "Add task"}</>
            )}
          </button>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

export default function Tasks({ dao: initialDAO, tasks: initialTasks }) {
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState({})
  const [daoSnapshot] = useDocument(doc(db, 'rooms', roomId))
  const [tasksSnapshot] = useCollection(
    query(collection(db, 'tasks'), where('roomId', '==', roomId), orderBy('deadline', 'desc'))
  )
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const isAdmin = membership?.roles.includes('admin')


  const dao = daoSnapshot ? {
    ...daoSnapshot.data(),
    roomId: daoSnapshot.id
  } : initialDAO

  const tasks = tasksSnapshot?.docs.map((doc) => {
    const task = doc.data()
    return {
      ...task,
      created: isFirestoreDate(task?.created) ? task.created.toMillis() : '',
      deadline: isFirestoreDate(task?.deadline) ? task.deadline.toMillis() : '',
      taskId: doc.id
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

  const handleAddTask = () => {
    setSelectedTask({})
    setShowTaskModal(true)
  }

  const handleEditTask = (taskId) => {
    const task = tasks.find(task => task.taskId === taskId)
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const closeTaskModal = () => {
    setShowTaskModal(false)
  }

  const handleTaskStatusChange = (taskId, status) => {
    const taskRef = doc(db, 'tasks', taskId)
    updateDoc(taskRef, { status })
  }

  return (
    <>
      <TaskModal show={showTaskModal} onClose={closeTaskModal} roomId={roomId} taskId={selectedTask.taskId} defaultValues={selectedTask} />
      <div>
        <SidebarNavigation showMobile={showSidebarMobile} onClose={() => setShowSidebarMobile(false)} />
        <HeaderNavigation onShowSidebar={onShowMobileSidebar} onToggleDarkMode={onToggleDarkMode} />
        <div className="md:pl-64 flex-row md:flex overflow-hidden bg-daonative-dark-300 text-daonative-gray-100">
          <main className="w-full py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 text-daonative-gray-200">{dao.name}</h1>
                  <p className="py-2 text-sm">{dao.mission}</p>
                </div>
                <div>
                  {isAdmin &&
                    <button
                      className="mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md daonative-gray-100 bg-daonative-primary-blue hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-component-bg text-daonative-gray-100"
                      onClick={handleAddTask}
                    >
                      Add a task
                    </button>
                  }
                </div>
              </div>
            </div>
            <div className="mx-auto py-8 px-4 sm:px-6 md:px-8">
              {tasks?.length > 0 ? (
                <TasksTable showAssignee={true} showWeight={true} tasks={tasks} onTaskStatusChange={handleTaskStatusChange} onTaskClick={isAdmin ? (taskId) => handleEditTask(taskId) : () => null} />
              ) : (
                <div className="flex flex-col gap-2 items-center justify-center">
                  <div>
                    <span>{"Looks like you don't have any tasks."}</span>
                  </div>
                  <div>
                    {isAdmin &&
                      <button
                        className="mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md daonative-gray-100 bg-daonative-primary-blue hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-component-bg text-daonative-gray-100"
                        onClick={handleAddTask}
                      >
                        Add your first task
                      </button>
                    }
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}