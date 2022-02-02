import { useWallet } from 'use-wallet'
import { createContext, Fragment, useEffect, useState, useContext } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Spinner from './Spinner';

const MetaMaskButton = ({ onClick }) => (
  <button
    type="button"
    className="text-gray-900 bg-white hover:bg-gray-100 font-medium rounded-lg text-lg px-5 py-2.5 text-center inline-flex items-center dark:bg-daonative-dark-200 dark:text-daonative-gray-200 dark:hover:bg-daonative-dark-100 w-full h-16"
    onClick={onClick}
  >
    <img src="./metamask.svg" className="h-8 mr-4" />
    MetaMask
  </button>
)

const WalletConnectButton = ({ onClick }) => (
  <button
    type="button"
    className="text-gray-900 bg-white hover:bg-gray-100 font-medium rounded-lg text-lg px-5 py-2.5 text-center inline-flex items-center dark:bg-daonative-dark-200 dark:text-daonative-gray-200 dark:hover:bg-daonative-dark-100 w-full h-16"
    onClick={onClick}
  >
    <img src="./walletconnect.svg" className="h-8 mr-4" />
    WalletConnect
  </button>
)

const ConnectWalletModal = ({ open, onClose }) => {
  const [showConnecting, setShowConnecting] = useState(false)
  const wallet = useWallet();

  const isConnecting = wallet.status === "connecting"
  const isConnected = wallet.status === "connected"

  // Close the modal when the status becomes "connected"
  useEffect(() => {
    if (isConnected) onClose()
  }, [isConnected, onClose])

  // Avoid showing the connecting loader for a split second
  useEffect(() => {
    if (isConnecting) setTimeout(() => setShowConnecting(true), 500)
  }, [isConnecting])

  // Reset connecting loading status when modal is opened or closed
  useEffect(() => {
    setShowConnecting(false)
  }, [open])

  const handleMetaMask = () => wallet.connect('injected')
  const handleWalletConnect = () => wallet.connect('walletconnect')

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-40 inset-0 overflow-y-auto" onClose={onClose}>
        <div className="flex justify-center items-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white dark:bg-daonative-dark-300 rounded-lg px-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
              {showConnecting && (
                <div className="mt-5 sm:mt-6 flex text-black dark:text-daonative-gray-100">
                  <div className="h-6 w-6 mr-2">
                    <Spinner />
                  </div>
                  <div>
                    Connecting...
                  </div>
                </div>
              )}
              <div className="my-4">
                <MetaMaskButton onClick={() => handleMetaMask()} />
              </div>
              <div className="my-4">
                <WalletConnectButton onClick={() => handleWalletConnect()} />
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

const ConnectWalletModalContext = createContext()
export const ConnectWalletModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openConnectWalletModal = () => setIsOpen(true)
  const closeConnectWalletModal = () => setIsOpen(false)

  return (
    <ConnectWalletModalContext.Provider value={{ openConnectWalletModal, closeConnectWalletModal }}>
      <ConnectWalletModal open={isOpen} onClose={closeConnectWalletModal} />
      {children}
    </ConnectWalletModalContext.Provider>
  )
}

export const useConnectWalletModal = () => {
  return useContext(ConnectWalletModalContext);
}

export default ConnectWalletModal