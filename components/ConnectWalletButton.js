import { useWallet } from 'use-wallet'
import { useConnectWalletModal } from './ConnectWalletModal'
import useIsConnected from '../lib/useIsConnected'
import PFP from './PFP'
import { useProfile } from './ProfileProvider'
import { CheckCircleIcon } from '@heroicons/react/solid'

const ConnectWalletButton = ({ children }) => {
  const { account } = useWallet()
  const { displayName, displayNameVerified, avatar } = useProfile()
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
            {/* eslint-disable @next/next/no-img-element */}
            {avatar ? (
              <img src={avatar} className="rounded-full h-8 w-8" alt="User profile" />
            ) : (
              <PFP address={account} size={32} />
            )}
            {/* eslint-enable @next/next/no-img-element */}
          </div>

          <div className="px-4">
            <div className="flex gap-1 items-center">
              {displayName}
              {displayNameVerified && <CheckCircleIcon className="h-3 w-3 text-daonative-white" />}
            </div>
          </div>
        </>
      ) : (
        <div className="justify-center w-full">{children ? children : 'Connect'} </div>
      )}
    </button>
  )
}

export default ConnectWalletButton