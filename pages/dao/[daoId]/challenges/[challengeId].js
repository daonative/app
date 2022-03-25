import { CheckIcon, PlusIcon } from '@heroicons/react/solid'
import { addDoc, arrayUnion, collection, doc, getFirestore, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore'
import { useForm } from 'react-hook-form'
import Moment from 'react-moment'
import { useWallet } from 'use-wallet'
import { PrimaryButton, SecondaryButton } from '../../../../components/Button'
import EmptyStateNoSubmissions from '../../../../components/EmptyStateNoSubmissions'
import { LayoutWrapper } from '../../../../components/LayoutWrapper'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../../components/Modal'
import PFP, { UserAvatar, UserName } from '../../../../components/PFP'
import Spinner from '../../../../components/Spinner'
import { useRequireAuthentication } from '../../../../lib/authenticate'
import { uploadToIPFS } from '../../../../lib/uploadToIPFS'
import useMembership from '../../../../lib/useMembership'


const VerifyModal = ({ show, onClose, workproof }) => {
  const db = getFirestore()
  const [isLoading, setIsLoading] = useState(false)
  const requireAuthentication = useRequireAuthentication()
  const { account } = useWallet()

  const handleVerifyWork = async () => {
    setIsLoading(true)
    await requireAuthentication()
    const workproofDoc = doc(db, 'workproofs', workproof.woorkproofId)
    await updateDoc(workproofDoc, {
      verifiers: arrayUnion(account)
    })
    onClose()
    setIsLoading(false)
  }

  const handleReportWork = () => { }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Verify Submission</ModalTitle>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <div>
            <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
              Description
            </p>
            <div className="whitespace-pre-wrap text-sm font-medium text-daonative-white">
              {workproof?.description}
            </div>
          </div>
          {workproof?.imageUrls?.length > 0 && (
            <div>
              <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
                Image
              </p>
              <div className="whitespace-pre-wrap text-sm font-medium">
                <a href={workproof.imageUrls[0]}>
                  <img src={workproof.imageUrls[0]} width={64} />
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="pt-8 text-sm">
          💡 You can also earn XPs by reporting false submissions
        </div>
      </ModalBody>
      <ModalActionFooter>
        <div className="w-full flex justify-between">
          <SecondaryButton className="invisible">
            Report
          </SecondaryButton>
          <PrimaryButton onClick={handleVerifyWork}>
            {isLoading ? <span className="w-4 h-4 mx-auto"><Spinner /></span> : "Verify"}
          </PrimaryButton>
        </div>
      </ModalActionFooter>
    </Modal>
  )
}

const ProofModal = ({ show, onClose, challenge }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const requireAuthentication = useRequireAuthentication()
  const { account } = useWallet()

  const submitProof = async (description, image) => {
    const imageUrl = image?.length === 1 ? await uploadToIPFS(image[0]) : ''
    const proof = {
      description,
      author: account,
      roomId: challenge.roomId,
      challengeId: challenge.challengeId,
      weight: Number(challenge.weight),
      imageUrls: imageUrl ? [imageUrl] : [],
      created: serverTimestamp(),
    }
    const db = getFirestore()
    await addDoc(collection(db, 'workproofs'), proof)
  }

  const handleSubmitProof = async (data) => {
    await requireAuthentication()
    await submitProof(data.description, data.image)
    onClose()
    reset()
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
              <textarea rows="8" {...register("description", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
              {errors.description && (
                <span className="text-xs text-red-400">You need to set a description</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium pb-2">
                Image (optional)
              </label>
              <input {...register("image", { required: false })} type="file" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-100 rounded-md bg-daonative-component-bg border-transparent" />
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <PrimaryButton type="submit">
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

const SubmissionsList = ({ submissions, onVerifyClick, showVerifyButton }) => {
  const { account } = useWallet()

  if (submissions?.length === 0) return <EmptyStateNoSubmissions />

  return (
    <ul>
      {submissions?.map((submission, idx) => {
        const canVerify = showVerifyButton && !submission?.verifiers?.includes(account) && submission?.author !== account
        return (
          <li key={idx} className="py-2">
            <div className="px-4 py-4 sm:px-6 bg-daonative-component-bg rounded">
              <div className="flex items-center justify-between">
                <div className="flex w-full">
                  <div>
                    <UserAvatar account={submission.author} />
                  </div>
                  <div className="pl-4 w-full flex flex-col gap-1">
                    <div className="flex justify-between w-full">
                      <p className="text-sm">
                        <UserName account={submission.author} />
                      </p>
                      <p className="text-sm text-gray-500 pr-1">
                        <Moment date={submission?.created?.toMillis()} fromNow={true} />
                      </p>
                    </div>
                    <div className="flex justify-between w-full">
                      <div className="inline-flex gap-1 items-center">
                        <CheckIcon className="w-5 h-5 text-daonative-primary-blue" />
                        <p className="text-sm">{submission?.verifiers?.length || 0} verifications</p>
                      </div>
                      {canVerify && (
                        <PrimaryButton
                          className="text-xs px-2 w-max"
                          onClick={() => onVerifyClick(submission)}
                        >
                          Verify &amp; Earn XPs
                        </PrimaryButton>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

const EditChallengeModal = ({ show, onClose, challenge = {} }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm()
  const requireAuthentication = useRequireAuthentication()

  useEffect(() => reset(challenge), [reset, challenge])

  const updateChallenge = async (title, description, challengeId) => {
    const db = getFirestore()
    const challenge = {
      title: title,
      description: description,
      updated: serverTimestamp()
    }
    await updateDoc(doc(db, "challenges", challengeId), challenge)
  }

  const handleCloseModal = () => {
    onClose()
  }

  const handleSaveChallenge = async (data) => {
    await requireAuthentication()
    await updateChallenge(data.title, data.description, challenge.challengeId)
    handleCloseModal()
  }

  return (
    <Modal show={show} onClose={handleCloseModal}>
      <form onSubmit={handleSubmit(handleSaveChallenge)}>
        <ModalTitle>Edit challenge</ModalTitle>
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
              <>Edit Challenge</>
            )}
          </PrimaryButton>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const ChallengeDetails = () => {
  const [showProofModal, setShowProofModal] = useState(false)
  const [showEditChallengeModal, setShowEditChallengeModal] = useState(false)
  const [proofToVerify, setProofToVerify] = useState(null)
  const db = getFirestore()
  const { query: params } = useRouter()
  const challengeId = params.challengeId || ''
  const [challenge] = useDocumentData(
    doc(db, 'challenges', challengeId || 'null')
  )
  const [submissionsSnapshot] = useCollection(
    query(collection(db, 'workproofs'), where('challengeId', '==', challengeId), orderBy('created', 'desc'))
  )
  const submissions = submissionsSnapshot?.docs.map(doc => ({ ...doc.data(), woorkproofId: doc.id }))

  const { account } = useWallet()
  const { query: { daoId: roomId } } = useRouter()
  const membership = useMembership(account, roomId)
  const isMember = !!membership
  const isAdmin = membership?.roles?.includes('admin')

  const handleOpenProofModal = () => setShowProofModal(true)
  const handleCloseProofModal = () => setShowProofModal(false)

  const handleVerifyProof = (workproof) => setProofToVerify(workproof)
  const handleCloseVerifyProof = () => setProofToVerify(null)

  const handleOpenEditChallengeModal = () => setShowEditChallengeModal(true)
  const handleCloseEditChallengeModal = () => setShowEditChallengeModal(false)

  return (
    <LayoutWrapper>
      <EditChallengeModal show={showEditChallengeModal} onClose={handleCloseEditChallengeModal} challenge={{ ...challenge, challengeId }} />
      <ProofModal show={showProofModal} onClose={handleCloseProofModal} challenge={{ ...challenge, challengeId }} />
      <VerifyModal show={!!proofToVerify} onClose={handleCloseVerifyProof} workproof={proofToVerify} />
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex">
          <div className="flex justify-center w-full">
            <h1 className="text-2xl">{challenge?.title}</h1>
          </div>
          {isAdmin && <SecondaryButton onClick={handleOpenEditChallengeModal}>Edit</SecondaryButton>}
        </div>
        <div className="flex flex-col md:flex-row w-full pt-16 gap-4">
          <div className="w-full">
            <h2 className="text-xl py-4">Description</h2>
            <div className="whitespace-pre-wrap text-daonative-white">
              {challenge?.description}
            </div>
          </div>
          <div className="w-full">
            <div className="flex justify-between py-4">
              <div>
                <h2 className="text-xl">Submissions</h2>
              </div>
              <div>
                {isMember && (
                  <button className="bg-daonative-primary-blue flex justify-center items-center rounded-full h-8 w-8 p-0" onClick={handleOpenProofModal}>
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <SubmissionsList submissions={submissions} onVerifyClick={(workproof) => handleVerifyProof(workproof)} showVerifyButton={isAdmin} />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default ChallengeDetails