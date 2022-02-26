import { useState, useEffect, useRef } from 'react'
import { getFirestore, doc, getDoc, serverTimestamp, addDoc, collection, where, orderBy, query, getDocs, updateDoc } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast'

import useLocalStorage from '../../../lib/useLocalStorage'

import SidebarNavigation from '../../../components/SidebarNavigation'
import HeaderNavigation from '../../../components/HeaderNavigation'

import { isFirestoreDate } from '../../../lib/utils';
import { useWallet } from 'use-wallet';
import useMembership from '../../../lib/useMembership';
import useProvider from '../../../lib/useProvider';
import { ethers, providers } from 'ethers';
import { roomCreatorInterface, ROOM_CREATOR_CONTRACT_ADDRESS } from '../../onboarding';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { Withdraw } from '../../../components/Withdraw';
import { roomAbi, roomCreatorAbi } from '../../../lib/abi';

export function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) {
      return
    }

    const id = setInterval(() => savedCallback.current(), delay)

    return () => clearInterval(id)
  }, [delay])
}

export const TreasuryStats = ({ address }) => {
  const { account, chainId } = useWallet()
  const library = useProvider()
  const [deposit, setDeposit] = useState('0')
  const [etherBalance, setBalance] = useState()

  const loading = !etherBalance
  const getDeposit = async (address) => {
    if (!account) return
    const room = new ethers.Contract(address, roomAbi, library.getSigner(account))
    const myDeposit = await room.getDeposit()
    setDeposit(myDeposit)
  }

  const getBalance = async (address) => {
    const provider = new providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_POLYGON
    )
    const balance = await provider.getBalance(address)
    console.log(balance)
    setBalance(balance)
  }

  useInterval(() => {
    if (!address) return
    const handleGetDeposit = async () => {
      getDeposit(address)
      getBalance(address)
    }
    handleGetDeposit()
  }, 3000)

  return (
    <div className="mx-auto py-4 justify-between w-full m-auto">
      <dl className="sm:grid sm:grid-cols-2 col-span-6 gap-x-3 sm:divide-x divide-prologe-primary divide-opacity-25">
        <div className="flex flex-col border-b border-gray-100 p-0 text-center sm:border-0 justify-center p-2">
          <dt className="order-2 mt-2 leading-6 font-medium text-gray-500">Total Room Balance</dt>
          <dd className="order-1 font-extrabold text-indigo-600">
            {loading ? 'Loading' : <>{formatEther(etherBalance || '0')} MATIC</>}
          </dd>
        </div>
        <div className="flex flex-col border-t border-b border-gray-100 text-center sm:border-0 p-2">
          <dt className="order-3 mt-2 leading-6 font-medium text-gray-500">Your Balance</dt>
          <dd className="order-2 font-extrabold text-indigo-600 flex justify-center items-center gap-3">
            {loading ? 'Loading' : <div>{formatEther(deposit)} MATIC</div>}
            <Withdraw treasuryAddress={address} amount={deposit} />
          </dd>
        </div>
      </dl>
    </div>
  )
}

const Fund = ({ address }) => {
  const ref = useRef()
  const { account } = useWallet()
  const provider = useProvider()
  const [loading, setLoading] = useState(false)

  const deposit = async (depositAmount) => {
    const room = new ethers.Contract(address, roomAbi, provider.getSigner(account))
    const wei = parseEther(depositAmount)
    return await room.deposit({ value: wei })
  }

  const handleFund = async () => {
    const amount = ref.current.value
    if (!account) return

    const toastId = toast.loading('Adding funds to treasury')
    setLoading(true)
    try {
      const tx = await deposit(amount)
      await tx.wait()
      toast.success('Confirmed', { id: toastId })
    } catch (e) {
      console.error(e)
      const errorMessage = e?.message || 'Error'
      toast.error(errorMessage, { id: toastId })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className='flex'>
      <div className="relative rounded-md shadow-sm" style={{ maxWidth: '200px' }}>
        <input
          ref={ref}
          type="text"
          name="price"
          id="price"
          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 border-gray-300 rounded-md dark:bg-daonative-dark-100 dark:border-transparent dark:text-daonative-gray-300"
          placeholder="0.00"
          aria-describedby="price-currency"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm" id="price-currency">
            MATIC
          </span>
        </div>
      </div>
      <button
        className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={loading}
        onClick={handleFund}
      >
        {loading ? 'Loading' : 'Fund'}
      </button>
    </div>
  )
}

const db = getFirestore()


export const getRoomAddressFromCreationTxReceipt = (txReceipt) => (
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
    props: { dao: room, }
  }
}



export default function Treasury({ dao: initialDAO, }) {
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const [showSidebarMobile, setShowSidebarMobile] = useState(false)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true)
  const [daoSnapshot] = useDocument(doc(db, 'rooms', roomId))
  const { account } = useWallet()
  const provider = useProvider()
  const library = provider
  const membership = useMembership(account, roomId)
  const isAdmin = membership?.role === 'admin'
  const [loading, setLoading] = useState(false)
  const roomTreasuryAddress = initialDAO?.treasury || daoSnapshot?.data()?.treasury



  const setRoomTreasury = async (treasuryAddress) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, { treasury: treasuryAddress })
  }




  const onShowMobileSidebar = () => setShowSidebarMobile(true)
  const onToggleDarkMode = () => setDarkMode(!darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const createRoom = async (name) => {
    const signer = library.getSigner(account)
    const contract = new ethers.Contract(ROOM_CREATOR_CONTRACT_ADDRESS, roomCreatorAbi, signer)
    console.log('before event')
    contract.on('RoomCreated', (event) => {
      const db = getFirestore()
      console.log(event)
      const roomRef = doc(db, 'rooms', name)
      updateDoc(roomRef, { treasury: event })
      setLoading(false)
    })
    // const res = await axios.get('https://gasstation-mainnet.matic.network/v2')
    // add last argument options
    // var options = {gasPrice: 1000000000}; // in wei
    return await contract.createRoom(name)
  }
  const handleCreateRoom = async () => {
    if (!account) return
    const toastId = toast.loading('Creating Treasury')
    try {
      const tx = await createRoom(roomId)
      await tx.wait()
      toast.success('Confirmed', { id: toastId })
    } catch (e) {
      console.error(e)
      const errorMessage = e?.message || 'Error'
      toast.error(errorMessage, { id: toastId })
    }
  }


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
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-daonative-gray-200">Treasury {roomTreasuryAddress}</h1>
                  {!roomTreasuryAddress &&
                    <>
                      <p className="py-2 text-sm">Setup a treasury to:</p>
                      <ul>
                        <li>
                          Easily fund proposals
                        </li>
                        <li>
                          Make it easy to reward your community
                        </li>
                      </ul>
                    </>
                  }
                </div>
              </div>
            </div>
            <div className="mx-auto py-4 px-4 sm:px-6 md:px-8">
              {roomTreasuryAddress ? <>
                <TreasuryStats address={roomTreasuryAddress} />
                <Fund address={roomTreasuryAddress} />
              </> :
                <button
                  onClick={handleCreateRoom}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Get Started
                </button>
              }
            </div>
          </main>
        </div>
      </div >
    </>
  )
}