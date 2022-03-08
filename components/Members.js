import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import useMembership from "../lib/useMembership"
import { useWallet } from "use-wallet"
import { InviteMemberModal } from "./InviteMemberModal"

const Members = ({ members }) => {
  const [open, setOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const { query } = useRouter()
  const { account } = useWallet()
  const membership = useMembership(account, query.daoId)
  const isAdmin = membership?.roles.includes('admin')

  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  useEffect(() => {
    setInviteLink(`${window?.origin}/dao/${query.daoId}/join`)
  }, [])

  return (
    <>
      <InviteMemberModal open={open} onClose={closeModal} inviteLink={inviteLink} />
      <div className="bg-daonative-dark-100 p-4 shadow rounded-lg">
        <h3 className="text-daonative-gray-200">Members</h3>
        <p className="text-sm font-medium text-gray-500 text-daonative-gray-400">{members.length}</p>
        <ul role="list" className="divide-y divide-gray-200 w-full">
          {members.map((member, memberIdx) => (
            <li key={memberIdx} className="py-4 flex justify-between">
              <div className="">
                <p className="text-sm font-medium text-gray-900 text-daonative-gray-200">{member.name}</p>
                {member.praiseThisWeek && <p className="text-xs text-gray-500 text-daonative-gray-400">Praise received this week</p>}
              </div>
            </li>
          ))}
        </ul>
        {isAdmin && (
          <button
            className="place-self-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={openModal}
          >
            Add a member
          </button>
        )}
      </div>
    </>
  )
}

export default Members