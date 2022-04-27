import { useWallet } from "@/lib/useWallet"

const useIsConnected = () => {
  const wallet = useWallet()

  return !!wallet.account 
}

export default useIsConnected