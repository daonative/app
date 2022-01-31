import dynamic from 'next/dynamic'
import usePriorityConnector from '../lib/useWeb3'

const ConnectWallet = dynamic(() => import('../components/ConnectWallet'), { ssr: false })

const Connect = () => {
  console.log(usePriorityConnector)
  return (
    <div className="dark flex justify-center items-center bg-daonative-dark-300 h-screen w-full">
      <div className="w-48">
        <ConnectWallet />
      </div>
    </div>
  )
}

export default Connect