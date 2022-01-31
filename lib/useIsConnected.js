import { useWallet } from "use-wallet"

const useIsConnected = () => {
  const wallet = useWallet()

  return wallet.status === "connected"
}

export default useIsConnected