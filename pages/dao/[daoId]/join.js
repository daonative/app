import { useState } from 'react'
import ConnectWalletButton from '../../../components/ConnectWalletButton'
import useIsConnected from '../../../lib/useIsConnected'
import { useForm } from 'react-hook-form'
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore'
import { useWallet } from '@/lib/useWallet'
import { useRouter } from 'next/router'
import { useRequireAuthentication } from '../../../lib/authenticate'
import { classNames } from '../../../lib/utils'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PrimaryButton } from '../../../components/Button'

import DAOnativeLogo from '/public/DAOnativeLogo.svg'
import { getRoom } from '.'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import { Input } from '@/components/Input'


export const getServerSideProps = async ({ res, params }) => {
  const { daoId } = params
  const room = { roomId: daoId, ...await getRoom(daoId) }

  if (!room) {
    res.statusCode = 404
  }
  const { created, ...dao } = room

  return {
    props: { dao }
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
        title="DAOnative"
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
        <main className="flex justify-center items-center h-screen w-full">
          <div className="flex flex-col items-center w-full">
            <div className={classNames("fill-daonative-white w-24 h-24 md:w-32 md:h-32 m-6", isLoading && "animate-spin-slow")}>
              <DAOnativeLogo />
            </div>
            {!isConnected && (
              <>
                <p className="p-6 text-gray-200 font-bold text-center">You need to connect your wallet before you can join {dao.name}</p>
                <div className="">
                  <ConnectWalletButton >
                    <PrimaryButton className='h-min'>
                      Connect
                    </PrimaryButton>
                  </ConnectWalletButton>
                </div>
              </>
            )}

            {isConnected && !isLoading && (
              <>
                <form onSubmit={handleSubmit(handleJoinDAO)} className="flex flex-col md:flex-row w-full gap-3 px-6 sm:px-0 justify-center max-w-4xl">
                  <div className="flex flex-col w-full items-end">
                    <Input className="text-xl w-full" register={register} name="name" placeholder={"How should we call you?"} required />
                    <PrimaryButton
                      type="submit"
                      full
                      className='sm:ml-3 mt-3 text-xl justify-center w-full sm:min-w-max'
                    >
                      Join {dao.name}
                    </PrimaryButton>
                  </div>
                </form>
              </>
            )}
          </div>
        </main>
      </div >
    </>
  )
}

export default Join