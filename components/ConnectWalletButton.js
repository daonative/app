import { useWallet } from 'use-wallet'
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Spinner from './Spinner';

const ShortAddress = ({ length = 6, children }) => (
  typeof children === "string" ? (
    `${children.substring(0, (length / 2) + 2)}...${children.substring(children.length - length / 2)}`
  ) : ""
);

const Button = ({ children, onClick }) => (
  <button
    className="rounded-lg dark:text-gray-100 dark:bg-daonative-dark-100 dark:hover:bg-daonative-dark-200 dark:hover:text-daonative-gray-200 flex justify-center items-center h-full w-full"
    onClick={onClick}>
    {children}
  </button>
)

const MetaMaskButton = ({ onClick }) => (
  <button
    type="button"
    className="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-lg px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 mr-2 mb-2 w-full h-16"
    onClick={onClick}
  >
    <img src="./metamask.svg" className="h-8 mr-4" />
    Connect with MetaMask
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

  const connectWithMetamask = () => wallet.connect('injected')

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              {showConnecting && (
                <div className="mt-5 sm:mt-6 flex">
                  <div className="text-black h-6 w-6 mr-2">
                    <Spinner />
                  </div>
                  <div>
                    Connecting...
                  </div>
                </div>
              )}
              <div className="mt-5 sm:mt-6">
                <MetaMaskButton onClick={() => connectWithMetamask()} />
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


const ConnectWalletButton = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const wallet = useWallet()

  const isConnected = wallet.status === "connected"

  const showModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  return (
    <>
      <ConnectWalletModal open={modalOpen} onClose={() => closeModal()} />
      {!isConnected && (
        <Button onClick={() => showModal()}>Connect</Button>
      )}
      {isConnected && (
        <Button onClick={() => wallet.reset()}>
          <ShortAddress>{wallet.account}</ShortAddress>
        </Button>
      )}
    </>
  )
}

export default ConnectWalletButton