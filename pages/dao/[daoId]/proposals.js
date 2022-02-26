import { useState, useEffect, useRef } from 'react'
import { getFirestore, doc, getDoc, serverTimestamp, addDoc, collection, where, orderBy, query, getDocs, updateDoc } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import toast from 'react-hot-toast'

import useLocalStorage from '../../../lib/useLocalStorage'

import SidebarNavigation from '../../../components/SidebarNavigation'
import HeaderNavigation from '../../../components/HeaderNavigation'

import { isFirestoreDate } from '../../../lib/utils';
import { useWallet } from 'use-wallet';
import useMembership from '../../../lib/useMembership';
import useProvider from '../../../lib/useProvider';
import { ethers, providers } from 'ethers';
import { roomCreatorInterface, ROOM_CREATOR_CONTRACT_ADDRESS } from '../../onboarding';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { Withdraw } from '../../../components/Withdraw';
import { roomAbi, roomCreatorAbi } from '../../../lib/abi';
import { CreateProposalButton } from '../../../components/ProposalModal';
import { ProposalList } from '../../../components/ProposalList';
const db = getFirestore()

const getRoom = async (roomId) => {
    const roomRef = doc(db, 'rooms', roomId)
    const roomSnap = await getDoc(roomRef)

    if (!roomSnap.exists()) {
        return null
    }

    return {
        ...roomSnap.data(),
        roomId: roomSnap.id
    }
}

export const getServerSideProps = async ({ params }) => {
    const { daoId: roomId } = params
    const room = await getRoom(roomId)
    return {
        props: { dao: room, }
    }
}

function CardHeader() {
    return (
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Proposals</h3>
        </div>
    )
}

export default function Proposals({ dao }) {
    const { query: params } = useRouter()
    const roomId = params?.daoId
    const [showSidebarMobile, setShowSidebarMobile] = useState(false)
    const [darkMode, setDarkMode] = useLocalStorage("darkMode", true)
    const { account } = useWallet()
    const membership = useMembership(account, roomId)

    const onShowMobileSidebar = () => setShowSidebarMobile(true)
    const onToggleDarkMode = () => setDarkMode(!darkMode)

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])


    console.log(dao.treasury)

    return (
        <>
            <div>
                <SidebarNavigation showMobile={showSidebarMobile} onClose={() => setShowSidebarMobile(false)} />
                <HeaderNavigation onShowSidebar={onShowMobileSidebar} onToggleDarkMode={onToggleDarkMode} />
                <div className="md:pl-64 flex-row md:flex overflow-hidden dark:bg-daonative-dark-300 dark:text-daonative-gray-100">
                    <main className="w-full py-6">
                        <div className="mx-auto px-4 sm:px-6 md:px-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-daonative-gray-200">Proposals</h1>
                                </div>
                            </div>
                        </div>
                        <div className="mx-auto py-4 px-4 sm:px-6 md:px-8">
                            <CreateProposalButton />
                        </div>
                        <div>
                            <ProposalList treasuryAddress={dao.treasury} />
                        </div>
                    </main>
                </div>
            </div >
        </>
    )
}