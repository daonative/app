import { useWallet } from 'use-wallet'
import ShortAddress from './ShortAddress'
import { useConnectWalletModal } from './ConnectWalletModal'
import useIsConnected from '../lib/useIsConnected'
import PFP from './PFP'

const ConnectWalletButton = () => {
  const wallet = useWallet()
  const isConnected = useIsConnected()
  const { openConnectWalletModal } = useConnectWalletModal()

  return (
    <button
      className="rounded-lg text-gray-100 bg-daonative-dark-100 hover:bg-daonative-dark-200 hover:text-daonative-gray-200 flex items-center h-full w-full p-4"
      onClick={() => { !isConnected && openConnectWalletModal() }}
    >
      {isConnected ? (
        <>
          <div className="px h-8 w-8">
            <PFP address={wallet.account} size={32} />
          </div>
          <div className="px-4">
            <ShortAddress>{wallet.account}</ShortAddress>
          </div>
        </>
      ) : (
        <div className="justify-center w-full">Connect</div>
      )}
    </button>
  )
}

export default ConnectWalletButton