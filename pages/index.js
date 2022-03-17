import { useWallet } from "use-wallet"
import ConnectWalletButton from "../components/ConnectWalletButton"
import Link from "next/link"
import EmptyStateNoDAOs from "../components/EmptyStateNoDAOs"
import { LayoutWrapper } from '../components/LayoutWrapper'

import { useEffect, useState } from "react"
import Spinner from "../components/Spinner"
import { getUserRooms } from "../lib/useMembership"


const DAOList = ({ rooms, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex w-full justify-center p-8">
        <div className="w-8 h-8">
          <Spinner />
        </div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return <EmptyStateNoDAOs />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between w-full items-center">
        <h2 className="text-2xl">My DAOs</h2>
        <p className="text-daonative-gray-300">Choose the DAO you want to see</p>
      </div>
      <div className="w-full">
        <ul role="list" className="flex flex-col gap-3">
          {rooms?.map(room => (
            <li key={room.roomId}>
              <Link href={`/dao/${room.roomId}`}>
                <a>
                  <div className="px-4 py-4 sm:px-6 bg-daonative-component-bg rounded flex gap-4 justify-between">
                    <p className="text-sm font-medium text-daonative-gray-100">{room.name}</p>
                    <div className="flex gap-2">
                      {room?.membership?.roles?.map((role, idx) =>
                        <span key={idx} className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
                          {role}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const Home = () => {
  const [rooms, setRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { account } = useWallet()
  const isConnected = !!account

  useEffect(() => {
    const retrieveMyRooms = async () => {
      setIsLoading(true)
      setRooms([])
      const roomsData = await getUserRooms(account)
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

  return (
    <div className="flex justify-center px-8 lg:px-0">
      <div className="w-full lg:w-3/4">
        <DAOList rooms={rooms} isLoading={isLoading} />
      </div>
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