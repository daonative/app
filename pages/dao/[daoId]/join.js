import { useState } from 'react'
import ConnectWalletButton from '../../../components/ConnectWalletButton'
import useDarkMode from '../../../lib/useDarkMode'
import useIsConnected from '../../../lib/useIsConnected'
import { useForm } from 'react-hook-form'
import { arrayUnion, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { membershipAbi } from '../../../lib/abi'
import { ethers } from 'ethers'
import { useWallet } from 'use-wallet'
import toast from 'react-hot-toast'
import useProvider from '../../../lib/useProvider'
import { useRouter } from 'next/router'

const MEMBERSHIP_CONTRACT_ADDRESS = '0xaB601D1a49D5B2CBB93458175776DE24b06473b3'
const membershipInterface = new ethers.utils.Interface(membershipAbi)

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Join = ({ dao }) => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const provider = useProvider()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit } = useForm()
  const router = useRouter()

  useDarkMode()

  const createMembershipToken = async (roomId) => {
    const signer = provider.getSigner(account)
    const contract = new ethers.Contract(MEMBERSHIP_CONTRACT_ADDRESS, membershipInterface, signer)
    return await contract.safeMint(account, roomId)
  }

  const createMembership = async (roomId, tokenId, name) => {
    const db = getFirestore()
    const membershipId = `${MEMBERSHIP_CONTRACT_ADDRESS}-${tokenId}`
    const membershipRef = doc(db, 'memberships', membershipId)
    await setDoc(membershipRef, { account, name, tokenId, roomId, contractAddress: MEMBERSHIP_CONTRACT_ADDRESS })
  }

  const getMembershipTokenIdFromTxReceipt = (txReceipt) => (
    txReceipt.logs
      // Parse log events
      .map((log) => {
        try {
          const event = membershipInterface.parseLog(log)
          console.log(event)
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

    const toastId = toast.loading('Loading')
    setIsLoading(true)

    try {
      const tx = await createMembershipToken(dao.roomId)
      const receipt = await tx.wait()
      const tokenId = getMembershipTokenIdFromTxReceipt(receipt)
      await createMembership(dao.roomId, tokenId, data.name)
      router.push(`/dao/${dao.roomId}`)
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
      <main className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center ">
          <img src="/DAOnativeLogo.svg" className={classNames("w-32 h-32 m-6", isLoading && "animate-spin")} />
          {isConnected && !isLoading && (
            <>
              <h1 className="text-xl text-daonative-gray-300 pb-2">{dao?.name}</h1>
              <form onSubmit={handleSubmit(handleJoinDAO)}>
                <div className="flex flex-col md:flex-row w-full">
                  <input
                    {...register("name")}
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

const getRoom = async (roomId) => {
  const db = getFirestore()
  const roomRef = doc(db, 'rooms', roomId)
  const roomSnap = await getDoc(roomRef)

  if (!roomSnap.exists()) {
    return null
  }

  return roomSnap.data()
}

export async function getServerSideProps ({ res, params }) {
  const { daoId } = params
  const room = {roomId: daoId, ...await getRoom(daoId)}

  if (!room) {
    res.statusCode = 404
  }

  return {
    props: { dao: room }
  }
}

export default Join