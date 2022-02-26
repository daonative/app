import { useState } from 'react';
import { useRouter } from 'next/router';
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from './Modal';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Spinner from './Spinner';
import { useWallet } from 'use-wallet';
import useMembership from '../lib/useMembership';
import toast from 'react-hot-toast';
import { useDocument } from 'react-firebase-hooks/firestore';
import { addDoc, collection, doc, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore';
import useProvider from '../lib/useProvider';
import { Contract } from 'ethers';
import { roomAbi } from '../lib/abi';
import { parseEther } from 'ethers/lib/utils';

const DESCRIPTION_PLACEHOLDER = `
## Idea
The core members of the DAO contribute to the newsletter with a short and interesting piece of their choice.
## Motivation
It keeps everyone engagned in the community
## Timeline
Could be delivered 1 - 2 weeks after the approval
`
const db = getFirestore()

const createProposal = async (data, roomName, author) => {
    const db = getFirestore()
    const proposal = {
        room: roomName,
        ...data,
        created: serverTimestamp(),
        author: author,
    }
    const doc = await addDoc(collection(db, 'proposals'), proposal)
    return doc
}
const setProposalId = async (uri, id) => {
    const db = getFirestore()
    const proposalRef = doc(db, 'proposals', uri)
    await updateDoc(proposalRef, {
        proposalId: id,
        verified: true
    })
}


const ProposalModal = ({ show, onClose }) => {
    const { query: params } = useRouter();
    const roomId = params?.daoId;
    const { account } = useWallet();
    const membership = useMembership(account, roomId);
    const [daoSnapshot] = useDocument(doc(db, 'rooms', roomId))
    const treasuryAddress = daoSnapshot?.data()?.treasury
    const library = useProvider()


    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

    const [waitingOnProposalId, setWaitingOnProposalId] = useState()
    const roomName = roomId
    const isLoading = isSubmitting || waitingOnProposalId

    const handleCreate = async (data) => {
        if (!account) return
        const toastId = toast.loading('Loading')
        try {
            const doc = await createProposal(data, roomName, account)
            const uri = doc.id
            const signer = library.getSigner(account)
            const room = new Contract(treasuryAddress, roomAbi, signer)

            // could be problematic if someone fires call this in parallel
            setWaitingOnProposalId(true)
            room.on('SubmitProposal', (proposal) => {
                setProposalId(uri, proposal.id)
                setWaitingOnProposalId(false)
                onClose()
            })
            const tx = await room.submitProposal(uri, parseEther(data.amount))
            await tx.wait()
            toast.success('Confirmed', { id: toastId })
        } catch (e) {
            console.error(e)
            const errorMessage = e?.message || 'Error'
            toast.error(errorMessage, { id: toastId })
        }
    }


    return (
        <Modal show={show} onClose={onClose}>
            <ModalTitle>Request for Funding</ModalTitle>
            <form onSubmit={handleSubmit(handleCreate)}>
                <ModalBody>
                    <div className='flex flex-col gap-y-3'>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-daonative-dark-100 dark:border-transparent dark:text-daonative-gray-300"
                                placeholder="Create a Bi-Weekly Newsletter"
                                label="Title"
                                {...register('title', { required: true })}
                            />
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Requested Amount
                            </label>

                            <div className="relative rounded-md shadow-sm" style={{ maxWidth: '200px' }}>
                                <input
                                    type="text"
                                    name="price"
                                    id="price"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 border-gray-300 rounded-md dark:bg-daonative-dark-100 dark:border-transparent dark:text-daonative-gray-300"
                                    placeholder="0.00"
                                    aria-describedby="price-currency"
                                    {...register('amount', { required: true })}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm" id="price-currency">
                                        MATIC
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalActionFooter>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-daonative-dark-100 dark:text-daonative-gray-100"
                        disabled={isSubmitting}
                    >Request Funds</button>

                </ModalActionFooter>
            </form>
        </Modal>);
};

export const CreateProposalButton = () => {
    const { query: params } = useRouter();
    const roomId = params?.daoId;
    const { account } = useWallet();
    const membership = useMembership(account, roomId);
    const isMember = !!membership;


    const [showModal, setShowModal] = useState(false);
    const handleShowModal = () => {
        setShowModal((showModal) => !showModal);
    };

    const handleClose = () => {
        setShowModal(false);
    };



    if (!isMember)
        return <></>;

    return (
        <>
            <ProposalModal show={showModal} onClose={handleClose} />
            <button
                onClick={handleShowModal}
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Create a Proposal
            </button>
        </>
    );
};
