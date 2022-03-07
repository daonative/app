import { collection, getDocs, getFirestore, doc, collectionGroup, query, where } from "firebase/firestore"
import { useWallet } from "use-wallet"
import ConnectWalletButton from "../components/ConnectWalletButton"
import useDarkMode from "../lib/useDarkMode"
import useIsConnected from "../lib/useIsConnected"
import { useCollection, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import Link from "next/link"
import EmptyStateNoDAOs from "../components/EmptyStateNoDAOs"

const db = getFirestore()

const Home = () => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const [membershipsSnapshot, loadingRooms] = useCollection(
    query(collectionGroup(db, 'members'), where('account', '==', account || 'x'))
  )

  const rooms = membershipsSnapshot?.docs.map(doc => {
    const roomRef = doc.ref.parent.parent
    console.log(roomRef)
    return {
      roomId: roomRef.id,
      ...roomRef.data()
    }
  })

  useDarkMode()

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

  if (loadingRooms) {
    return <>Loading</>
  }
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <ul className="text-center text-xl">
        {rooms
          .map(room => (
            <li key={room.roomId} className="m-2 py-2 px-6 rounded-md bg-daonative-dark-100 hover:bg-daonative-dark-200">
              <Link href={`/dao/${room.roomId}/`}>{room.name}</Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default Home