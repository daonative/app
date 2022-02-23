import { useState } from 'react'
import { useWallet } from 'use-wallet'
import { useForm } from 'react-hook-form'

import { classNames } from '../lib/utils'
import { roomCreatorAbi, membershipAbi } from '../lib/abi'
import ConnectWalletButton from '../components/ConnectWalletButton'
import useDarkMode from '../lib/useDarkMode'
import useProvider from '../lib/useProvider'
import useIsConnected from '../lib/useIsConnected'

import DAOnativeLogo from '../public/DAOnativeLogo.svg'

import toast from 'react-hot-toast'

import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { ethers } from 'ethers'
import { useRouter } from 'next/router'

import { CheckIcon } from '@heroicons/react/solid'
import PolygonWarning from '../components/PolygonWarning'

const roomCreatorInterface = new ethers.utils.Interface(roomCreatorAbi)
const membershipInterface = new ethers.utils.Interface(membershipAbi)

const ROOM_CREATOR_CONTRACT_ADDRESS = '0xb89f8e5DB0A595533eF05F3765c51E85361cA913'
const MEMBERSHIP_CONTRACT_ADDRESS = '0xaB601D1a49D5B2CBB93458175776DE24b06473b3'

const DEPLOY_TREASURY = false
const MINT_NFT_MEMBERSHIP = false

const Steps = ({ children }) => (
  <nav aria-label="Progress" className="p-4 md:p-10">
    <ol role="list" className="md:flex justify-center">
      <li className="border-y-gray-300 md:grow md:border-y"></li>
      {children}
      <li className="border-y-gray-300 md:grow md:border-y md:border-gray-300 md:border-l"></li>
    </ol>
  </nav>
)

const Step = ({ status, children, id }) => (
  <li key={id} className={
    classNames(
      "relative md:flex-none md:flex md:w-1/4 md:border-y border-y-gray-300",
      status === 'current' && "border-b-indigo-600 md:border-b-2"
    )}
  >
    <div className="hidden md:block absolute top-0 left-0 h-full w-5" aria-hidden="true">
      <svg
        className="h-full w-full text-gray-300"
        viewBox="0 0 22 80"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0.500122 0V30.2439L10.5001 40L0.500122 49.7561V80"
          vectorEffect="non-scaling-stroke"
          stroke="currentcolor"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <div className="group flex items-center w-full">
      <span className="px-6 py-4 flex items-center text-sm font-medium">
        <span className={classNames(
          "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full",
          status === 'complete' && "bg-indigo-600",
          status === 'upcoming' && "border-2 border-indigo-600",
          status === 'current' && "border-2 border-indigo-600 bg-indigo-600/30"
        )}
        >
          {status === 'complete' ? (
            <CheckIcon className="w-6 h-6 text-white" aria-hidden="true" />
          ) : (
            <>{id}</>
          )}
        </span>
        <div className="flex flex-col">
          {children}
        </div>
      </span>
    </div>
  </li>
)

const StepTitle = ({ children }) => (
  <span className="ml-4 text-sm font-medium text-gray-900 dark:text-daonative-gray-300 font-medium uppercase tracking-wider font-bold">{children}</span>
)

const StepDescription = ({ children }) => (
  <span className="ml-4 text-sm font-medium text-gray-900 dark:text-daonative-gray-300">{children}</span>
)

const Create = ({ onDaoCreating, onDaoCreated }) => {
  const { account } = useWallet()
  const provider = useProvider()
  const { register, handleSubmit } = useForm()

  useDarkMode()

  const deployRoomContract = async (name) => {
    const signer = provider.getSigner(account)
    const contract = new ethers.Contract(ROOM_CREATOR_CONTRACT_ADDRESS, roomCreatorInterface, signer)
    return await contract.createRoom(name)
  }

  const createRoom = async (name, address) => {
    const db = getFirestore()
    const room = { name, treasury: address }
    const roomsCollection = collection(db, 'rooms')
    const roomRef = await addDoc(roomsCollection, { name, treasury: address })
    return {
      roomId: roomRef.id,
      ...room
    }
  }

  const createRoomFeedEntry = async (roomId, name) => {
    const db = getFirestore()
    const feedRef = collection(db, 'feed')
    await addDoc(feedRef, {
      roomId,
      description: `${name} just got created`,
      authorAccount: account,
      created: serverTimestamp()
    })
  }

  const getRoomAddressFromCreationTxReceipt = (txReceipt) => (
    txReceipt.logs
      // Parse log events
      .map((log) => {
        try {
          return roomCreatorInterface.parseLog(log)
        } catch (e) {
          return undefined
        }
      })
      // Get rid of the unknown events
      .filter((event) => event !== undefined)
      // Keep only RoomCreated events
      .filter((event) => event.name === "RoomCreated")
      // Take the first argument which is the room address
      .map((event) => event.args[0])
      // Take the first address (there is only one)
      .shift()
  )

  const handleCreateRoom = async (data) => {
    if (!account) return

    let address = null
    let toastId = null

    onDaoCreating()

    if (DEPLOY_TREASURY) {
      toastId = toast.loading('Loading')
    }

    try {

      if (DEPLOY_TREASURY) {
        const tx = await deployRoomContract(data.daoName)
        const receipt = await tx.wait()
        address = getRoomAddressFromCreationTxReceipt(receipt)
      }

      const room = await createRoom(data.daoName, address)
      await createRoomFeedEntry(room.roomId, data.daoName)

      if (DEPLOY_TREASURY) {
        toast.success('Confirmed', { id: toastId })
      }

      onDaoCreated(room)
    } catch (e) {
      console.error(e)
      const errorMessage = e?.message || 'Error'
      toast.error(errorMessage, { id: toastId })
      onDaoCreated(null)
    }
  }

  return (
    <>
      <p className="p-6 text-gray-200 font-bold">What&apos;s the name of your DAO?</p>
      <form onSubmit={handleSubmit(handleCreateRoom)}>
        <div className="flex flex-col md:flex-row w-full">
          <input
            {...register("daoName")}
            type="text"
            className="my-2 md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-transparent sm:text-sm rounded-md bg-daonative-dark-100 text-daonative-gray-300"
            placeholder="School DAO"
          />
          <button
            type="submit"
            className="place-self-center my-2 md:mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create your DAO
          </button>
        </div>
      </form>
    </>
  )
}

const Join = ({ dao, onMemberJoining, onMemberJoined }) => {
  const { account } = useWallet()
  const provider = useProvider()
  const { register, handleSubmit } = useForm()

  const createMembershipToken = async (roomId) => {
    const signer = provider.getSigner(account)
    const contract = new ethers.Contract(MEMBERSHIP_CONTRACT_ADDRESS, membershipInterface, signer)
    return await contract.safeMint(account, roomId)
  }

  const createMembership = async (roomId, tokenId, name) => {
    const db = getFirestore()
    const membership = { account, name, tokenId, roomId, contractAddress: MEMBERSHIP_CONTRACT_ADDRESS }

    if (tokenId) {
      const membershipId = `${MEMBERSHIP_CONTRACT_ADDRESS}-${tokenId}`
      const membershipRef = doc(db, 'memberships', membershipId)
      await setDoc(membershipRef, membership)
    } else {
      const membershipRef = collection(db, 'memberships')
      await addDoc(membershipRef, membership)
    }

    return membership
  }

  const createMembershipFeedEntry = async (roomId, name) => {
    const db = getFirestore()
    const feedRef = collection(db, 'feed')
    await addDoc(feedRef, {
      roomId,
      description: "A new member joined",
      authorAccount: account,
      authorName: name,
      created: serverTimestamp()
    })
  }

  const getMembershipTokenIdFromTxReceipt = (txReceipt) => (
    txReceipt.logs
      // Parse log events
      .map((log) => {
        try {
          const event = membershipInterface.parseLog(log)
          return event
        } catch (e) {
          return undefined
        }
      })
      // Get rid of the unknown events
      .filter((event) => event !== undefined)
      // Keep only Transfer events
      .filter((event) => event.name === "Transfer")
      // Take the third argument which is the token id
      .map((event) => event.args[2].toString())
      // Take the first token id (there is only one)
      .shift()
  )

  const handleJoinDAO = async (data) => {
    if (!account) return

    let toastId = null

    onMemberJoining()

    if (MINT_NFT_MEMBERSHIP) {
      toastId = toast.loading('Loading')
    }

    try {
      let tokenId = null

      if (MINT_NFT_MEMBERSHIP) {
        const tx = await createMembershipToken(dao.roomId)
        const receipt = await tx.wait()
        tokenId = getMembershipTokenIdFromTxReceipt(receipt)
      }

      const member = await createMembership(dao.roomId, tokenId, data.memberName)
      await createMembershipFeedEntry(dao.roomId, data.memberName)

      if (MINT_NFT_MEMBERSHIP) {
        toast.success('Confirmed', { id: toastId })
      }

      onMemberJoined(member)
    } catch (e) {
      console.error(e)
      const errorMessage = e?.message || 'Error'
      toast.error(errorMessage, { id: toastId })
      onMemberJoined(null)
    }
  }

  return (
    <>
      <h1 className="text-xl text-daonative-gray-300 pb-2">{dao?.name}</h1>
      <form onSubmit={handleSubmit(handleJoinDAO)}>
        <div className="flex flex-col md:flex-row w-full">
          <input
            {...register("memberName")}
            type="text"
            className="my-2 md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-transparent sm:text-sm rounded-md bg-daonative-dark-100 text-daonative-gray-300"
            placeholder="How should we call you?"
          />
          <button
            type="submit"
            className="place-self-center my-2 md:mx-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Join the DAO
          </button>
        </div>
      </form>
    </>
  )
}

const Onboarding = () => {
  const [isLoading, setIsLoading] = useState()
  const [dao, setDAO] = useState()
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const isConnected = useIsConnected()

  useDarkMode()

  const stepStatus = (index) => {
    if (index === currentStep) return "current"
    if (index < currentStep) return "complete"
    return "upcoming"
  }

  const handleLoading = () => setIsLoading(true)

  const handleDaoCreated = (dao) => {
    setIsLoading(false)

    if (!dao) return

    setDAO(dao)
    setCurrentStep(2)
  }

  const handleMemberJoined = async (member) => {
    if (!member) {
      setIsLoading(false)
      return
    }

    await router.push(`/dao/${dao.roomId}`)
    setIsLoading(false)
  }

  return (
    <div className="overflow-hidden w-full h-screen">
      <Steps>
        <Step id={1} status={stepStatus(1)}>
          <StepTitle>Create</StepTitle>
          <StepDescription></StepDescription>
        </Step>
        <Step id={2} status={stepStatus(2)}>
          <StepTitle>Join</StepTitle>
          <StepDescription></StepDescription>
        </Step>
      </Steps>
      <main className="flex justify-center items-center">
        <div className="flex flex-col items-center ">
          <div className={classNames("w-24 h-24 md:w-32 md:h-32 m-6", isLoading && "animate-spin-slow")}>
            <DAOnativeLogo />
          </div>
          {!isConnected && (
            <>
              <p className="p-6 text-gray-200 font-bold text-center">You need to connect your wallet before you can create your DAO</p>
              <div className="w-36 h-16">
                <ConnectWalletButton />
              </div>
            </>
          )}
          {isConnected && !isLoading && currentStep === 1 && <Create onDaoCreating={handleLoading} onDaoCreated={handleDaoCreated} />}
          {isConnected && !isLoading && currentStep === 2 && <Join onMemberJoining={handleLoading} onMemberJoined={handleMemberJoined} dao={dao} />}
        </div>
        <div className="absolute bottom-10">
          <PolygonWarning />
        </div>
      </main>
    </div >
  )
}

export default Onboarding