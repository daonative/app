import { useState, useEffect } from 'react'
import { getFirestore, getDoc, doc } from "firebase/firestore"
import { useRouter } from 'next/router';
import { useDocument } from 'react-firebase-hooks/firestore';


import KPIs from '../../../components/KPIs'
import useMembership from '../../../lib/useMembership';
import { useWallet } from '@/lib/useWallet';
import { useRequireAuthentication } from '../../../lib/authenticate';
import { Members } from './members';
import { LayoutWrapper } from '../../../components/LayoutWrapper';
import { PrimaryButton, SecondaryButton } from '../../../components/Button';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { useProfileModal } from '../../../components/ProfileModal';
import axios from 'axios';
import { classNames } from '@/lib/utils';
import { DAOProfileModal, DAOProfilePicture } from '../../../components/DAOProfileModal';
import { DAOMission } from '../../../components/DAOMission';
import { DAOSocials } from "@/components/DAOSocials"



export const getRoom = async (roomId) => {
  const db = getFirestore()
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

  if (!room) return {
    notFound: true
  }

  const { created, ...dao } = room;

  return {
    props: { dao }
  }
}



const DAOProfileButton = ({ roomId, room, canEditProfile }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleOpenUploadModal = () => setIsProfileModalOpen(true)
  const handleCloseUploadModal = () => setIsProfileModalOpen(false)

  return (
    <div className={canEditProfile && "hover:cursor-pointer"} onClick={() => canEditProfile && handleOpenUploadModal()}>
      <DAOProfileModal show={isProfileModalOpen} onClose={handleCloseUploadModal} roomId={roomId} room={room} />
      <DAOProfilePicture roomId={roomId} profilePictureURI={room.profilePictureURI} />
    </div>
  )
}



const ClaimMembershipButton = ({ roomId, onClick = () => { } }) => {
  const requireAuthentication = useRequireAuthentication()

  const joinRoom = async () => {
    const toastId = toast.loading('Joining the DAO')
    try {
      const tokenId = await requireAuthentication()
      const authHeaders = { headers: { 'Authorization': `Bearer ${tokenId}` } }
      await axios.post('/api/tokengating/join', { roomId }, authHeaders)
      toast.success('You are now a member!', { id: toastId })
    } catch (e) {
      toast.error('Unable to join the room', { id: toastId })
    }
  }

  const handleClick = () => {
    onClick()
    joinRoom()
  }

  return (
    <PrimaryButton onClick={handleClick}>
      Join
    </PrimaryButton>
  )
}

const Dashboard = ({ dao: initialDAO }) => {
  const { query: params } = useRouter()
  const roomId = params?.daoId
  const db = getFirestore()
  const [daoSnapshot] = useDocument(doc(db, 'rooms', roomId))
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const isAdmin = !!membership?.roles?.includes('admin')
  const { openProfileModal } = useProfileModal()

  const dao = daoSnapshot ? {
    ...daoSnapshot.data(),
    roomId: daoSnapshot.id
  } : initialDAO

  const SEOImage = initialDAO.profilePictureURI ? (
    initialDAO.profilePictureURI
  ) : (
    "/DAOnativeSEOLogo.png"
  )
  const SEOUrl = "https://app.daonative.xyz"



  useEffect(() => {
    const userNameBanner = async () => {
      const db = getFirestore()
      const userRef = doc(db, 'users', account)
      const userDoc = await getDoc(userRef)
      const user = userDoc.data()

      if (userDoc.exists() && user.name) return

      toast(() => (
        <span className="text-center hover:cursor-pointer" onClick={(t) => {
          openProfileModal("settings")
          toast.dismiss(t.id)
        }}>
          Looks like you {"don't"} have a name set. Click here to set one.
        </span>
      ), {
        icon: '💬',
        duration: 10000
      })
    }

    if (!account) return

    userNameBanner()
  }, [account, openProfileModal])

  useEffect(() => {
    const checkCanJoin = async () => {
      const db = getFirestore()
      const membershipRef = doc(db, 'rooms', roomId, 'members', account)
      const membershipDoc = await getDoc(membershipRef)

      // Already a member, no need to check anymore
      if (membershipDoc.exists()) return

      const response = await axios.post('/api/tokengating/has-access', { roomId, account })
      const { hasAccess } = response.data

      if (!hasAccess) return

      toast.custom((t) => (
        <div
          className={classNames(
            `${t.visible ? 'animate-enter' : 'animate-leave'}`,
            'max-w-xl w-full shadow-lg rounded-lg pointer-events-auto flex justify-between',
            'items-center border border-daonative-modal-border p-2 bg-daonative-component-bg'
          )}
        >
          You are a tokenholder and can join this community!
          <div className="flex gap-1">
            <ClaimMembershipButton roomId={roomId} onClick={() => toast.dismiss(t.id)}>
              Join
            </ClaimMembershipButton>
            <SecondaryButton onClick={() => toast.dismiss(t.id)}>
              Dismiss
            </SecondaryButton>
          </div>
        </div>
      ), { duration: Infinity, position: 'top-center' })
    }

    if (!account || !roomId) return

    checkCanJoin()
  }, [account, roomId]);

  return (
    <>
      <Head>
        <meta property="twitter:image" content={SEOImage.replace('ipfs.infura.io', 'cloudflare-ipfs.com')} />
      </Head>
      <NextSeo
        title="DAONative"
        description=""
        canonical={SEOUrl}
        openGraph={{
          url: SEOUrl,
          title: `DAOnative | ${initialDAO.name}`,
          description: initialDAO.mission,
          images: [{ url: SEOImage }],
          site_name: 'DAOnative',
        }}
        twitter={{
          handle: '@daonative',
          cardType: 'summary_large_image',
        }}
      />
      <LayoutWrapper>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex gap-4 items-center">
            <div>
              {roomId && dao && <DAOProfileButton roomId={roomId} room={dao} canEditProfile={isAdmin} />}

            </div>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className="text-3xl font-semibold text-gray-900 text-daonative-gray-200">{dao.name}</h1>
                <DAOSocials room={dao} />
              </div>
              <DAOMission roomId={roomId} mission={dao.mission} />
            </div>
          </div>
        </div>
        <div className="py-4 mx-auto px-4 sm:px-6 md:px-8">
          <KPIs roomId={roomId} kpis={dao.kpis} />
        </div>
        <div className="py-4 mx-auto">
          <Members />
        </div>
      </LayoutWrapper>

    </>
  )
}

export default Dashboard