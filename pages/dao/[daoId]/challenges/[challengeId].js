import { CheckIcon, PlusIcon } from '@heroicons/react/solid'
import { doc, getFirestore } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { useForm } from 'react-hook-form'
import { PrimaryButton } from '../../../../components/Button'
import { LayoutWrapper } from '../../../../components/LayoutWrapper'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../../components/Modal'
import PFP from '../../../../components/PFP'

const db = getFirestore()

const ProofModal = ({ show, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()

  const handleSubmitProof = (data) => {
    console.log(data)
    onClose()
  }

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={handleSubmit(handleSubmitProof)}>
        <ModalTitle>Proof of Work</ModalTitle>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium pb-2">
                Description
              </label>
              <textarea rows="8" {...register("description", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-daonative-dark-100 dark:border-transparent dark:text-daonative-gray-300" />
              {errors.description && (
                <span className="text-xs text-red-400">You need to set a description</span>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <PrimaryButton type="submit">Submit</PrimaryButton>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const submissions = [
  { author: 'lrnt' },
  { author: 'ben' },
  { author: 'rose8' },
]

const SubmissionsList = ({ submissions }) => (
  <ul>
    {submissions.map((submission, idx) => (
      <li key={idx} className="py-2">
        <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded">
          <div className="flex items-center justify-between">
            <div className="flex w-full">
              <div>
                <PFP size={46} address="0x111" />
              </div>
              <div className="pl-4 w-full flex flex-col gap-1">
                <div className="flex justify-between w-full">
                  <p className="text-sm">{submission.author}</p>
                  <p className="text-sm text-gray-500 pr-1">1h</p>
                </div>
                <div className="flex justify-between w-full">
                  <div className="inline-flex gap-1 items-center">
                    <CheckIcon className="w-5 h-5 text-daonative-primary-blue" />
                    <p className="text-sm">0 verifications</p>
                  </div>
                  <PrimaryButton className="h-7 text-xs px-2">Verify &amp; Earn XPs</PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>

    ))}
  </ul>

)

const ChallengeDetails = () => {
  const [showProofModal, setShowProofModal] = useState(false)
  const { query: params } = useRouter()
  const [challenge] = useDocumentData(
    doc(db, 'challenges', params.challengeId || 'null')
  )

  const handleOpenProofModal = () => setShowProofModal(true)
  const handleCloseProofModal = () => setShowProofModal(false)

  return (
    <LayoutWrapper>
      <ProofModal show={showProofModal} onClose={handleCloseProofModal} />

      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-center w-full">
          <h1 className="text-2xl">{challenge?.title}</h1>
        </div>
        <div className="flex flex-col md:flex-row w-full pt-16 gap-4">
          <div className="w-full">
            <h2 className="text-xl py-4">Description</h2>
            <div className="whitespace-pre-wrap">
              {challenge?.description}
            </div>
          </div>
          <div className="w-full">
            <div className="flex justify-between py-4">
              <div>
                <h2 className="text-xl">Submissions</h2>
              </div>
              <div>
                <PrimaryButton className="rounded-full h-12 w-12 p-0" onClick={handleOpenProofModal}>
                  <PlusIcon className="w-4 h-4" />
                </PrimaryButton>
              </div>
            </div>
            <SubmissionsList submissions={submissions} />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default ChallengeDetails