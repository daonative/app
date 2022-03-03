import { useForm } from 'react-hook-form'
import { addDoc, collection, getFirestore, query, serverTimestamp, where } from 'firebase/firestore'

import { LayoutWrapper } from '../../../../components/LayoutWrapper'
import { PrimaryButton } from '../../../../components/Button'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../../components/Modal'
import Spinner from '../../../../components/Spinner'

import useRoomId from '../../../../lib/useRoomId'
import { useState } from 'react'
import { useRequireAuthentication } from '../../../../lib/authenticate'
import { useCollection } from 'react-firebase-hooks/firestore'
import { CheckIcon } from '@heroicons/react/solid'

const db = getFirestore()

const ChallengeModal = ({ show, onClose, challengeId, defaultValues = {} }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm()
  const requireAuthentication = useRequireAuthentication()
  const roomId = useRoomId()

  const createChallenge = async (data) => {
    const challenge = {
      title: data.title,
      description: data.description,
      weight: data.weight,
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
              <input type="text" {...register("title", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" />
              {errors.description && (
                <span className="text-xs text-red-400">You need to set a description</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Description (optional)
              </label>
              <textarea rows="8" {...register("description", { required: false })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Weight (rewards for task completion)
              </label>
              <input type="number" {...register("weight")} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" />
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

const Challenges = ({ }) => {
  const roomId = useRoomId()
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [challengesSnapshot] = useCollection(
    query(collection(db, 'challenges'), where('roomId', '==', roomId || '')))
  const challenges = challengesSnapshot?.docs.map(doc => ({ challengeId: doc.id, ...doc.data() }))

  const handleShowChallengeModal = () => setShowChallengeModal(true)
  const handleCloseChallengeModal = () => setShowChallengeModal(false)

  return (
    <LayoutWrapper>
      <ChallengeModal show={showChallengeModal} onClose={handleCloseChallengeModal} />
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Active challenges</h2>
            <PrimaryButton onClick={handleShowChallengeModal}>Add a challenge</PrimaryButton>
          </div>

          <ul role="list" className="flex flex-col gap-3">
            {challenges?.map((challenge) => (
              <li key={challenge.challengeId}>
                <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded">
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
                        20 Completions
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default Challenges