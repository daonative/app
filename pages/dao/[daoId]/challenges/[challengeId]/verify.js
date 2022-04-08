import { BanIcon, CheckIcon, ClockIcon } from "@heroicons/react/solid"
import { arrayUnion, collection, doc, getFirestore, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore"
import { reset } from "linkifyjs"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
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
import { classNames } from "../../../../../lib/utils"

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
      [`verifications.${verifier}.timestamp`]: serverTimestamp(),
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
        <InspectWork workproof={workproof} />
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


const InspectWork = ({ workproof }) => {
  const verifications = workproof?.verifications ? Object.entries(workproof.verifications).map((verification) => ({ ...verification[1], verifier: verification[0] })) : []
  const isPending = verifications.length === 0
  const isReverted = !isPending && verifications.filter(verification => !verification.accepted).length > 0
  const isVerified = !isPending && !isReverted
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
          Author
        </p>
        <div className="text-sm font-medium text-daonative-white">
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
      {verifications.map((verification, idx) => (
        <>
          <div key={idx}>
            <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
              Verified by
            </p>
            <div className="text-sm font-medium text-daonative-white">
              <UserName account={verification.verifier} />
            </div>
          </div>
          {verification.reason && (
            <div>
              <p className="block text-sm font-medium pb-2 text-daonative-subtitle">
                Reason
              </p>
              <div className="whitespace-pre-wrap text-sm font-medium">
                {verification.reason}
              </div>
            </div>
          )}
        </>
      ))}
    </div>
  )
}

const SubmissionsList = ({ submissions, currentSubmissionId, onCurrentSubmissionChanged }) => {
  return (
    <>
      <ul>
        {submissions?.map((submission, idx) => {
          const verifications = submission?.verifications ? Object.entries(submission.verifications).map((verification) => ({ ...verification[1], verifier: verification[0] })) : []
          const isPending = verifications.length === 0
          const isReverted = !isPending && verifications.filter(verification => !verification.accepted).length > 0
          const isVerified = !isPending && !isReverted
          const isCurrent = submission.workproofId === currentSubmissionId
          return (
            <li
              key={idx}
              className="py-2"
              style={isCurrent ? { transform: 'scale(1.03)', transition: '0.2s ease-in' } : { transition: '0.2s ease-in' }}
            >
              <Card
                onClick={() => onCurrentSubmissionChanged(submission.workproofId)}
                className={isCurrent && "outline outline-daonative-primary-blue"}
              >
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
                        <div>
                          {isVerified && (
                            <div className="inline-flex gap-1 items-center">
                              <CheckIcon className="w-5 h-5" />
                            </div>
                          )}
                          {isReverted && (
                            <div className="inline-flex gap-1 items-center text-daonative-white">
                              <BanIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
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
    </>
  )
}

const NothingToVerify = ({ challengeURL }) => (
  <div className="w-full p-14 text-center flex flex-col items-center gap-4">
    <h3 className="mt-2 text-lg font-medium text-daonative-gray-100">{"No proof of works to review."}</h3>
    <Link href={challengeURL}>
      <a>
        <PrimaryButton>Go back to the challenge</PrimaryButton>
      </a>
    </Link>
  </div>
)

const ChallengeDetails = () => {
  const db = getFirestore()
  const { account } = useWallet()
  const { query: { challengeId, daoId: roomId } } = useRouter()
  const [currentWorkproofId, setCurrentWorkproofId] = useState(null)
  const [challenge, loading] = useDocumentData(
    doc(db, 'challenges', challengeId || 'null')
  )
  const [submissionsSnapshot] = useCollection(
    query(collection(db, 'workproofs'), where('challengeId', '==', challengeId || 'x'), orderBy('created', 'desc'))
  )
  const allSubmissions = useMemo(() => submissionsSnapshot?.docs.map(doc => ({ ...doc.data(), workproofId: doc.id })) || [], [submissionsSnapshot])
  const reviewableSubmissions = useMemo(() =>
    allSubmissions.filter(submission => !(submission?.verifiers?.length > 0) && submission.author !== account)
    , [allSubmissions, account])
  const unreviewableSubmissions = useMemo(() =>
    allSubmissions.filter(submission => !(submission?.verifiers?.length > 0) && submission.author === account)
    , [allSubmissions, account])
  const reviewedSubmissions = useMemo(() =>
    allSubmissions.filter(submission => submission?.verifiers?.length > 0)
    , [allSubmissions])

  const membership = useMembership(account, roomId)
  const isAdmin = membership?.roles?.includes('admin')

  const currentWorkproof = allSubmissions.find(submission => submission.workproofId === currentWorkproofId)
  const canVerifyCurrentWorkproof = reviewableSubmissions.filter(submission => submission.workproofId === currentWorkproofId).length > 0

  useEffect(() => {
    if (allSubmissions.filter(submission => submission.workproofId === currentWorkproofId).length === 1) return

    if (reviewableSubmissions.length > 0) {
      setCurrentWorkproofId(reviewableSubmissions[0].workproofId)
      return
    }

    if (reviewedSubmissions.length > 0) {
      setCurrentWorkproofId(reviewedSubmissions[0].workproofId)
      return
    }

    if (unreviewableSubmissions.length > 0) {
      setCurrentWorkproofId(unreviewableSubmissions[0].workproofId)
      return
    }
  }, [currentWorkproofId, allSubmissions, reviewableSubmissions, reviewedSubmissions, unreviewableSubmissions])

  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row">
          {(!isAdmin || allSubmissions.length === 0) && !loading && <NothingToVerify challengeURL={`/dao/${roomId}/challenges/${challengeId}`} />}
          {isAdmin && (
            <>
              <div className="md:w-2/3">
                <div className="sticky top-0">
                  <h1 className="text-xl py-4">{challenge?.title}</h1>
                  {currentWorkproof && canVerifyCurrentWorkproof && (
                    <VerifyWork workproof={currentWorkproof} onVerified={() => { }} />
                  )}
                  {currentWorkproof && !canVerifyCurrentWorkproof && (
                    <InspectWork workproof={currentWorkproof} />
                  )}

                </div>
              </div>
              <div className="md:w-1/3">
                {reviewableSubmissions.length > 0 && (
                  <>
                    <h2 className="text-xl py-4 text-daonative-subtitle sticky top-0 z-10 bg-daonative-dark-300 px-4">To Review</h2>
                    <div className="px-4">
                      <SubmissionsList submissions={reviewableSubmissions} currentSubmissionId={currentWorkproofId} onCurrentSubmissionChanged={setCurrentWorkproofId} />
                    </div>
                  </>
                )}
                {unreviewableSubmissions.length > 0 && (
                  <>
                    <h2 className="text-xl py-4 text-daonative-subtitle sticky top-0 z-10 bg-daonative-dark-300 px-4">Reviewable by others</h2>
                    <div className="px-4">
                      <SubmissionsList submissions={unreviewableSubmissions} currentSubmissionId={currentWorkproofId} onCurrentSubmissionChanged={setCurrentWorkproofId} />
                    </div>
                  </>
                )}
                <h2 className="text-xl py-4 text-daonative-subtitle sticky top-0 z-10 bg-daonative-dark-300 px-4">Reviewed</h2>
                <div className="px-4">
                  <SubmissionsList submissions={reviewedSubmissions} currentSubmissionId={currentWorkproofId} onCurrentSubmissionChanged={setCurrentWorkproofId} />
                </div>
              </div>
            </>

          )}
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default ChallengeDetails