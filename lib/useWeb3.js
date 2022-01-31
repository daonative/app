import { hooks as metaMaskHooks, metaMask } from '../components/ConnectWallet'

import { getPriorityConnector } from '@web3-react/core'

const { usePriorityConnector } = getPriorityConnector(
  [metaMask, metaMaskHooks],
)

export default usePriorityConnector