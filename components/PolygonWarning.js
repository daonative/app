import { useWallet } from "use-wallet"
import PolygonLogo from "../public/PolygonLogo.svg"

const PolygonWarning = () => {
  const { chainId, ethereum } = useWallet()

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

  if (chainId === 137) return <></>

  return (
    <div>
      <div className="text-xs w-full text-center pb-1">
        {"You're using a unsupported network."}
      </div>
      <button className="flex items-center justify-center gap-2 rounded-lg text-gray-100 bg-daonative-dark-100 p-2 w-full hover:bg-daonative-dark-300 hover:text-daonative-gray-200 " onClick={handleSwitchToPolygon}>
        <PolygonLogo className="h-4 w-4" />
        Switch to Polygon
      </button>
    </div>
  )
}

export default PolygonWarning