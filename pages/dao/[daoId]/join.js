import { useState } from 'react'
import ConnectWalletButton from '../../../components/ConnectWalletButton'
import useIsConnected from '../../../lib/useIsConnected'
import { useForm } from 'react-hook-form'
import { addDoc, collection, doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { useWallet } from 'use-wallet'
import { useRouter } from 'next/router'
import { useRequireAuthentication } from '../../../lib/authenticate'
import Image from 'next/image'
import { classNames } from '../../../lib/utils'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PrimaryButton } from '../../../components/Button'

import DAOnativeLogo from '/public/DAOnativeLogo.svg'
import { getRoom } from '.'
import { NextSeo } from 'next-seo'
import Head from 'next/head'


export const getServerSideProps = async ({ res, params }) => {
  const { daoId } = params
  const room = { roomId: daoId, ...await getRoom(daoId) }

  if (!room) {
    res.statusCode = 404
  }

  return {
    props: { dao: room }
  }
}

const Join = ({ dao }) => {
  const { account } = useWallet()
  const isConnected = useIsConnected()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit } = useForm()
  const { query: params, push } = useRouter()
  const requireAuthentication = useRequireAuthentication()


  const createMembershipFeedEntry = async (roomId, name) => {
    const db = getFirestore()
    const feedRef = collection(db, 'feed')
    await addDoc(feedRef, {
      roomId,
      description: "A new member joined",
      authorAccount: account,
      authorName: name,
      created: serverTimestamp()
    })
  }

  const joinDAO = async (name, inviteCode, roomId) => {
    const tokenId = await requireAuthentication({ toast: false })
    if (!tokenId) return
    await axios.post('/api/join', { name, inviteCode, roomId }, { headers: { 'Authorization': `Bearer ${tokenId}` } })
  }

  const handleJoinDAO = async (data) => {
    if (!account) return
    setIsLoading(true)
    try {
      await joinDAO(data.name, params.inviteCode, params.daoId)
      await createMembershipFeedEntry(params.daoId, data.name)
      await push(`/dao/${params.daoId}`)
    } catch (e) {
      toast.error('Invalid invite code')
    }
    setIsLoading(false)
  }

  const SEOImage = dao.profilePictureURI ? (
    dao.profilePictureURI
  ) : (
    "/DAOnativeSEOLogo.png"
  )
  const SEOUrl = "https://app.daonative.xyz"

  return (
    <>
      <Head>
        <meta property="twitter:image" content={SEOImage} />
      </Head>
      <NextSeo
        title="DAONative"
        description=""
        canonical={SEOUrl}
        openGraph={{
          url: SEOUrl,
          title: `You've been invited to join ${dao.name}`,
          description: dao.mission,
          images: [{ url: SEOImage }],
          site_name: 'DAOnative',
        }}
        twitter={{
          handle: '@daonative',
          cardType: 'summary_large_image',
        }}
      />
      <div className="overflow-hidden w-full h-screen">
        <main className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <div className={classNames("fill-daonative-white w-24 h-24 md:w-32 md:h-32 m-6", isLoading && "animate-spin-slow")}>
              <DAOnativeLogo />
            </div>
            {isConnected && !isLoading && (

              <>
                <h1 className="text-xl text-daonative-gray-300 pb-2">{dao?.name}</h1>
                <form onSubmit={handleSubmit(handleJoinDAO)}>
                  <div className="flex flex-col md:flex-row w-full">
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      className="md:w-96 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-transparent sm:text-sm rounded-md bg-daonative-component-bg text-daonative-gray-300"
                      placeholder="How should we call you?"
                    />
                    <PrimaryButton type="submit " className='ml-3'>
                      Join the DAO
                    </PrimaryButton>
                  </div>
                </form>
              </>
            )}
            {!isConnected && (
              <>
                <p className="p-6 text-gray-200 font-bold">You need to connect your wallet before you can join</p>
                <div className="w-36 h-16">
                  <ConnectWalletButton />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default Join