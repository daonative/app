import { useWallet } from 'use-wallet'
import { useConnectWalletModal } from './ConnectWalletModal'
import useIsConnected from '../lib/useIsConnected'
import { UserAvatar, UserName } from './PFP'

const ConnectWalletButton = ({ children }) => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const { openConnectWalletModal } = useConnectWalletModal()

  return (
    <button
      className="font-sans rounded-lg text-gray-100 bg-daonative-dark-900 hover:bg-daonative-dark-300 hover:text-daonative-gray-200 flex items-center h-full w-full p-4"
      onClick={() => { !isConnected && openConnectWalletModal() }}
    >
      {isConnected ? (
        <>
          <div className="h-8 w-8">
            <UserAvatar account={account} />
          </div>
          <div className="px-4">
            <UserName account={account} />
          </div>
        </>
      ) : (
        <div className="justify-center w-full">{children ? children : 'Connect'} </div>
      )}
    </button>
  )
}

export default ConnectWalletButton