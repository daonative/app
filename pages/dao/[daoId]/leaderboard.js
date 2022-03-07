import { CheckIcon, UsersIcon } from "@heroicons/react/solid"
import { collection, getFirestore, orderBy, query } from "firebase/firestore"
import { useCollectionData } from "react-firebase-hooks/firestore"
import { PrimaryButton } from "../../../components/Button"
import { LayoutWrapper } from "../../../components/LayoutWrapper"
import PFP from "../../../components/PFP"
import useRoomId from "../../../lib/useRoomId"

const db = getFirestore()

const kFormatter = (num) =>
  Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)

const Leaderboard = () => {
  const roomId = useRoomId()
  const [leaders] = useCollectionData(
    query(collection(db, 'rooms', roomId || 'x', 'leaderboard'), orderBy('verifiedExperience', 'desc'))
  )

  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Leaderboard</h2>
            <PrimaryButton className="invisible">Claim reward</PrimaryButton>
          </div>
          <ul role="list" className="flex flex-col gap-3">
            {leaders?.map((leader, idx) => (
              <li key={idx}>
                <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded flex justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
                      #{String(idx + 1).padStart(3, '0')}
                    </span>
                    <PFP address={leader?.userAccount} size={38} />
                    <p className="text-sm font-medium text-daonative-gray-100">{leader?.userName}</p>
                  </div>
                  <div className="mt-2 sm:flex flex-col items-end gap-0.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 font-weight-600 font-space">
                      {kFormatter(leader?.verifiedExperience)} XPs ({kFormatter(leader?.pendingExperience)} pending)
                    </span>
                    <div className="mt-2 flex items-center text-sm text-daonative-gray-300 sm:mt-0">
                      <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
                      <p>
                        {leader?.submissionCount || 0} Completions
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default Leaderboard