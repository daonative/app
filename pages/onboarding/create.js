import { useState } from 'react'
import { getAuth } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useWallet } from 'use-wallet'
import { useForm } from 'react-hook-form'
import ConnectWalletButton from '../../components/ConnectWalletButton'
import authenticate from '../../lib/authenticate'
import useDarkMode from '../../lib/useDarkMode'
import useProvider from '../../lib/useProvider'
import useIsConnected from '../../lib/useIsConnected'

import DAOnativeLogo from '../../public/DAOnativeLogo.svg'

import toast from 'react-hot-toast'
import { roomCreatorAbi } from '../../lib/abi'

import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ethers } from 'ethers'
import { useRouter } from 'next/router'

import { CheckIcon } from '@heroicons/react/solid'

const roomCreatorInterface = new ethers.utils.Interface(roomCreatorAbi)

const ROOM_CREATOR_CONTRACT_ADDRESS = '0xb89f8e5DB0A595533eF05F3765c51E85361cA913'
const REQUIRE_AUTHENTICATION = false

const auth = getAuth()

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const steps = [
  { id: '01', title: 'Create', description: 'Create your DAO treasury', href: '#', status: 'current' },
  { id: '02', title: 'Join', description: 'Mint your NFT to become a member', href: '#', status: 'upcoming' },
]

const Steps = () => (
  <nav aria-label="Progress" className="p-10">
    <ol role="list" className="border-y border-gray-300 divide-y divide-gray-300 md:flex md:divide-y-0 justify-center">
      {steps.map((step, stepIdx) => (
        <li key={step.id} className={
          classNames(
            "relative md:flex-none md:flex md:w-1/4",
            stepIdx + 1 === steps.length && "border-gray-300 border-r",
            step.status === 'current' && "border-b-2 border-b-indigo-600"
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
          <a href={step.href} className="group flex items-center w-full">
            <span className="px-6 py-4 flex items-center text-sm font-medium">
              <span className={classNames(
                  "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full",
                  step.status === 'complete' ? "bg-indigo-600" : "border-2 border-indigo-600"
                )}
            >
                {step.status === 'complete' ? (
                  <CheckIcon className="w-6 h-6 text-white" aria-hidden="true" />
                ) : (
                  <>{step.id}</>
                )}
              </span>
              <div className="flex flex-col">
                <span className="ml-4 text-sm font-medium text-gray-900 dark:text-daonative-gray-300 font-medium uppercase tracking-wider font-bold">{step.title}</span>
                <span className="ml-4 text-sm font-medium text-gray-900 dark:text-daonative-gray-300">{step.description}</span>
              </div>
            </span>
          </a>
        </li>
      ))}
    </ol>
  </nav>
)


const Create = () => {
  const { account } = useWallet()
  const provider = useProvider()
  const isConnected = useIsConnected()
  const [user] = useAuthState(auth)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit } = useForm()
  const router = useRouter()

  useDarkMode()

  const isAuthenticated = !!user

  const deployRoomContract = async (name) => {
    const signer = provider.getSigner(account)
    const contract = new ethers.Contract(ROOM_CREATOR_CONTRACT_ADDRESS, roomCreatorInterface, signer)
    return await contract.createRoom(name)
  }

  const createRoom = async (name, address) => {
    const db = getFirestore()
    const roomsCollection = collection(db, 'rooms')
    const roomRef = await addDoc(roomsCollection, { name, treasury: address })
    return roomRef.id
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

    if (REQUIRE_AUTHENTICATION && !isAuthenticated) {
      await authenticate(account, provider)
    }

    const toastId = toast.loading('Loading')
    setIsLoading(true)

    try {
      const tx = await deployRoomContract(data.daoName)
      const receipt = await tx.wait()
      const address = getRoomAddressFromCreationTxReceipt(receipt)
      const roomId = await createRoom(data.daoName, address)
      await createRoomFeedEntry(roomId, data.daoName)
      await router.push(`/dao/${roomId}/join`)
      toast.success('Confirmed', { id: toastId })
    } catch (e) {
      console.error(e)
      const errorMessage = e?.message || 'Error'
      toast.error(errorMessage, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="overflow-hidden w-full h-screen">
      <Steps />
      <main className="flex justify-center items-center">
        <div className="flex flex-col items-center ">
          <div className={classNames("w-32 h-32 m-6", isLoading && "animate-spin-slow")}>
            <DAOnativeLogo />
          </div>
          {isConnected && !isLoading && (
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
          )}
          {!isConnected && (
            <>
              <p className="p-6 text-gray-200 font-bold">You need to connect your wallet before you can create your DAO</p>
              <div className="w-36 h-16">
                <ConnectWalletButton />
              </div>
            </>
          )}
        </div>
      </main>
    </div >
  )
}

export default Create