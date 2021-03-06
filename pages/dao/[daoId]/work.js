import { PrimaryButton } from "@/components/Button"
import { Card, SimpleCard } from "@/components/Card"
import EmptyStateNoSubmissions from "@/components/EmptyStateNoSubmissions"
import { FileInput, TextField, Label } from "@/components/Input"
import { LayoutWrapper } from "@/components/LayoutWrapper"
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from "@/components/Modal"
import { PageHeader } from "@/components/PageHeader"
import { UserName, UserAvatar } from "@/components/PFP"
import ProofOfWorkModal, { ProofOfWorkVerificationModal } from "@/components/ProofOfWorkModal"
import Spinner from "@/components/Spinner"
import { TextArea } from "@/components/TextArea"
import { useRequireAuthentication } from "@/lib/authenticate"
import { uploadToIPFS } from "@/lib/uploadToIPFS"
import useMembership from "@/lib/useMembership"
import { useWallet } from "@/lib/useWallet"
import { BanIcon, CheckIcon, ClockIcon, PlusIcon } from "@heroicons/react/solid"
import { addDoc, collection, getFirestore, orderBy, query, serverTimestamp, where } from "firebase/firestore"
import { useRouter } from "next/router"
import { useState } from "react"
import { useCollection } from "react-firebase-hooks/firestore"
import { useForm } from "react-hook-form"
import Moment from "react-moment"

const FeedExample = ({ summary, placeholder }) => {
  const { account } = useWallet()

  return (
    <Card>
      <div className="flex justify-between">
        <div className="flex gap-4 text-xs items-center">
          <UserAvatar account={account} size={24} />
          <div>
            <span className="inline-block"><UserName account={account} /></span>
            {" "}
            worked on {summary ? summary : <span className="text-daonative-gray-400">{placeholder}</span>}
          </div>
        </div>
        <div className="text-xs text-daonative-subtitle flex items-center">
          <Moment fromNow />
        </div>
      </div>
    </Card>
  )

}

const SubmitProofOfWorkModal = ({ show, onClose, roomId }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch } = useForm()
  const requireAuthentication = useRequireAuthentication()
  const { account } = useWallet()

  const summaryPlaceholder = "onboarding 0x13.eth"
  const summary = watch("summary")

  const submitProof = async (summary, description, image) => {
    const imageUrl = image?.length === 1 ? await uploadToIPFS(image[0]) : ''
    const proof = {
      summary,
      description,
      author: account,
      roomId,
      weight: 0,
      challengeId: null,
      imageUrls: imageUrl ? [imageUrl] : [],
      created: serverTimestamp(),
    }
    const db = getFirestore()
    await addDoc(collection(db, 'workproofs'), proof)
  }

  const handleSubmitProof = async (data) => {
    await requireAuthentication()
    await submitProof(data.summary, data.description, data.image)
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
              <TextField label="Summary" name="summary" placeholder={summaryPlaceholder} required register={register} />
              {errors.summary && (
                <span className="text-xs text-red-400">You need to set a summary</span>
              )}
            </div>
            <div>
              <Label>Preview</Label>
              <FeedExample summary={summary} placeholder={summaryPlaceholder} />
            </div>
            <div>
              <TextArea label="What did you work on?" name="description" required register={register} />
              {errors.description && (
                <span className="text-xs text-red-400">You need to set a description</span>
              )}
            </div>
            <FileInput name="image" register={register} />
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

const WorkList = ({ workproofs, canVerify }) => {
  const [proofOfWorkModalOpen, setProofOfWorkModalOpen] = useState(false)
  const [proofOfWorkToShow, setProofOfWorkToShow] = useState(null)

  const handleCloseDetailsModal = () => {
    setProofOfWorkModalOpen(false)
  }
  const handleOpenDetailsModal = (submission) => {
    setProofOfWorkToShow(submission)
    setProofOfWorkModalOpen(true)
  }

  if (workproofs?.length === 0) return <EmptyStateNoSubmissions />

  return (
    <>
      {canVerify ? (
        <ProofOfWorkVerificationModal show={proofOfWorkModalOpen} onClose={handleCloseDetailsModal} workproof={proofOfWorkToShow} />
      ) : (
        <ProofOfWorkModal show={proofOfWorkModalOpen} onClose={handleCloseDetailsModal} workproof={proofOfWorkToShow} />
      )}
      <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {workproofs?.map((workproof, idx) => {
          const verifications = workproof?.verifications ? Object.values(workproof.verifications) : []
          const isPending = verifications.length === 0
          const isReverted = !isPending && verifications.filter(verification => !verification.accepted).length > 0
          const isVerified = !isPending && !isReverted
          return (
            <li key={idx} >
              <SimpleCard className="hover:cursor-pointer opacity-[75%] hover:opacity-100" onClick={() => handleOpenDetailsModal(workproof)}>
                <div className=' py-2 px-3'>
                  <div className="grid grid-cols-2 overflow-hidden">
                    <UserAvatar account={workproof.author} />
                    <div className="flex flex-col gap-1 items-end ">
                      <p className="text-sm  max-w-[100%] truncate text-ellipsis">
                        <UserName account={workproof.author} />
                      </p>
                      <p className="text-sm text-gray-500 ">
                        <Moment date={workproof?.created?.toMillis()} fromNow={true} />
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

const WorkPage = () => {
  const { account } = useWallet()
  const [showProofModal, setShowProofModal] = useState(false)
  const { query: params } = useRouter()
  const roomId = params.daoId || ''

  const handleOpenProofModal = () => setShowProofModal(true)
  const handleCloseProofModal = () => setShowProofModal(false)

  const membership = useMembership(account, roomId)
  const canVerify = membership?.roles?.includes('admin') || membership?.roles?.includes('verifier')

  const db = getFirestore()
  const [workproofsSnapshot] = useCollection(
    query(collection(db, 'workproofs'), where('roomId', '==', roomId), where('challengeId', '==', null), orderBy('created', 'desc'))
  )
  const workproofs = workproofsSnapshot?.docs.map(doc => ({ ...doc.data(), workproofId: doc.id })) || []

  return (
    <LayoutWrapper>
      <SubmitProofOfWorkModal show={showProofModal} onClose={handleCloseProofModal} roomId={roomId} />
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <PageHeader>
          <div className="flex justify-between py-4 items-end">
            <div >
              <h2 className="text-xl font-space font-semibold text-white">Proof of Work</h2>
              <h2 className="text-sm text-slate-200 text-justify max-w-2xl">Submit work you do for this community outside of challenges. This work {`doesn't`} directly yield any XPs but makes it easy to keep track of your efforts and can be used for retro-active rewards. </h2>
            </div>
            <div className="flex gap-4 items-center">
              <button className="bg-daonative-primary-blue flex justify-center items-center rounded-full h-8 w-8 p-0" onClick={handleOpenProofModal}>
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </PageHeader>
        <div className="mt-6">
          <WorkList workproofs={workproofs} canVerify={canVerify} />
        </div>
      </div>
    </LayoutWrapper >
  )
}

export default WorkPage