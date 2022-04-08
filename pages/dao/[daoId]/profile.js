import { CheckIcon } from "@heroicons/react/solid"
import { doc, getFirestore } from "firebase/firestore"
import { useRouter } from "next/router"
import { useDocumentData } from "react-firebase-hooks/firestore"
import { useWallet } from "use-wallet"
import { PrimaryButton } from "../../../components/Button"
import { LayoutWrapper } from "../../../components/LayoutWrapper"
import { UserName } from "../../../components/PFP"

const kFormatter = (num) =>
  Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)

const ProfilePage = () => {
  const db = getFirestore()
  const { account } = useWallet()
  const { query: { daoId: roomId } } = useRouter()
  const [leaderboardPosition] = useDocumentData(
    doc(db, 'rooms', roomId || '0', 'leaderboard', account || '0')
  )

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
                {kFormatter(leaderboardPosition?.verifiedExperience)} XPs
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-daonative-subtitle text-sm flex">
              <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
              {leaderboardPosition?.submissionCount} Challenges Completed
            </div>
            <PrimaryButton disabled={true}>Claim</PrimaryButton>
          </div>
        </div>
        <div className="pt-8 text-center">
          <p>Coming soon. Here you will be able to claim the rewards for your work.</p>
        </div>
        {/*
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
            <span className="text-xl">100</span>
            <span className="text-daonative-subtitle text-xl">$GREEN</span>
          </div>
        </div>
        <div className="flex gap-6">
          <div>
            <img src="https://arweave.net/Jf6CQMTDHpNu2jpGrwTSr6V9hdsp7geyqQM0xypenTE" className="w-32 rounded-md" />
            <span className="text-xs text-daonative-subtitle">Undefined contract #5</span>
          </div>
          <div>
            <img src="https://ipfs.infura.io/ipfs/QmcebJ4PbN3yXKSZoKdf7y7vBo5T4X98VKGULnkdFnAK2m" className="w-32 rounded-md" />
            <span className="text-xs text-daonative-subtitle">Early Adopters Gen 1</span>
          </div>
        </div>
        <div className="flex justify-end w-full items-end">
        </div>
        */}
      </div>
    </LayoutWrapper>
  )
}

export default ProfilePage