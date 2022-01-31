import { MetaMask } from '@web3-react/metamask'
import { initializeConnector } from '@web3-react/core'


export const [metaMask, hooks] = initializeConnector((actions) => new MetaMask(actions))
const { useChainId, useAccounts, useError, useIsActivating, useIsActive, useProvider, useENSNames } = hooks



const ShortAddress = ({ length = 6, children }) => (
  typeof children === "string" ? (
    `${children.substring(0, (length / 2) + 2)}...${children.substring(children.length - length / 2)}`
  ) : ""
);

const ConnectWallet = () => {
  const isActivating = useIsActivating()
  const accounts = useAccounts()
  const account = accounts && accounts.length > 0 && accounts[0]
  const chainId = useChainId();

  const onConnect = () => metaMask.activate()

  return (
    <button className="rounded-lg dark:text-gray-100 dark:bg-daonative-dark-100 dark:hover:bg-daonative-dark-200 dark:hover:text-daonative-gray-200 py-6 w-full"
      onClick={onConnect}>
      {isActivating && !account && "Connecting..."}
      {isActivating && !account && "Connect"}
      {!isActivating && (
        <>
          <ShortAddress>{account}</ShortAddress> ({chainId})
        </>
      )}
    </button>
  )
}

export default ConnectWallet