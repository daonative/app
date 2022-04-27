import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi'

export const useWallet = () => {
    const {data: {address: account}, status} = useAccount()
    const { disconnect }  = useDisconnect()
    const {activeChain} = useNetwork()
    const walletStatus = status === "loading" ? "status" : status
    const ethereum = window?.ethereum

    return {account, chainId: activeChain?.id, status: walletStatus, disconnect, ethereum}
}