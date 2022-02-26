import { getFirestore, getDoc, doc, updateDoc } from 'firebase/firestore'
import { useEffect } from 'react'
import { useState } from 'react'
import { Contract, providers } from 'ethers'
import { formatEther } from '@ethersproject/units'
import { useRouter } from 'next/router'
import { useWallet } from 'use-wallet'
import { roomAbi } from '../lib/abi'
import useProvider from '../lib/useProvider'
import { ApproveButton } from './ProposalButtons'

const ProposalSummary = ({ proposalId, treasuryAddress }) => {
    const { account, } = useWallet()
    const library = useProvider()
    const [proposal, setProposal] = useState([])
    const router = useRouter()
    const { roomName } = router.query
    const loading = !proposal?.author || !proposal?.creator
    useEffect(() => {
        const getProposal = async () => {
            // get proposal data
            const provider = new providers.JsonRpcProvider(
                process.env.NEXT_PUBLIC_RPC_POLYGON
            )
            const room = new Contract(treasuryAddress, roomAbi, provider)
            const proposal = await room.getProposal(proposalId)

            // get proposal metadata
            const db = getFirestore()
            const snapshot = await getDoc(doc(db, 'proposals', proposal.uri))
            const proposalMetaData = snapshot.data()
            setProposal({
                ...proposalMetaData,
                ...proposal,
            })
        }
        getProposal()
    }, [proposalId, treasuryAddress, library, account])

    const states = { 0: 'PENDING', 1: 'APPROVED', 2: 'DELIVERED', 3: 'REJECTED' }

    return (
        <div
            className="items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            {loading}
            {proposal.currency}
            <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="text-xl font-semibold text-gray-900 dark:text-daonative-gray-200">
                        {proposal.title}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {states[proposal.state]}
                        </span>
                    </div>
                </div>
                <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500 gap-1">
                            <div m>
                                MATIC
                            </div>
                            {formatEther(proposal?.amount || '0')}
                        </div>
                    </div>
                    <div className="ml-2 flex items-center text-sm text-gray-500">
                        <ApproveButton treasuryAddress={treasuryAddress} proposalId={proposalId} amount={proposal?.amount?.toString()} state={proposal.state} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const ProposalList = ({ treasuryAddress }) => {
    const { account } = useWallet()
    const library = useProvider()
    const [loading, setLoading] = useState(false)
    const [proposals, setProposals] = useState([])

    useEffect(() => {
        setLoading(true)
        const getProposals = async () => {
            const provider = new providers.JsonRpcProvider(
                process.env.NEXT_PUBLIC_RPC_POLYGON
            )
            const room = new Contract(treasuryAddress, roomAbi, provider)
            const proposals = await room.getProposals()
            console.log(proposals)
            setProposals(proposals)
            setLoading(false)
        }
        getProposals()
    }, [treasuryAddress, account])

    return (
        <ul className="flex flex-col gap-3 py-4 p-8">
            {loading && 'Loading'}
            {proposals
                .map((proposalId) => <ProposalSummary key={proposalId} proposalId={proposalId} treasuryAddress={treasuryAddress} />)
                .reverse()}
        </ul>
    )
}