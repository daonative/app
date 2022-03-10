import { collection, getDocs, getFirestore, doc, collectionGroup } from "firebase/firestore"
import { useWallet } from "use-wallet"
import ConnectWalletButton from "../components/ConnectWalletButton"
import useDarkMode from "../lib/useDarkMode"
import useUser from "../lib/useUser"
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import Link from "next/link"
import EmptyStateNoDAOs from "../components/EmptyStateNoDAOs"
import { LayoutWrapper } from '../components/LayoutWrapper'

import { query, where, documentId } from 'firebase/firestore'
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useEffect, useState } from "react"

const db = getFirestore()

const Home = () => {
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { account } = useWallet()
  const isConnected = !!account
  

  useEffect(() => {
    const getMyRoomIds = async () => {
      const membershipsQuery = query(collectionGroup(db, 'members'), where('account', '==', account))
      const membershipsSnapshot = await getDocs(membershipsQuery)
      return membershipsSnapshot.docs.map(doc => doc?.ref?.parent?.parent?.id)
    }

    const getRooms = async (roomIds) => {
      if (roomIds?.length === 0) return []

      const roomsQuery = query(collection(db, 'rooms'), where(documentId(), 'in', roomIds))
      const roomsSnapshot = await getDocs(roomsQuery)
      return roomsSnapshot.docs.map(doc => ({roomId: doc.id, ...doc.data()}))
    }

    const retrieveMyRooms = async () => {
      setIsLoading(true)
      setRooms([])

      const roomIds = await getMyRoomIds()
      const roomsData = await getRooms(roomIds)

      setRooms(roomsData)
      setIsLoading(false)
    }

    if (!isConnected) return

    retrieveMyRooms()
  }, [account, isConnected])

  if (!isConnected) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <p className="p-6 text-gray-200 font-bold">You need to connect your wallet before you can continue</p>
        <div className="w-36 h-16">
          <ConnectWalletButton />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <></>
  }

  if (rooms.length === 0) {
    return <EmptyStateNoDAOs />
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <ul className="text-center text-xl">
        {rooms.map(room => (
            <li key={room.roomId} className="m-2 py-2 px-6 rounded-md bg-daonative-dark-100 hover:bg-daonative-dark-200">
              <Link href={`/dao/${room.roomId}/`}>{room.name}</Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

const HomePage = () => {
  return (
    <LayoutWrapper>
      <Home />
    </LayoutWrapper>
  )
}

export default HomePage