import { useWallet } from 'use-wallet'
import { Contract } from 'ethers'
import toast from 'react-hot-toast'
import { roomAbi } from '../lib/abi'
import useProvider from '../lib/useProvider'


export const Withdraw = ({ treasuryAddress, amount }) => {
    const { account, } = useWallet()
    const library = useProvider()

    const withdraw = async () => {
        const signer = library.getSigner(account)
        const contract = new Contract(treasuryAddress, roomAbi, signer)
        return await contract.withdraw(amount, { gasPrice: 40000000000 })
    }
    const handleWithdraw = async () => {
        if (!account) return
        const toastId = toast.loading('Loading')
        try {
            const tx = await withdraw()
            await tx.wait()
            toast.success('Confirmed', { id: toastId })
        } catch (e) {
            console.error(e)
            const errorMessage = e?.message || 'Error'
            toast.error(errorMessage, { id: toastId })
        }
    }
    if (!account) return null
    return (
        <button
            onClick={handleWithdraw}
            className="flex items-center px-3 py-2 border border-transparent font-medium rounded-md text-white bg-prologe-primary h-[max-content]"
        >
            Claim
        </button>
    )
}