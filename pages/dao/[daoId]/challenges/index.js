import { useForm } from 'react-hook-form'
import { addDoc, collection, getFirestore, orderBy, query, serverTimestamp, where } from 'firebase/firestore'

import { LayoutWrapper } from '../../../../components/LayoutWrapper'
import { PrimaryButton } from '../../../../components/Button'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../../components/Modal'
import Spinner from '../../../../components/Spinner'

import useRoomId from '../../../../lib/useRoomId'
import { useState } from 'react'
import { useRequireAuthentication } from '../../../../lib/authenticate'
import useDarkMode from '../../../../lib/useDarkMode'
import { useCollection } from 'react-firebase-hooks/firestore'
import { CheckIcon, PlusIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import EmptyStateNoChallenges from '../../../../components/EmptyStateNoChallenges'
import { useWallet } from '@/lib/useWallet'
import useMembership from '../../../../lib/useMembership'
import { Card } from '../../../../components/Card'
import { Input, TextField } from '../../../../components/Input'
import { TextArea } from '../../../../components/TextArea'
import Moment from 'react-moment'
import Image from 'next/image'



const ChallengeModal = ({ show, onClose, challengeId }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm()
  const requireAuthentication = useRequireAuthentication()
  const roomId = useRoomId()

  const createChallenge = async (data) => {
    const db = getFirestore()
    const rules = { imageRequired: data?.imageRequired || false }
    const deadline = data?.deadline ? new Date(data.deadline) : null
    const challenge = {
      title: data.title,
      description: data.description,
      weight: Number(data.weight),
      created: serverTimestamp(),
      status: 'open',
      rules,
      deadline,
      roomId,
    }
    await addDoc(collection(db, 'challenges'), challenge)
  }

  const handleCloseModal = () => {
    onClose()
  }

  const handleSaveChallenge = async (data) => {
    await requireAuthentication()
    await createChallenge(data)
    handleCloseModal()
    reset()
  }

  return (
    <Modal show={show} onClose={handleCloseModal}>
      <form onSubmit={handleSubmit(handleSaveChallenge)}>
        <ModalTitle>{challengeId ? "Edit challenge" : "Create a challenge"}</ModalTitle>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <TextField label="Title" name="title" register={register} required />
              {errors.title && (
                <span className="text-xs text-red-400">You need to set a title</span>
              )}
            </div>
            <div>
              <TextArea label="Description" name="description" register={register} required />
            </div>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <label className="block text-sm font-medium pb-2">
                  Weight
                </label>
                <div className="relative rounded-md shadow-sm" style={{ maxWidth: '100px' }}>
                  <Input register={register} name="weight" required placeholder="100" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm" id="price-currency">
                      XPs
                    </span>
                  </div>
                </div>
              </div>
              <div className='sm:w-1/2'>
                <div className="flex justify-between">
                  <label htmlFor="email" className="block text-sm font-medium pb-2">
                    Submission deadline
                  </label>
                  <span className="text-sm text-gray-500" id="email-optional pb-2">
                    Optional
                  </span>
                </div>
                <input style={{ colorScheme: 'dark' }} type="datetime-local" {...register("deadline", { required: false })} className="w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block m:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent" />
              </div>
            </div>
            <div>
              <input type="checkbox" {...register("imageRequired", { required: false })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 inline-block sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent" id="imageRequired" />
              <label className="inline-block text-sm font-medium py-2 pl-2" htmlFor="imageRequired">
                Require each submission to upload an image
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 mx-auto"><Spinner /></span>
            ) : (
              <>Submit Challenge</>
            )}
          </PrimaryButton>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}


const ChallengeItem = ({ title, weight, deadline, meta }) =>
  <Card onClick={() => null}>
    <div className="flex items-center justify-between">
      <div className='flex gap-3'>
        {/* <PFP address={`${Math.floor(Math.random() * 10000)}`} size={64} /> */}
        <div className='flex min-w-max'>
          <Image className="min-w-max" width="64" height="64" src="/challenge.svg" alt="sample-challenge-picture" />
        </div>
        <div className='flex flex-col justify-between'>
          <p className="text-sm font-semibold  whitespace-normal ">{title}</p>
          <div className="text-sm text-daonative-subtitle">
            {deadline?.toMillis() && new Date().getTime() < deadline?.toMillis() && (
              <>Ends <Moment date={deadline?.toMillis()} fromNow={true} /></>
            )}

          </div>
        </div>
      </div>
      <div className='flex flex-col items-end min-w-max gap-3'>
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {weight} XP
          </span>
        </div>
        <div className="mt-2 flex items-center text-sm text-daonative-gray-300 sm:mt-0">
          <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
          <p>
            {meta?.submissionCount || 0} Completions
          </p>
        </div>
      </div>
    </div>
  </Card >

const Challenges = () => {
  const db = getFirestore()
  const roomId = useRoomId()
  const { account } = useWallet()
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [challengesSnapshot, loading] = useCollection(
    query(collection(db, 'challenges'), where('roomId', '==', roomId || ''), orderBy('created', 'desc')))
  const challenges = challengesSnapshot?.docs.map(doc => ({ challengeId: doc.id, ...doc.data() }))

  const membership = useMembership(account, roomId)
  const isAdmin = membership?.roles?.includes('admin')

  useDarkMode()

  const handleShowChallengeModal = () => setShowChallengeModal(true)
  const handleCloseChallengeModal = () => setShowChallengeModal(false)

  return (
    <LayoutWrapper>
      <ChallengeModal show={showChallengeModal} onClose={handleCloseChallengeModal} />
      <div className="mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Latest Challenges</h2>
            {challenges?.length > 0 && isAdmin && <PrimaryButton onClick={handleShowChallengeModal}>Add a challenge</PrimaryButton>}
          </div>
          {challenges?.length > 0 ? (
            <ul role="list" className="flex flex-col gap-3">
              {challenges?.filter(challenge => challenge?.status !== 'closed').map((challenge) => (
                <Link key={challenge.challengeId} href={`/dao/${roomId}/challenges/${challenge.challengeId}`} passHref>
                  <li>
                    <ChallengeItem title={challenge?.title} meta={challenge?.meta} deadline={challenge?.deadline} weight={challenge?.weight} />
                  </li>
                </Link>
              ))}
              <div className="flex justify-between">
                <h2 className="text-2xl">Closed Challenges</h2>
              </div>
              {challenges?.length > 0 ? (
                <ul role="list" className="flex flex-col gap-3">
                  {challenges?.filter(challenge => challenge.status === 'closed').map((challenge) => (
                    <Link key={challenge.challengeId} href={`/dao/${roomId}/challenges/${challenge.challengeId}`} passHref>
                      <li className='opacity-75'>
                        <ChallengeItem title={challenge?.title} meta={challenge?.meta} deadline={challenge?.deadline} weight={challenge?.weight} />
                      </li>
                    </Link>
                  ))}
                </ul>
              ) : (
                <>
                  {!loading && (
                    <div className="mt-6">
                      <EmptyStateNoChallenges onClick={handleShowChallengeModal}>
                        {isAdmin && (
                          <>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new challange</p>
                            <div className="mt-6">
                              <PrimaryButton onClick={handleShowChallengeModal}>
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Add Challenge
                              </PrimaryButton>
                            </div>
                          </>
                        )}
                      </EmptyStateNoChallenges>
                    </div>
                  )}
                </>
              )}
            </ul>
          ) : (
            <>
              {!loading && (
                <div className="mt-6">
                  <EmptyStateNoChallenges onClick={handleShowChallengeModal}>
                    {isAdmin && (
                      <>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new challange</p>
                        <div className="mt-6">
                          <PrimaryButton onClick={handleShowChallengeModal}>
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Add Challenge
                          </PrimaryButton>
                        </div>
                      </>
                    )}
                  </EmptyStateNoChallenges>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </LayoutWrapper >
  )
}

export default Challenges