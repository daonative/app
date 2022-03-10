import { collection, getFirestore, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useCollection } from "react-firebase-hooks/firestore"
import { useWallet } from "use-wallet"
import { PrimaryButton } from "../../../components/Button"
import { InviteMemberModal } from "../../../components/InviteMemberModal"
import { LayoutWrapper } from "../../../components/LayoutWrapper"
import PFP from "../../../components/PFP"
import useMembership from "../../../lib/useMembership"
import useRoomId from "../../../lib/useRoomId"

const db = getFirestore()

const MemberList = ({ members }) => {
  return (
    <ul role="list" className="flex flex-col gap-3">
      {
        members?.map((member, idx) => (
          <li key={idx}>
            <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded flex justify-between">
              <div className="flex items-center gap-3">
                <PFP address={member?.account} size={38} />
                <p className="text-sm font-medium text-daonative-gray-100">{member?.name}</p>
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
  const [membersSnapshot] = useCollection(
    query(collection(db, 'rooms', roomId || 'x', 'members'))
  )
  const [usersSnapshot] = useCollection(
    query(collection(db, 'users'), where('rooms', 'array-contains', roomId || ''))
  )


  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  useEffect(() => {
    setInviteLink(`${window?.origin}/dao/${roomId}/join`)
  }, [roomId])

  const users = usersSnapshot?.docs.map(doc => ({ account: doc.id, ...doc.data() }))
  const members = membersSnapshot?.docs.map((doc) => {
    const member = doc.data()
    const user = users?.find(user => user.account === doc.id)
    return {
      name: user?.name,
      ...member
    }
  })
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