import { useWallet } from '@/lib/useWallet'
import { UserAvatar, UserName } from './PFP'
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ConnectWalletButton = ({ children }) => {
  const { account } = useWallet()

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <button
          className="font-sans rounded-lg text-gray-100 bg-daonative-dark-900 hover:bg-daonative-dark-300 hover:text-daonative-gray-200 flex items-center h-full p-4"
          onClick={() => { !account && openConnectModal() }}
        >
          {account ? (
            <>
              <div className="h-10 w-10">
                <UserAvatar account={account} />
              </div>
              <div className="px-4">
                <UserName account={account} />
              </div>
            </>
          ) : (
            <div className="justify-center">{children ? children : 'Connect'} </div>
          )}
        </button>

      )}
    </ConnectButton.Custom>
  )
}

export default ConnectWalletButton