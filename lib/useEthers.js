import { useWallet } from "use-wallet"
import { ethers } from "ethers"

const useEthers = () => {
  const wallet = useWallet()

  if (!wallet.ethereum)
    return undefined
  
  return new ethers.providers.Web3Provider(wallet.ethereum)
}

export default useEthers