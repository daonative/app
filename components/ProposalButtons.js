import { Contract } from 'ethers'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useEffect } from 'react'
import { useWallet as useEthers } from 'use-wallet'
import { useInterval } from '../pages/dao/[daoId]/treasury'
import { roomAbi } from '../lib/abi'
import useProvider from '../lib/useProvider'
import { parseEther } from 'ethers/lib/utils'


export const MarkAsDeliveredButton = ({ treasuryAddress, proposalId, state }) => {
    const { account } = useEthers()
    const library = useProvider()

    const markAsDelivered = async () => {
        const signer = library.getSigner(account)
        console.log(treasuryAddress, proposalId)
        const contract = new Contract(treasuryAddress, roomAbi, signer)
        return await contract.closeProposal(proposalId)
    }

    const handleMarkAsDelivered = async () => {
        if (!account) return
        const toastId = toast.loading('Loading')
        try {
            const tx = await markAsDelivered()
            await tx.wait()
            toast.success('Proposal Funded!', { id: toastId })
        } catch (e) {
            console.error(e)
            const errorMessage = e?.message || 'Error'
            toast.error(errorMessage, { id: toastId })
        }
    }
    if (state !== 1) return null

    return (
        <button
            onClick={handleMarkAsDelivered}
            className="flex items-center px-3 py-2 border border-transparent font-medium rounded-md text-white bg-prologe-primary h-[max-content] disabled:opacity-25"
        >
            Mark as Delivered
        </button>
    )
}

export const RejectButton = ({ treasuryAddress, proposalId, amount, state }) => {
    const { account } = useEthers()
    const library = useProvider()


    const [loading, setLoading] = useState(false)
    const [deposit, setDeposit] = useState(undefined)

    const rejectProposal = async () => {
        const signer = library.getSigner(account)
        const contract = new Contract(treasuryAddress, roomAbi, signer)
        return await contract.rejectProposal(proposalId)
    }

    const getDeposit = async (address) => {
        const room = new Contract(address, roomAbi, library.getSigner(account))
        const myDeposit = await room.getDeposit()
        setDeposit(myDeposit)
    }

    useInterval(() => {
        if (!account) return
        if (!treasuryAddress) return
        getDeposit(treasuryAddress)
    }, 3000)

    const handleReject = async () => {
        if (!account) return
        setLoading(true)

        const toastId = toast.loading('Loading')
        try {
            const tx = await rejectProposal()
            await tx.wait()
            toast.success('Proposal rejected!', { id: toastId })
        } catch (e) {
            console.error(e)
            const errorMessage = e?.message || 'Error'
            toast.error(errorMessage, { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    const isPending = state === 0
    const isBelowDeposit = deposit?.lt(parseEther(amount))
    if (!isPending) return null
    return (
        <button
            onClick={handleReject}
            className="flex items-center px-3 py-2 border border-transparent font-medium rounded-md text-white bg-prologe-primary h-[max-content] disabled:opacity-25"
        >
            {loading ? 'Loading' : 'Reject'}
        </button>
    )
}

export const ApproveButton = ({ treasuryAddress, proposalId, amount, state }) => {
    const { account } = useEthers()
    const library = useProvider()

    const [deposit, setDeposit] = useState(undefined)
    const [loading, setLoading] = useState(false)

    const approveProposal = async () => {
        const signer = library.getSigner(account)
        const contract = new Contract(treasuryAddress, roomAbi, signer)
        return await contract.approveProposal(proposalId)
    }

    const getDeposit = async (address) => {
        const room = new Contract(address, roomAbi, library.getSigner(account))
        const myDeposit = await room.getDeposit()
        setDeposit(myDeposit)
    }

    useInterval(() => {
        if (!account) return
        if (!treasuryAddress) return
        getDeposit(treasuryAddress)
    }, 3000)

    const handleApprove = async () => {
        if (!account) return
        setLoading(true)

        const toastId = toast.loading('Loading')
        try {
            const tx = await approveProposal()
            await tx.wait()
            toast.success('Proposal Funded!', { id: toastId })
        } catch (e) {
            console.error(e)
            const errorMessage = e?.message || 'Error'
            toast.error(errorMessage, { id: toastId })
        } finally {
            setLoading(false)
        }
    }
    const isPending = state === 0
    if (!isPending) return null
    return (
        <button
            onClick={handleApprove}
            className="text-sm font-medium text-indigo-600 truncate">
            {loading ? 'Loading' : 'Approve & Fund'}
        </button>
    )
}

