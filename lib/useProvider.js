import { useProvider as useWagmiProvider } from "wagmi"

const useProvider = () => {
  const provider = useWagmiProvider()
  return provider
}

export default useProvider