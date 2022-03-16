import { CheckCircleIcon } from "@heroicons/react/solid"
import { useEffect, useState } from "react"
import { useWallet } from "use-wallet"
import { PrimaryButton } from "../../../components/Button"
import { InviteMemberModal } from "../../../components/InviteMemberModal"
import { LayoutWrapper } from "../../../components/LayoutWrapper"
import PFP from "../../../components/PFP"
import ShortAddress from "../../../components/ShortAddress"
import { useNewMembers } from "../../../lib/useMembers"
import useMembership from "../../../lib/useMembership"
import useRoomId from "../../../lib/useRoomId"

const MemberList = ({ members }) => {
  return (
    <ul role="list" className="flex flex-col gap-3">
      {
        members?.map((member, idx) => (
          <li key={idx}>
            <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded flex justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {member.ensAvatar && <img src={member.ensAvatar} alt="Member avatar" className="rounded-full h-10 w-10" />}
                {!member.ensAvatar && <PFP address={member?.account} size={40} />}
                {/* Name */}
                {member.ensName && <div className="flex gap-1 items-center">{member.ensName}<CheckCircleIcon className="h-3 w-3 text-daonative-primary-blue" /></div>}
                {!member.ensName && member.name && <>{member.name}</>}
                {!member.ensName && !member.name && <ShortAddress>{member.account}</ShortAddress>}
              </div>
              <div className="mt-2 sm:flex flex-col items-end gap-0.5">
                {member?.roles?.map((role, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 font-weight-600 font-space">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
    </ul>)
}

export const Members = () => {
  const roomId = useRoomId()
  const [open, setOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const isAdmin = membership?.roles?.includes('admin')
  const [members] = useNewMembers()


  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  useEffect(() => {
    setInviteLink(`${window?.origin}/dao/${roomId}/join`)
  }, [roomId])

  return (
    <>
      <InviteMemberModal open={open} onClose={closeModal} inviteLink={inviteLink} />
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Members</h2>
            {isAdmin && (<PrimaryButton onClick={openModal}>Add member</PrimaryButton>)}
          </div>
          <MemberList members={members} />
        </div>
      </div>
    </>
  )


}

const MembersPage = () => {
  return (
    <LayoutWrapper>
      <Members />
    </LayoutWrapper>
  )
}

export default MembersPage