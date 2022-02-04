import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useWallet } from "use-wallet"
import ConnectWalletButton from "../components/ConnectWalletButton"
import useDarkMode from "../lib/useDarkMode"
import useIsConnected from "../lib/useIsConnected"
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';
import Link from "next/link"

const db = getFirestore()

const getRooms = async () => {
  const db = getFirestore()
  const snapshot = await getDocs(collection(db, 'rooms'))
  return snapshot.docs.map((doc) => ({ roomId: doc.id, ...doc.data() }))
}

export const getServerSideProps = async ({ params }) => {
  const rooms = await getRooms()
  return { props: { rooms } }
}

const Home = ({ rooms }) => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const [memberships, loading] = useCollectionDataOnce(
    query(collection(db, 'memberships'), where('account', '==', account || ''))
  )
  const membershipRooms = memberships?.map(membership => membership.roomId) || []

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

  if (loading) {
    return <>Loading</>
  }

  return (
    <ul>
      {rooms
        .filter(room => membershipRooms.includes(room.roomId))
        .map(room => (
          <li key={room.roomId}><Link href={`/dao/${room.roomId}/`}>{room.name}</Link></li>
        ))
      }
    </ul>
  )
}

export default Home