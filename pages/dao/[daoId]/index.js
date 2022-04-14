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
import TasksTable from '../../../components/TasksTable'
import Treasury from '../../../components/Treasury'
import UpcomingEvents from '../../../components/UpcomingEvents'
import useMembership from '../../../lib/useMembership';
import { useWallet } from 'use-wallet';
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../components/Modal';
import Spinner from '../../../components/Spinner';
import { useRequireAuthentication } from '../../../lib/authenticate';
import { Members } from './members';
import { LayoutWrapper } from '../../../components/LayoutWrapper';
import { PrimaryButton, SecondaryButton } from '../../../components/Button';
import { CogIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import PFP from '../../../components/PFP';
import { uploadToIPFS } from '../../../lib/uploadToIPFS';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { useProfileModal } from '../../../components/ProfileModal';

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

export const getRoom = async (roomId) => {
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
        <input type="text" {...register('mission')} className="md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
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
              <textarea type="text" {...register("proof", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md daonative-gray-100 bg-daonative-primary-blue hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-component-bg text-daonative-gray-100"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md daonative-gray-100 bg-daonative-primary-blue hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-daonative-component-bg text-daonative-gray-100"
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

const DAOProfileModal = ({ room, roomId, show, onClose }) => {
  const { handleSubmit, register, watch, reset } = useForm()
  const imageFile = watch('image')
  const imageUri = imageFile?.length > 0 ? URL.createObjectURL(imageFile[0]) : ""
  const requireAuthentication = useRequireAuthentication()

  useEffect(() => {
    const { discordNotificationWebhook } = room

    if (!discordNotificationWebhook) return

    reset({ discordNotificationWebhook })
  }, [room, reset])

  const uploadProfilePicture = async (image) => {
    if (image?.length !== 1)
      return null

    const profilePictureURI = await uploadToIPFS(image[0])
    return profilePictureURI
  }

  const updateDAOProfile = async (image, discordNotificationWebhook) => {
    const db = getFirestore()
    const roomRef = doc(db, 'rooms', roomId)
    const profilePictureURI = await uploadProfilePicture(image)
    const daoProfile = profilePictureURI ? { profilePictureURI, discordNotificationWebhook } : { discordNotificationWebhook }
    await updateDoc(roomRef, daoProfile)
  }

  const handleUpdateDAOProfile = async (data) => {
    await requireAuthentication()
    await updateDAOProfile(data.image, data.discordNotificationWebhook)
    onClose()
  }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>DAO profile</ModalTitle>
      <form onSubmit={handleSubmit(handleUpdateDAOProfile)}>
        <ModalBody>
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-center">
              <DAOProfilePicture profilePictureURI={imageUri || room.profilePictureURI} roomId={roomId} />
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">DAO profile picture</label>
              <input {...register("image", { required: false })} type="file" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-100 rounded-md bg-daonative-component-bg border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Discord Webhook URL
              </label>
              <input type="text" {...register("discordNotificationWebhook", { required: false })} placeholder="https://discord.com/api/webhooks/..." className="shadow-sm focus:ring-indigo-500 focus:border-daonative-border block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-white" />
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <div className="flex gap-4">
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton type="submit">Save</PrimaryButton>
          </div>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const DAOProfileButton = ({ roomId, room, canEditProfile }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleOpenUploadModal = () => setIsProfileModalOpen(true)
  const handleCloseUploadModal = () => setIsProfileModalOpen(false)

  return (
    <div className={canEditProfile && "hover:cursor-pointer"} onClick={() => canEditProfile && handleOpenUploadModal()}>
      <DAOProfileModal show={isProfileModalOpen} onClose={handleCloseUploadModal} roomId={roomId} room={room} />
      <DAOProfilePicture roomId={roomId} profilePictureURI={room.profilePictureURI} />
    </div>
  )
}

const DAOProfilePicture = ({ roomId, profilePictureURI }) => (
  <>
    {profilePictureURI && <img src={profilePictureURI} width="64" height="64" style={{ borderRadius: 8 }} />}
    {!profilePictureURI && <PFP address={roomId} size={64} />}
  </>
)

const Dashboard = ({ dao: initialDAO }) => {
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const [daoSnapshot] = useDocument(doc(db, 'rooms', roomId))
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const isAdmin = !!membership?.roles?.includes('admin')
  const { openProfileModal } = useProfileModal()

  const dao = daoSnapshot ? {
    ...daoSnapshot.data(),
    roomId: daoSnapshot.id
  } : initialDAO

  const SEOImage = initialDAO.profilePictureURI ? (
    initialDAO.profilePictureURI
  ) : (
    "/DAOnativeSEOLogo.png"
  )
  const SEOUrl = "https://app.daonative.xyz"

  const handleOpenProfileSettings = () => {
    openProfileModal("settings")
  }

  useEffect(() => {
    const userNameBanner = async () => {
      const db = getFirestore()
      const userRef = doc(db, 'users', account)
      const userDoc = await getDoc(userRef)
      const user = userDoc.data()

      if (userDoc.exists() && user.name) return

      toast(() => (
        <span className="text-center hover:cursor-pointer" onClick={handleOpenProfileSettings}>
          Looks like you {"don't"} have a name set. Click here to set one.
        </span>
      ), {
        icon: '💬',
        duration: 10000
      })
    }

    if(!account) return

    userNameBanner()
  }, [account])

  return (
    <>
      <Head>
        <meta property="twitter:image" content={SEOImage.replace('ipfs.infura.io', 'cloudflare-ipfs.com')} />
      </Head>
      <NextSeo
        title="DAONative"
        description=""
        canonical={SEOUrl}
        openGraph={{
          url: SEOUrl,
          title: `DAOnative | ${initialDAO.name}`,
          description: initialDAO.mission,
          images: [{ url: SEOImage }],
          site_name: 'DAOnative',
        }}
        twitter={{
          handle: '@daonative',
          cardType: 'summary_large_image',
        }}
      />
      <LayoutWrapper>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex gap-4 items-center">
            {roomId && dao && <DAOProfileButton roomId={roomId} room={dao} canEditProfile={isAdmin} />}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 text-daonative-gray-200">{dao.name}</h1>
              <Mission roomId={roomId} mission={dao.mission} />
            </div>
          </div>
        </div>
        <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
          <KPIs roomId={roomId} kpis={dao.kpis} />
        </div>
        <div className="py-4 mx-auto">
          <Members />
        </div>
      </LayoutWrapper>
      {/*
      <aside className="w-full md:max-w-xs md:py-6">
        <div className="px-4">
          <UpcomingEvents />
        </div>
        <div className="py-4 px-4">
          <Treasury address={dao.treasury} enabled={false} />
        </div>
      </aside>
      */}
    </>
  )
}

export default Dashboard