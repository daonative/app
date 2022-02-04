import { collection, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useWallet } from "use-wallet"
import ConnectWalletButton from "../components/ConnectWalletButton"
import useDarkMode from "../lib/useDarkMode"
import useIsConnected from "../lib/useIsConnected"
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';


const db = getFirestore()

const Home = () => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const [memberships, loading] = useCollectionDataOnce(
    query(collection(db, 'memberships'), where('account', '==', account || ''))
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

  return (
    <></>
  )
}

export default Home