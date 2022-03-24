import { useState } from 'react'
import ConnectWalletButton from '../../../components/ConnectWalletButton'
import useDarkMode from '../../../lib/useDarkMode'
import useIsConnected from '../../../lib/useIsConnected'
import { useForm } from 'react-hook-form'
import { addDoc, collection, doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { useWallet } from 'use-wallet'
import useProvider from '../../../lib/useProvider'
import { useRouter } from 'next/router'
import { useRequireAuthentication } from '../../../lib/authenticate'
import Image from 'next/image'
import { classNames } from '../../../lib/utils'
import axios from 'axios'
import toast from 'react-hot-toast'


const getRoom = async (roomId) => {
  const db = getFirestore()
  const roomRef = doc(db, 'rooms', roomId)
  const roomSnap = await getDoc(roomRef)

  if (!roomSnap.exists()) {
    return null
  }

  return roomSnap.data()
}

export const getServerSideProps = async ({ res, params }) => {
  const { daoId } = params
  const room = { roomId: daoId, ...await getRoom(daoId) }

  if (!room) {
    res.statusCode = 404
  }

  return {
    props: { dao: room }
  }
}

const Join = ({ dao }) => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit } = useForm()
  const { query: params, push } = useRouter()
  const requireAuthentication = useRequireAuthentication()

  useDarkMode()

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

  const joinDAO = async (name, inviteCode, roomId) => {
    const tokenId = await requireAuthentication({ toast: false })
    if (!tokenId) return
    await axios.post('/api/join', { name, inviteCode, roomId }, { headers: { 'Authorization': `Bearer ${tokenId}` } })
  }

  const handleJoinDAO = async (data) => {
    if (!account) return
    setIsLoading(true)
    try {
      await joinDAO(data.name, params.inviteCode, params.daoId)
      await createMembershipFeedEntry(params.daoId, data.name)
      await push(`/dao/${params.daoId}`)
    } catch (e) {
      toast.error('Invalid invite code')
    }
    setIsLoading(false)
  }

  return (
    <div className="overflow-hidden w-full h-screen">
      <main className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <img src="/DAOnativeLogo.svg" className={classNames("w-32 h-32 m-6", isLoading && "animate-spin-slow")} alt="logo" />
          {isConnected && !isLoading && (
            <>
              <h1 className="text-xl text-daonative-gray-300 pb-2">{dao?.name}</h1>
              <form onSubmit={handleSubmit(handleJoinDAO)}>
                <div className="flex flex-col md:flex-row w-full">
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    className="my-2 md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-transparent sm:text-sm rounded-md bg-daonative-component-bg text-daonative-gray-300"
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
          )}
          {!isConnected && (
            <>
              <p className="p-6 text-gray-200 font-bold">You need to connect your wallet before you can join</p>
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

export default Join