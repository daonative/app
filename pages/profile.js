import { CheckIcon } from "@heroicons/react/solid"
import { collectionGroup, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useWallet } from "use-wallet"
import { PrimaryButton } from "../components/Button"
import { LayoutWrapper } from "../components/LayoutWrapper"
import { UserName } from "../components/PFP"

const kFormatter = (num) =>
  Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)

const ProfilePage = () => {
  const { account } = useWallet()
  const [submissionCount, setSubmissionCount] = useState(0)
  const [verifiedXps, setVerifiedXps] = useState(0)

  useEffect(() => {
    const retrieveLeaderboardPositions = async () => {
      const db = getFirestore()
      const leaderboardPositionsQuery = query(collectionGroup(db, 'leaderboard'), where('userAccount', '==', account || 'x'))
      const leaderboardPositionsSnapshot = await getDocs(leaderboardPositionsQuery)
      const leaderboardPositions = leaderboardPositionsSnapshot.docs.map(doc => doc.data())

      const submissionCount = leaderboardPositions
        .map(leaderboardPosition => leaderboardPosition.submissionCount)
        .reduce((total, currentValue) => total + currentValue, 0)

      const verifiedXps = leaderboardPositions
        .map(leaderboardPosition => leaderboardPosition.verifiedExperience)
        .reduce((total, currentValue) => total + currentValue, 0)

      setSubmissionCount(submissionCount)
      setVerifiedXps(verifiedXps)
    }

    retrieveLeaderboardPositions()
  }, [account])

  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8 lg:w-3/4 flex flex-col gap-8">
        <div className="flex justify-between w-full items-center">
          <div className="flex flex-col grow-0 gap-1">
            <h1 className="text-2xl">
              <UserName account={account} />
            </h1>
            <div>
              <span className="px-4 py-0.5 rounded-md text-md font-medium bg-blue-100 text-blue-800 font-weight-600 font-space text-center inline">
                {kFormatter(verifiedXps)} XPs
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-daonative-subtitle text-sm flex">
              <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
              {submissionCount} Challenges Completed
            </div>
            <PrimaryButton disabled={true}>Claim</PrimaryButton>
          </div>
        </div>
      </div>
      <div className="relative mx-auto py-8 px-4 sm:px-6 md:px-8 lg:w-3/4 flex flex-col gap-8">
        <div className="absolute top-0 left-0 w-full h-full bg-daonative-dark-300 bg-opacity-80">
          <div className="flex items-center justify-center text-3xl pt-20">
            Coming soon
          </div>
        </div>
        <div className="flex justify-between w-full items-end">
          <div>
            <span className="text-sm text-daonative-subtitle">Role</span>
            <h2 className="text-xl">
              Guild Hero
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-daonative-subtitle text-sm">3 Pending Rewards &amp; 1 Role</div>
          </div>
        </div>
        <div className="flex justify-between w-full items-end border-t pt-8 border-daonative-component-bg">
          <div>
            <h2 className="text-xl">Latest Rewards</h2>
          </div>
          <div className="flex gap-1">
            <span className="text-xl">{Math.floor(verifiedXps / 10)}</span>
            <span className="text-daonative-subtitle text-xl">$GREEN</span>
          </div>
        </div>
        <div className="flex gap-6">
          <div>
            <span className="text-xs text-daonative-subtitle">Undefined contract #5</span>
            <img src="https://arweave.net/Jf6CQMTDHpNu2jpGrwTSr6V9hdsp7geyqQM0xypenTE" className="w-32 rounded-md" />
          </div>
          <div>
            <span className="text-xs text-daonative-subtitle">Early Adopters Gen 1</span>
            <img src="https://ipfs.infura.io/ipfs/QmcebJ4PbN3yXKSZoKdf7y7vBo5T4X98VKGULnkdFnAK2m" className="w-32 rounded-md" />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default ProfilePage