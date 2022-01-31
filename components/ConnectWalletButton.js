import { useWallet } from 'use-wallet'


const ShortAddress = ({ length = 6, children }) => (
  typeof children === "string" ? (
    `${children.substring(0, (length / 2) + 2)}...${children.substring(children.length - length / 2)}`
  ) : ""
);

const Button = ({ children, onClick }) => (
  <button
    className="rounded-lg dark:text-gray-100 dark:bg-daonative-dark-100 dark:hover:bg-daonative-dark-200 dark:hover:text-daonative-gray-200 py-6 w-full"
    onClick={onClick}>
    {children}
  </button>
)

const ConnectWalletButton = () => {
  const wallet = useWallet()

  const isConnecting = wallet.status === "connecting"
  const isDisconnected = wallet.status === "disconnected"
  const hasConnectionError = wallet.status === "error"

  if (isConnecting) {
    return (
      <Button>Connecting...</Button>
    )
  }

  if (isDisconnected || hasConnectionError) {
    return (
      <Button onClick={() => wallet.connect()}>Connect</Button>
    )
  }

  return (
    <Button onClick={() => wallet.reset()}>
      <ShortAddress>{wallet.account}</ShortAddress> ({wallet.chainId})
    </Button>
  )
}

export default ConnectWalletButton