import { CheckIcon } from "@heroicons/react/solid"
import Link from "next/link"
import { PrimaryButton } from "../../../components/Button"
import { LayoutWrapper } from "../../../components/LayoutWrapper"
import useMembers from "../../../lib/useMembers"

const challenges = []

const Leaderboard = () => {
  const members = useMembers()

  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Challenges</h2>
            <PrimaryButton>Claim reward</PrimaryButton>
          </div>
          <ul role="list" className="flex flex-col gap-3">
            {members?.map((member) => (
              <Link key={member.challengeId} href={`/dao/${roomId}/challenges/${member.challengeId}`}>
                <li>
                  <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded hover:cursor-pointer hover:bg-daonative-dark-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-daonative-gray-100 truncate">{member.title}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {member.weight} XP
                      </span>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                      </div>
                      <div className="mt-2 flex items-center text-sm text-daonative-gray-300 sm:mt-0">
                        <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
                        <p>
                          {member?.meta?.submissionCount || 0} Completions
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default Leaderboard