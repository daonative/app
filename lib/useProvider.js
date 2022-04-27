import { ethers } from "ethers"

const useProvider = () => {

  if (typeof window === "undefined")
    return undefined

  if (!window.ethereum)
    return undefined

  return new ethers.providers.Web3Provider(window.ethereum)
}

export default useProvider