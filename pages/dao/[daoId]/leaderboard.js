import { PageHeader } from "@/components/PageHeader"
import { CheckIcon } from "@heroicons/react/solid"
import { collection, getFirestore, orderBy, query } from "firebase/firestore"
import { useCollectionData } from "react-firebase-hooks/firestore"
import { PrimaryButton } from "../../../components/Button"
import { SimpleCard, SimpleCardBody } from "../../../components/Card"
import EmptyStateNoLeaders from "../../../components/EmptyStateNoLeaders"
import { LayoutWrapper } from "../../../components/LayoutWrapper"
import { UserName, UserRectangleAvatar } from "../../../components/PFP"
import useRoomId from "../../../lib/useRoomId"

const db = getFirestore()

const kFormatter = (num) =>
  Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)


const LeaderboardList = ({ leaders }) => {

  if (leaders?.length === 0) return <EmptyStateNoLeaders />

  return (
    <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>      {
      leaders?.map((leader, idx) => (
        <li key={idx}>
          <SimpleCard className={"hover:cursor-pointer opacity-[85%] hover:opacity-100"}>
            <SimpleCardBody>
              <div className="grid grid-cols-2">
                <div className="flex flex-col gap-3">
                  <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space max-w-max">
                    #{String(idx + 1).padStart(3, '0')}
                  </span>
                  <UserRectangleAvatar account={leader?.userAccount} />

                </div>
                <div className="flex flex-col justify-between max-w-[100%] overflow-none gap-1">
                  <p className="text-sm font-semibold text-daonative-gray-100">
                    <UserName account={leader?.userAccount} />
                  </p>

                  <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 font-weight-600 font-space max-w-max">
                    {kFormatter(leader?.verifiedExperience)} XPs
                  </span>

                  <span className="text-xs">
                    {kFormatter(leader?.pendingExperience)} XPs pending
                  </span>
                  <div className="flex gap-1 items-center text-xs text-daonative-gray-300 sm:mt-0 min-w-max">
                    <CheckIcon className="flex-shrink-0 h-4 w-4 text-daonative-primary-blue" />
                    <p>
                      {leader?.submissionCount || 0} Submissions
                    </p>
                  </div>

                </div>
              </div>
            </SimpleCardBody>
          </SimpleCard>
        </li>
      ))
    }
    </ul >)
}

const Leaderboard = () => {
  const roomId = useRoomId()
  const [leaders] = useCollectionData(
    query(collection(db, 'rooms', roomId || 'x', 'leaderboard'), orderBy('verifiedExperience', 'desc'))
  )

  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
        <div className="flex flex-col gap-4">
          <PageHeader>
            <h2 className="text-2xl pb-2">Leaderboard</h2>
          </PageHeader>
          <LeaderboardList leaders={leaders} />
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default Leaderboard