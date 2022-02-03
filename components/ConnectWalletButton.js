import { useWallet } from 'use-wallet'
import ShortAddress from './ShortAddress'
import { useConnectWalletModal} from './ConnectWalletModal'
import useIsConnected from '../lib/useIsConnected'

const Button = ({ children, onClick }) => (
  <button
    className="rounded-lg text-gray-100 bg-daonative-dark-100 hover:bg-daonative-dark-200 hover:text-daonative-gray-200 flex justify-center items-center h-full w-full"
    onClick={onClick}>
    {children}
  </button>
)

const ConnectWalletButton = () => {
  const wallet = useWallet()
  const isConnected = useIsConnected()
  const { openConnectWalletModal } = useConnectWalletModal()

  return (
    <>
      {isConnected ? (
        <Button>
          <ShortAddress>{wallet.account}</ShortAddress>
        </Button>
      ) : (
        <Button onClick={openConnectWalletModal}>
          Connect
        </Button>
      )}
    </>
  )
}

export default ConnectWalletButton