import { CheckIcon, ClockIcon, BanIcon } from "@heroicons/react/solid"
import { PrimaryButton, SecondaryButton } from "./Button"
import { Modal, ModalTitle, ModalBody, ModalActionFooter } from "@/components/Modal"
import { TextArea } from "./TextArea"
import { useForm } from "react-hook-form"
import { useWallet } from "@/lib/useWallet"
import { useRequireAuthentication } from "@/lib/authenticate"
import { arrayUnion, doc, getFirestore, serverTimestamp, updateDoc } from "firebase/firestore"

const ProofOfWorkDetails = ({ workproof }) => {
  const verifications = workproof?.verifications ? Object.values(workproof.verifications) : []
  const isPending = verifications.length === 0
  const isReverted = !isPending && verifications.filter(verification => !verification.accepted).length > 0
  const isVerified = !isPending && !isReverted

  return (
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
            <a href={workproof.imageUrls[0]} target="_blank" rel="noreferrer">
              <img src={workproof.imageUrls[0]} width={256} />
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

  )

}

export const ProofOfWorkVerificationModal = ({ show, onClose, workproof }) => {
  const requireAuthentication = useRequireAuthentication()
  const { register, handleSubmit } = useForm()
  const { account } = useWallet()

  const isAllowedToVerify = workproof?.author !== account
  const hasBeenVerified = workproof?.verifiers?.length > 0
  const canVerify = isAllowedToVerify && !hasBeenVerified

  const saveVerification = async (workproofId, verifier, accepted, reason) => {
    const db = getFirestore()
    const workproofDoc = doc(db, 'workproofs', workproofId)
    await updateDoc(workproofDoc, {
      verifiers: arrayUnion(verifier),
      [`verifications.${verifier}.accepted`]: accepted,
      [`verifications.${verifier}.reason`]: reason,
      [`verifications.${verifier}.timestamp`]: serverTimestamp(),
    })
  }

  const handleAcceptWork = async (data) => {
    await requireAuthentication()
    await saveVerification(workproof.workproofId, account, true, data.reason)
    onClose()
  }

  const handleRejectWork = async (data) => {
    await requireAuthentication()
    await saveVerification(workproof.workproofId, account, false, data.reason)
    onClose()
  }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Proof of Work</ModalTitle>
      <form>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <ProofOfWorkDetails workproof={workproof} />
            {canVerify && <TextArea label="Reason (optional)" name="reason" register={register} />}
            {!isAllowedToVerify && !hasBeenVerified && <span className="text-sm text-daonative-subtitle">You {"can't"} verify this work because you are the author</span>}
          </div>
        </ModalBody>
        <ModalActionFooter>
          <div className="w-full flex justify-between">
            <SecondaryButton onClick={onClose}>
              Close
            </SecondaryButton>
            {canVerify && (
              <div className="flex justify-end gap-2">
                <SecondaryButton onClick={handleSubmit(handleRejectWork)}>Reject</SecondaryButton>
                <PrimaryButton onClick={handleSubmit(handleAcceptWork)}>Verify</PrimaryButton>
              </div>
            )}
          </div>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const ProofOfWorkModal = ({ show, onClose, workproof }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Proof of Work</ModalTitle>
      <ModalBody>
        <ProofOfWorkDetails workproof={workproof} />
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

export default ProofOfWorkModal