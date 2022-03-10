import { useWallet } from 'use-wallet'
import ShortAddress from './ShortAddress'
import { useConnectWalletModal } from './ConnectWalletModal'
import useIsConnected from '../lib/useIsConnected'
import useMembership from '../lib/useMembership'
import PFP from './PFP'
import { useRouter } from 'next/router'
import useUser from '../lib/useUser'

const ConnectWalletButton = () => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const membership = useMembership(account, roomId)
  const user = useUser()
  const { openConnectWalletModal } = useConnectWalletModal()

  return (
    <button
      className="font-sans rounded-lg text-gray-100 bg-daonative-dark-900 hover:bg-daonative-dark-300 hover:text-daonative-gray-200 flex items-center h-full w-full p-4"
      onClick={() => { !isConnected && openConnectWalletModal() }}
    >
      {isConnected ? (
        <>
          <div className="px h-8 w-8">
            <PFP address={account} size={32} />
          </div>

          <div className="px-4">
            {user ? (
              <>{user.name}</>
            ) : (
              <ShortAddress>{account}</ShortAddress>
            )}
          </div>
        </>
      ) : (
        <div className="justify-center w-full">Connect</div>
      )}
    </button>
  )
}

export default ConnectWalletButton