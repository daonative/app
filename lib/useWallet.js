import { useAccount, useDisconnect, useNetwork } from 'wagmi'

export const useWallet = () => {
    const {data: account, status} = useAccount()
    const { disconnect }  = useDisconnect()
    const {activeChain} = useNetwork()
    const ethereum = typeof window !== 'undefined' ? window?.ethereum : undefined
    const walletStatus = status === "loading" ? "connecting" : status

    return {account: account?.address, chainId: activeChain?.id, status: walletStatus, reset: disconnect, ethereum}
}