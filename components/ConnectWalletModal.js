import { useWallet } from 'use-wallet'
import { createContext, Fragment, useEffect, useState, useContext } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Spinner from './Spinner';
import { Modal, ModalBody, ModalTitle } from './Modal';

const MetaMaskButton = ({ onClick }) => (
  <button
    type="button"
    className="text-gray-900  hover:bg-gray-100 font-medium rounded-lg text-lg px-5 py-2.5 text-center inline-flex items-center bg-daonative-dark-200 text-daonative-gray-200 hover:bg-daonative-component-bg w-full h-16"
    onClick={onClick}
  >
    <img src="/metamask.svg" className="h-8 mr-4" />
    MetaMask
  </button>
)

const WalletConnectButton = ({ onClick }) => (
  <button
    type="button"
    className="text-gray-900  hover:bg-gray-100 font-medium rounded-lg text-lg px-5 py-2.5 text-center inline-flex items-center bg-daonative-dark-200 text-daonative-gray-200 hover:bg-daonative-component-bg w-full h-16"
    onClick={onClick}
  >
    <img src="/walletconnect.svg" className="h-8 mr-4" />
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
    <Modal show={open} onClose={onClose}>
      <ModalTitle>Select a wallet</ModalTitle>
      <ModalBody>
        <div className="my-4">
          <MetaMaskButton onClick={() => handleMetaMask()} />
        </div>
        <div className="my-4">
          <WalletConnectButton onClick={() => handleWalletConnect()} />
        </div>
        <div className="mt-5 h-6 sm:mt-6 flex text-daonative-gray-100">
          {showConnecting && (
            <>
              <div className="h-6 w-6 mr-2">
                <Spinner />
              </div>
              <div>
                Connecting...
              </div>
            </>
          )}
        </div>

      </ModalBody>
    </Modal>
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