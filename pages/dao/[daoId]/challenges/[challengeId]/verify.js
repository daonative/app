import { CheckIcon } from "@heroicons/react/solid"
import { arrayUnion, collection, doc, getFirestore, orderBy, query, updateDoc, where } from "firebase/firestore"
import { reset } from "linkifyjs"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore"
import { useForm } from "react-hook-form"
import Moment from "react-moment"
import { useWallet } from "use-wallet"
import { PrimaryButton, SecondaryButton } from "../../../../../components/Button"
import { Card } from "../../../../../components/Card"
import { LayoutWrapper } from "../../../../../components/LayoutWrapper"
import { UserAvatar, UserName } from "../../../../../components/PFP"
import { useRequireAuthentication } from "../../../../../lib/authenticate"
import useMembership from "../../../../../lib/useMembership"

const VerifyWork = ({ workproof, onVerified }) => {
  const db = getFirestore()
  const [isLoading, setIsLoading] = useState(false)
  const requireAuthentication = useRequireAuthentication()
  const { account } = useWallet()
  const { handleSubmit, register, reset } = useForm()

  useEffect(() => reset(), [workproof, reset])

  const saveVerification = async (workproofId, verifier, accepted, reason) => {
    const workproofDoc = doc(db, 'workproofs', workproofId)
    await updateDoc(workproofDoc, {
      verifiers: arrayUnion(verifier),
      [`verifications.${verifier}.accepted`]: accepted,
      [`verifications.${verifier}.reason`]: reason,
    })
  }

  const handleAcceptWork = async (data) => {
    setIsLoading(true)
    await requireAuthentication()
    await saveVerification(workproof.workproofId, account, true, data.reason)
    onVerified()
    setIsLoading(false)
  }

  const handleRejectWork = async (data) => {
    setIsLoading(true)
    await requireAuthentication()
    await saveVerification(workproof.workproofId, account, false, data.reason)
    onVerified()
    setIsLoading(false)
  }

  return (
    <form>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div>
            <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
              Author
            </p>
            <div className="whitespace-pre-wrap text-sm font-medium text-daonative-white">
              <UserName account={workproof?.author} />
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
              Submission Date
            </p>
            <div className="whitespace-pre-wrap text-sm font-medium text-daonative-white">
              {workproof.created?.toDate().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
              Description
            </p>
            <div className="whitespace-pre-wrap text-sm font-medium text-daonative-white">
              {workproof?.description}
            </div>
          </div>
        </div>
        {workproof?.imageUrls?.length > 0 && (
          <div>
            <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
              Image
            </p>
            <div className="whitespace-pre-wrap text-sm font-medium">
              <a href={workproof.imageUrls[0]} target="_blank" rel="noreferrer">
                <img alt="Proof image" src={workproof.imageUrls[0]} width={64} />
              </a>
            </div>
          </div>
        )}
        <div>
          <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
            Reason
          </p>
          <textarea rows="6" {...register("reason", { required: false })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" />
        </div>
        <div className="flex gap-4 justify-end">
          <SecondaryButton onClick={handleSubmit(handleRejectWork)}>Reject</SecondaryButton>
          <PrimaryButton onClick={handleSubmit(handleAcceptWork)}>Verify</PrimaryButton>
        </div>
      </div>
    </form>
  )
}

const SubmissionsList = ({ submissions, currentSubmissionIdx, onCurrentSubmissionChanged }) => {
  return (
    <ul>
      {submissions?.map((submission, idx) => {
        return (
          <li key={idx} className="py-2">
            <Card>
              <div className="flex items-center justify-between" onClick={() => onCurrentSubmissionChanged(idx)}>
                <div className="flex w-full">
                  <div>
                    <UserAvatar account={submission.author} />
                  </div>
                  <div className="pl-4 w-full flex flex-col gap-1">
                    <div className="flex justify-between w-full">
                      <p className="text-sm">
                        <UserName account={submission.author} />
                      </p>
                    </div>
                    <div className="flex justify-between w-full">
                      <p className="text-sm text-gray-500 pr-1">
                        <Moment date={submission?.created?.toMillis()} fromNow={true} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

const ChallengeDetails = () => {
  const db = getFirestore()
  const { account } = useWallet()
  const { query: params } = useRouter()
  const [currentSubmission, setCurrentSubmission] = useState(0)
  const challengeId = params.challengeId || ''
  const [challenge] = useDocumentData(
    doc(db, 'challenges', challengeId || 'null')
  )
  const [submissionsSnapshot] = useCollection(
    query(collection(db, 'workproofs'), where('challengeId', '==', challengeId), orderBy('created', 'desc'))
  )
  const submissions = submissionsSnapshot?.docs
    .map(doc => ({ ...doc.data(), workproofId: doc.id }))
    .filter(submission => !submission?.verifiers?.includes(account))

  const { query: { daoId: roomId } } = useRouter()
  const membership = useMembership(account, roomId)
  const isAdmin = membership?.roles?.includes('admin')

  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex p-4">
          <div className="flex justify-center w-full">
            <h1 className="text-2xl">{challenge?.title}</h1>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="w-1/2">
            <SubmissionsList submissions={submissions} onCurrentSubmissionChanged={setCurrentSubmission} />
          </div>
          <div className="w-1/2">
            {currentSubmission < submissions?.length && <VerifyWork workproof={submissions[currentSubmission]} onVerified={() => { }} />}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default ChallengeDetails