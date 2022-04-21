import { useEffect, useState } from 'react'
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

import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc, arrayUnion } from "firebase/firestore";
import { ethers } from 'ethers'
import { useRouter } from 'next/router'

import { CheckIcon } from '@heroicons/react/solid'
import PolygonWarning from '../components/ChainWarning'
import { useRequireAuthentication } from '../lib/authenticate'
import { PrimaryButton } from '../components/Button'
import { guild as guild } from '@guildxyz/sdk'
import Link from 'next/link'
import { Input } from '../components/Input'

const roomCreatorInterface = new ethers.utils.Interface(roomCreatorAbi)
const membershipInterface = new ethers.utils.Interface(membershipAbi)

const GUILD_ID = 2099

const ROOM_CREATOR_CONTRACT_ADDRESS = '0xb89f8e5DB0A595533eF05F3765c51E85361cA913'
const MEMBERSHIP_CONTRACT_ADDRESS = '0xaB601D1a49D5B2CBB93458175776DE24b06473b3'

const DEPLOY_TREASURY = false
const MINT_NFT_MEMBERSHIP = false

const Steps = ({ children }) => (
  <nav aria-label="Progress" className="p-4 md:p-10">
    <ol role="list" className="flex justify-center">
      {children}
    </ol>
  </nav>
)

const Step = ({ status, children, id }) => (
  <li key={id} className={
    classNames(
      "relative md:flex-none md:flex md:w-1/4 md:border-y border-y-gray-300",
      status === 'current' && "border-b-daonative-primary-blue md:border-b-2"
    )}
  >
    <div className="hidden md:block absolute top-0 left-0 h-full w-5" aria-hidden="true">

    </div>
    <div className="group flex items-center w-full">
      <span className="px-6 py-4 flex items-center text-sm font-medium">
        <span className={classNames(
          "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full",
          status === 'complete' && "bg-daonative-primary-blue",
          status === 'upcoming' && "border-2 border-daonative-primary-blue",
          status === 'current' && "border-2 border-daonative-primary-blue bg-daonative-primary-blue/30"
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
  <span className="ml-4 text-sm font-medium font-space text-daonative-white font-medium uppercase tracking-wider font-bold">{children}</span>
)

const StepDescription = ({ children }) => (
  <span className="ml-4 text-sm font-medium text-gray-900 text-daonative-gray-300">{children}</span>
)

const Create = ({ onDaoCreating, onDaoCreated }) => {
  const { account } = useWallet()
  const provider = useProvider()
  const { register, handleSubmit } = useForm()
  const requireAuthentication = useRequireAuthentication()

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
    const roomRef = await addDoc(roomsCollection, { name, treasury: address, created: serverTimestamp() })
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
      await requireAuthentication()

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
      <form onSubmit={handleSubmit(handleCreateRoom)}>
        <div className="flex flex-col w-full items-end">
          <div className='mt-3 text-lg'>
            <label className='font-bold text-white '>
              Enter your community name
            </label>
            <Input className="mt-2 text-xl" register={register} placeholder={"School DAO"} name="daoName" />
          </div>
          <PrimaryButton
            type="submit"
            full
            className='sm:ml-3 mt-3 text-xl justify-center w-full sm:min-w-max '
          >
            Create your community
          </PrimaryButton>
        </div>
      </form>
    </>
  )
}

const Join = ({ dao, onMemberJoining, onMemberJoined }) => {
  const { account } = useWallet()
  const provider = useProvider()
  const { register, handleSubmit } = useForm()
  const requireAuthentication = useRequireAuthentication()

  const createMembershipToken = async (roomId) => {
    const signer = provider.getSigner(account)
    const contract = new ethers.Contract(MEMBERSHIP_CONTRACT_ADDRESS, membershipInterface, signer)
    return await contract.safeMint(account, roomId)
  }

  const createMembership = async (roomId, tokenId, name) => {
    const db = getFirestore()
    const membership = {
      account,
      nftContractAddress: tokenId ? MEMBERSHIP_CONTRACT_ADDRESS : null,
      nftId: tokenId,
      roles: ['admin']
    }
    const membershipRef = doc(db, 'rooms', roomId, 'members', account)
    await setDoc(membershipRef, membership)
    const userRef = doc(db, 'users', account)
    await setDoc(userRef, { name, rooms: arrayUnion(roomId) }, { merge: true })
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

      await requireAuthentication()

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
      <h1 className="text-2xl font-semibold pb-2 font-space">{dao?.name}</h1>
      <form onSubmit={handleSubmit(handleJoinDAO)}>
        <div className="flex flex-col w-full items-end">
          <Input className="text-xl" register={register} name="memberName" placeholder={"How should we call you?"} />
          <PrimaryButton
            type="submit"
            full
            className='sm:ml-3 mt-3 text-xl justify-center w-full sm:min-w-max'
          >
            Join
          </PrimaryButton>
        </div>
      </form>
    </>
  )
}

const Onboarding = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isGuildMember, setIsGuildMember] = useState(false)
  const [dao, setDAO] = useState()
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const isConnected = useIsConnected()
  const { account, status } = useWallet()
  const isConnecting = status === 'connecting'

  //const hasFreePass = router?.query?.ref === "PolygonBounty"
  const isAllowed = true //hasFreePass || isGuildMember

  useDarkMode()

  useEffect(() => {
    const setGuildAccess = async (account) => {
      setIsLoading(true)
      const roles = await guild.getUserAccess(GUILD_ID, account)
      const hasAccess = roles.filter(role => role.access === true).length > 0
      setIsGuildMember(hasAccess)
      setIsLoading(false)
    }

    if (!account) return

    setGuildAccess(account)
  }, [account])


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
    <div className="overflow-hidden w-full h-screen text-daonative-white ">
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
      <main className="flex justify-center items-center px-4 sm:px-0">
        <div className="flex flex-col items-center ">
          <div className={classNames("fill-daonative-white w-24 h-24 md:w-32 md:h-32 m-6", isLoading && "animate-spin-slow")}>
            <DAOnativeLogo />
          </div>
          {!isConnected && !isConnecting && (
            <>
              <p className="p-6 text-gray-200 font-bold text-center">You need to connect your wallet before you can create a new home for your community</p>
              <div className="w-36 h-16">
                <ConnectWalletButton >
                  <PrimaryButton className='h-min'>
                    Connect
                  </PrimaryButton>
                </ConnectWalletButton>
              </div>
            </>
          )}
          {isConnected && !isAllowed && !isLoading && (
            <>
              <p className="p-6 text-gray-200 font-bold text-center">Only DAOnative NFT holders can join the alpha</p>
              <Link passHref href="/nfts/137/0x6b362FE1445DBAC80B064DD13b77403d4f17EE17/mint?inviteCode=kypymbk4tk&inviteMaxUse=0&inviteSig=0x0fa2306b57e7d2f0a95c4dc59b7439a0ec088ef1c58e42f3628cbed6034a53db6cf0e232f0535e7946e9f6ee67df0b6dcd81300d225d4e4b0207c164a5d08ece1c">
                <PrimaryButton className='h-min'>
                  Mint your NFT
                </PrimaryButton>
              </Link>
            </>
          )}
          {isConnected && isAllowed && !isLoading && currentStep === 1 && <Create onDaoCreating={handleLoading} onDaoCreated={handleDaoCreated} />}
          {isConnected && isAllowed && !isLoading && currentStep === 2 && <Join onMemberJoining={handleLoading} onMemberJoined={handleMemberJoined} dao={dao} />}
        </div>
        <div className="absolute bottom-10">
          {/*<PolygonWarning />*/}
        </div>
      </main>
    </div >
  )
}

export default Onboarding