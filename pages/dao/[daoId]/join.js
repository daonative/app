import { useState } from 'react'
import ConnectWalletButton from '../../../components/ConnectWalletButton'
import useDarkMode from '../../../lib/useDarkMode'
import useIsConnected from '../../../lib/useIsConnected'
import { useForm } from 'react-hook-form'
import { addDoc, arrayUnion, collection, doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { membershipAbi } from '../../../lib/abi'
import { ethers } from 'ethers'
import { useWallet } from 'use-wallet'
import toast from 'react-hot-toast'
import useProvider from '../../../lib/useProvider'
import { useRouter } from 'next/router'
import PolygonWarning from '../../../components/ChainWarning'
import { useRequireAuthentication } from '../../../lib/authenticate'

const MEMBERSHIP_CONTRACT_ADDRESS = '0xaB601D1a49D5B2CBB93458175776DE24b06473b3'
const membershipInterface = new ethers.utils.Interface(membershipAbi)

const MINT_NFT_MEMBERSHIP = false

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
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
  const provider = useProvider()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit } = useForm()
  const router = useRouter()
  const requireAuthentication = useRequireAuthentication()

  useDarkMode()

  const mintNFTMembership = MINT_NFT_MEMBERSHIP || router?.query?.mint === "true"
  const isAdmin = router?.query?.role === "0xb03i7x"

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
      roles: isAdmin ? ['admin'] : []
    }
    const membershipRef = doc(db, 'rooms', roomId, 'members', account)
    await setDoc(membershipRef, membership)
    const userRef = doc(db, 'users', account)
    await setDoc(userRef, {name, rooms: arrayUnion(roomId)}, {merge: true})
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
    let tokenId = null

    setIsLoading(true)

    if (mintNFTMembership) {
      toastId = toast.loading('Loading')
    }

    try {
      await requireAuthentication()

      if (mintNFTMembership) {
        const tx = await createMembershipToken(dao.roomId)
        const receipt = await tx.wait()
        tokenId = getMembershipTokenIdFromTxReceipt(receipt)
      }
      await createMembership(dao.roomId, tokenId, data.memberName)
      await createMembershipFeedEntry(dao.roomId, data.memberName)
      await router.push(`/dao/${dao.roomId}`)

      if (mintNFTMembership) {
        toast.success('Confirmed', { id: toastId })
      }
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
        <div className="flex flex-col items-center">
          <img src="/DAOnativeLogo.svg" className={classNames("w-32 h-32 m-6", isLoading && "animate-spin-slow")} />
          {isConnected && !isLoading && (
            <>
              <h1 className="text-xl text-daonative-gray-300 pb-2">{dao?.name}</h1>
              <form onSubmit={handleSubmit(handleJoinDAO)}>
                <div className="flex flex-col md:flex-row w-full">
                  <input
                    {...register("memberName")}
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
              <div className="absolute top-10">
                {/*<PolygonWarning />*/}
              </div>
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