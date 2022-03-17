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
import { useWallet } from 'use-wallet'
import useMembership from '../../../../lib/useMembership'
import { Card } from '../../../../components/Card'

const db = getFirestore()

const ChallengeModal = ({ show, onClose, challengeId, defaultValues = {} }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm()
  const requireAuthentication = useRequireAuthentication()
  const roomId = useRoomId()

  const createChallenge = async (data) => {
    const challenge = {
      title: data.title,
      description: data.description,
      weight: Number(data.weight),
      created: serverTimestamp(),
      roomId,
    }
    await addDoc(collection(db, 'challenges'), challenge)
  }

  const handleCloseModal = () => {
    onClose()
    reset()
  }

  const handleSaveChallenge = async (data) => {
    await requireAuthentication()
    await createChallenge(data)
    handleCloseModal()
  }

  return (
    <Modal show={show} onClose={handleCloseModal}>
      <form onSubmit={handleSubmit(handleSaveChallenge)}>
        <ModalTitle>{challengeId ? "Edit challenge" : "Create a challenge"}</ModalTitle>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium pb-2">
                Title
              </label>
              <input type="text" {...register("title", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
              {errors.title && (
                <span className="text-xs text-red-400">You need to set a title</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Description
              </label>
              <textarea rows="8" {...register("description", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Weight
              </label>
              <div className="relative rounded-md shadow-sm" style={{ maxWidth: '100px' }}>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 border-gray-300 rounded-md dark:bg-daonative-component-bg dark:border-transparent dark:text-daonative-gray-300"
                  placeholder="100"
                  aria-describedby="xp-amount"
                  {...register('weight', { required: true })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm" id="price-currency">
                    XPs
                  </span>
                </div>
              </div>
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



const Challenges = () => {
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
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Challenges</h2>
            {challenges?.length > 0 && isAdmin && <PrimaryButton onClick={handleShowChallengeModal}>Add a challenge</PrimaryButton>}
          </div>

          {challenges?.length > 0 ? (
            <ul role="list" className="flex flex-col gap-3">
              {challenges?.map((challenge) => (
                <Link key={challenge.challengeId} href={`/dao/${roomId}/challenges/${challenge.challengeId}`}>
                  <li>
                    <Card>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-daonative-gray-100 truncate">{challenge.title}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {challenge.weight} XP
                        </span>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                        </div>
                        <div className="mt-2 flex items-center text-sm text-daonative-gray-300 sm:mt-0">
                          <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
                          <p>
                            {challenge?.meta?.submissionCount || 0} Completions
                          </p>
                        </div>
                      </div>
                    </Card>
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
        </div>
      </div>
    </LayoutWrapper >
  )
}

export default Challenges