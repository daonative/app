import { useWallet } from "use-wallet"
import PolygonLogo from "../public/PolygonLogo.svg"
import EthereumLogo from "../public/EthereumLogo.svg"

const PolygonWarning = () => {
  const { ethereum } = useWallet()

  const handleSwitchToPolygon = async () => {
    const params = [{
      chainId: '0x89',
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://polygonscan.com/']
    }]
    await ethereum.request({ method: 'wallet_addEthereumChain', params })
  }

  const handleSwitchToMainnet = async () => {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs w-full text-center">
        {"You're using an unsupported network."}
      </div>
      <button className="flex items-center justify-center gap-2 rounded-lg text-gray-100 bg-daonative-dark-100 p-2 w-full hover:bg-daonative-dark-300 hover:text-daonative-gray-200 " onClick={handleSwitchToMainnet}>
        <EthereumLogo className="h-4 w-4" />
        Switch to Ethereum mainnet
      </button>
      <button className="flex items-center justify-center gap-2 rounded-lg text-gray-100 bg-daonative-dark-100 p-2 w-full hover:bg-daonative-dark-300 hover:text-daonative-gray-200 " onClick={handleSwitchToPolygon}>
        <PolygonLogo className="h-4 w-4" />
        Switch to Polygon
      </button>
    </div>
  )
}

export default PolygonWarning