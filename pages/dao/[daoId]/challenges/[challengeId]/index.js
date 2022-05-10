import { CheckIcon, ClockIcon, PlusIcon, BanIcon } from '@heroicons/react/solid'
import { addDoc, collection, doc, getFirestore, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore'
import { useForm } from 'react-hook-form'
import Moment from 'react-moment'
import { useWallet } from '@/lib/useWallet'
import { PrimaryButton, SecondaryButton } from '../../../../../components/Button'
import EmptyStateNoSubmissions from '../../../../../components/EmptyStateNoSubmissions'
import { LayoutWrapper } from '../../../../../components/LayoutWrapper'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../../../components/Modal'
import { UserName, UserRectangleAvatar } from '../../../../../components/PFP'
import Spinner from '../../../../../components/Spinner'
import { useRequireAuthentication } from '../../../../../lib/authenticate'
import { uploadToIPFS } from '../../../../../lib/uploadToIPFS'
import useMembership from '../../../../../lib/useMembership'
import Link from 'next/link'
import { classNames, formatDate } from '../../../../../lib/utils'
import { SimpleCard } from '../../../../../components/Card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'
import { Label } from '@/components/Input'
import { TextArea } from '@/components/TextArea'

const ProofOfWorkModal = ({ show, onClose, workproof }) => {
  const verifications = workproof?.verifications ? Object.values(workproof.verifications) : []
  const isPending = verifications.length === 0
  const isReverted = !isPending && verifications.filter(verification => !verification.accepted).length > 0
  const isVerified = !isPending && !isReverted
  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Proof of Work</ModalTitle>
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
          <div>
            <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
              Status
            </p>
            {isVerified && (
              <div className="inline-flex gap-1 items-center">
                <CheckIcon className="w-5 h-5 text-daonative-primary-blue" />
                <p className="text-sm">Verified</p>
              </div>
            )}
            {isPending && (
              <div className="inline-flex gap-1 items-center text-daonative-white">
                <ClockIcon className="w-5 h-5" />
                <p className="text-sm">Pending</p>
              </div>
            )}
            {isReverted && (
              <div className="inline-flex gap-1 items-center text-daonative-white">
                <BanIcon className="w-5 h-5" />
                <p className="text-sm">Reverted</p>
              </div>
            )}
          </div>
          {verifications.filter(verification => !!verification.reason).length > 0 && (
            <div>
              <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
                Reason
              </p>
              {verifications.map((verification, idx) => (
                <div key={idx} className="whitespace-pre-wrap text-sm font-medium">
                  {verification.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBody>
      <ModalActionFooter>
        <div className="w-full flex justify-end">
          <SecondaryButton onClick={onClose}>
            Close
          </SecondaryButton>
        </div>
      </ModalActionFooter>
    </Modal>
  )
}

const SubmitProofOfWorkModal = ({ show, onClose, challenge }) => {
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
              <TextArea label="Description" name="description" required register={register} />
              {errors.description && (
                <span className="text-xs text-red-400">You need to set a description</span>
              )}
            </div>
            <input {...register("image", { required: false })} type="file" className="rounded-md file:rounded-md text-sm focus:ring-3 ring-pink-200 focus:border-0 max-w-min file:ring-0" />
          </div>
        </ModalBody>
        <ModalActionFooter>
          <PrimaryButton type="submit">
            {isSubmitting ? (
              <span className="w-4 h-4 mx-auto"><Spinner /></span>
            ) : (
              <>Submit Proof of Work</>
            )}
          </PrimaryButton>
        </ModalActionFooter>
      </form>
    </Modal >
  )
}

const SubmissionsList = ({ submissions, isAdmin }) => {
  const { account } = useWallet()
  const [proofOfWorkModalOpen, setProofOfWorkModalOpen] = useState(false)
  const [proofOfWorkToShow, setProofOfWorkToShow] = useState(null)

  if (submissions?.length === 0) return <EmptyStateNoSubmissions />

  const handleCloseEditModal = () => {
    setProofOfWorkModalOpen(false)
    setProofOfWorkToShow(null)
  }
  const handleOpenEditModal = (submission) => {
    setProofOfWorkToShow(submission)
    setProofOfWorkModalOpen(true)
  }

  return (
    <>
      <ProofOfWorkModal show={proofOfWorkModalOpen} onClose={handleCloseEditModal} workproof={proofOfWorkToShow} />
      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {submissions?.map((submission, idx) => {
          const verifications = submission?.verifications ? Object.values(submission.verifications) : []
          const isPending = verifications.length === 0
          const isReverted = !isPending && verifications.filter(verification => !verification.accepted).length > 0
          const isVerified = !isPending && !isReverted
          return (
            <li key={idx} >
              <SimpleCard
                onClick={() => handleOpenEditModal(submission)}
                className={classNames(
                  "hover:cursor-pointer",
                  "hover:cursor-pointer opacity-[75%] hover:opacity-100")}
              >
                <div className=' py-2 px-3'>
                  <div className="grid grid-cols-2 overflow-hidden">
                    <UserRectangleAvatar account={submission.author} />
                    <div className="flex flex-col gap-1 items-end ">
                      <p className="text-sm  max-w-[100%] truncate text-ellipsis">
                        <UserName account={submission.author} />
                      </p>
                      <p className="text-sm text-gray-500 ">
                        <Moment date={submission?.created?.toMillis()} fromNow={true} />
                      </p>
                      <div className="flex justify-between">
                        {isVerified && (
                          <div className="inline-flex gap-1 items-center">
                            <CheckIcon className="w-5 h-5 text-daonative-primary-blue" />
                            <p className="text-sm">Verified</p>
                          </div>
                        )}
                        {isPending && (
                          <div className="inline-flex gap-1 items-center text-daonative-white">
                            <ClockIcon className="w-5 h-5" />
                            <p className="text-sm">Pending</p>
                          </div>
                        )}
                        {isReverted && (
                          <div className="inline-flex gap-1 items-center text-daonative-white">
                            <BanIcon className="w-5 h-5" />
                            <p className="text-sm">Reverted</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SimpleCard>
            </li>
          )
        })}
      </ul>
    </>
  )
}

const EditChallengeModal = ({ show, onClose, challenge = {} }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm()
  const requireAuthentication = useRequireAuthentication()

  useEffect(() => {
    reset({
      title: challenge.title,
      description: challenge.description,
      imageRequired: challenge?.rules?.imageRequired || false,
      deadline: challenge?.deadline ? formatDate(challenge?.deadline?.toDate()) : null
    })
  }, [reset, challenge])

  const updateChallenge = async (title, description, imageRequired, deadline, challengeId) => {
    const db = getFirestore()
    const challenge = {
      title: title,
      description: description,
      'rules.imageRequired': imageRequired,
      updated: serverTimestamp(),
      deadline
    }
    await updateDoc(doc(db, "challenges", challengeId), challenge)
  }

  const handleCloseModal = () => {
    onClose()
  }

  const handleSaveChallenge = async (data) => {
    const deadline = data?.deadline ? new Date(data.deadline) : null
    const imageRequired = data?.imageRequired || false
    await requireAuthentication()
    await updateChallenge(data.title, data.description, imageRequired, deadline, challenge.challengeId)
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
          <div>
            <label className="block text-sm font-medium py-2">
              Submission deadline (optional)
            </label>
            <input type="datetime-local" {...register("deadline", { required: false })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent " />
          </div>
          <div>
            <input type="checkbox" {...register("imageRequired")} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 inline-block sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent" id="imageRequired" />
            <label className="inline-block text-sm font-medium py-2 pl-2" htmlFor="imageRequired">
              Require each submission to upload an image
            </label>
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
  const db = getFirestore()
  const { query: params } = useRouter()
  const challengeId = params.challengeId || ''
  const roomId = params.daoId || ''
  const [challenge] = useDocumentData(
    doc(db, 'challenges', challengeId || 'null')
  )
  const [submissionsSnapshot] = useCollection(
    query(collection(db, 'workproofs'), where('challengeId', '==', challengeId), orderBy('created', 'desc'))
  )
  const submissions = submissionsSnapshot?.docs.map(doc => ({ ...doc.data(), workproofId: doc.id }))

  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const requireAuthentication = useRequireAuthentication()
  const isMember = !!membership
  const isAdmin = membership?.roles?.includes('admin')
  const isEnabled = challenge?.status !== "closed"

  const canVerify = membership?.roles?.includes('admin') || membership?.roles?.includes('verifier')
  const hasWorkToVerify = submissions && submissions?.length > 0

  const handleOpenProofModal = () => setShowProofModal(true)
  const handleCloseProofModal = () => setShowProofModal(false)


  const handleOpenEditChallengeModal = () => setShowEditChallengeModal(true)
  const handleCloseEditChallengeModal = () => setShowEditChallengeModal(false)

  const updateChallenge = async (status) => {
    const db = getFirestore()
    const challenge = {
      status
    }
    await updateDoc(doc(db, "challenges", challengeId), challenge)
  }

  const handleDeactivate = async () => {
    try {
      await requireAuthentication()
      await updateChallenge('closed')
      toast.success('Challenge is now deactivated')
    } catch (e) {
      toast.error(`Something went wrong ${e.message}`,)
    }
  }

  const handleActivate = async () => {
    try {
      await requireAuthentication()
      await updateChallenge('open')
      toast.success('Challenge is now active')
    } catch (e) {
      toast.error(`Something went wrong ${e.message}`,)
    }
  }

  return (
    <LayoutWrapper>
      <EditChallengeModal show={showEditChallengeModal} onClose={handleCloseEditChallengeModal} challenge={{ ...challenge, challengeId }} />
      <SubmitProofOfWorkModal show={showProofModal} onClose={handleCloseProofModal} challenge={{ ...challenge, challengeId }} />
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex">
          <div className="flex justify-center w-full max-w-2xl mx-auto">
            <h1 className="text-2xl">{challenge?.title}</h1>
          </div>
          <div className='flex gap-3'>
            {isAdmin && <SecondaryButton onClick={handleOpenEditChallengeModal}>Edit</SecondaryButton>}
            {isAdmin && isEnabled && <SecondaryButton onClick={handleDeactivate}>Close</SecondaryButton>}
            {isAdmin && !isEnabled && <SecondaryButton onClick={handleActivate}>Activate</SecondaryButton>}
          </div>
        </div>
        <div className="flex flex-col w-full pt-16 gap-4 max-w-2xl mx-auto">
          <div className="w-full">
            <div className="prose prose-sm prose-daonative-text prose-invert text-daonative-text">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {challenge?.description}
              </ReactMarkdown>
            </div>
          </div>
          <div className="w-full">
            <div className="flex justify-between py-4">
              <div>
                <h2 className="text-xl text-daonative-white">Submissions</h2>
              </div>
              <div className="flex gap-4 items-center">
                {isAdmin &&
                  <a href={`/api/csv/proof-of-works?challengeId=${challengeId}`} download>
                    <PrimaryButton>Export to CSV</PrimaryButton>
                  </a>
                }
                {canVerify && hasWorkToVerify && (
                  <Link href={`/dao/${roomId}/challenges/${challengeId}/verify`} passHref>
                    <a>
                      <PrimaryButton>Verify work</PrimaryButton>
                    </a>
                  </Link>
                )}
                {isMember && isEnabled && (
                  <button className="bg-daonative-primary-blue flex justify-center items-center rounded-full h-8 w-8 p-0" onClick={handleOpenProofModal}>
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <SubmissionsList submissions={submissions} isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default ChallengeDetails