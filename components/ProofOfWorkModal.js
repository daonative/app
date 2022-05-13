import { CheckIcon, ClockIcon, BanIcon } from "@heroicons/react/solid"
import { SecondaryButton } from "./Button"
import { Modal, ModalTitle, ModalBody, ModalActionFooter } from "@/components/Modal"

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