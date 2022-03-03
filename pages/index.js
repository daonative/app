import { collection, getDocs, getFirestore, doc } from "firebase/firestore"
import { useWallet } from "use-wallet"
import ConnectWalletButton from "../components/ConnectWalletButton"
import useDarkMode from "../lib/useDarkMode"
import useIsConnected from "../lib/useIsConnected"
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
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
  const [user, loading] = useDocumentDataOnce(
    doc(db, 'users', account || 'x')
  )

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
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <ul className="text-center text-xl">
        {rooms
          .filter(room => user?.rooms?.includes(room.roomId))
          .map(room => (
            <li key={room.roomId} className="m-2 py-2 px-6 rounded-md dark:bg-daonative-dark-100 dark:hover:bg-daonative-dark-200">
              <Link href={`/dao/${room.roomId}/`}>{room.name}</Link>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default Home