import { CheckCircleIcon } from "@heroicons/react/solid"
import { addDoc, collection, doc, getDoc, getFirestore, setDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useWallet } from "use-wallet"
import { PrimaryButton } from "../../../components/Button"
import { InviteMemberModal } from "../../../components/InviteMemberModal"
import { LayoutWrapper } from "../../../components/LayoutWrapper"
import PFP from "../../../components/PFP"
import { useNewMembers } from "../../../lib/useMembers"
import useMembership from "../../../lib/useMembership"
import useRoomId from "../../../lib/useRoomId"
import { Card } from "../../../components/Card"
import { getReadonlyProvider } from "../../../lib/chainSupport"
import useProvider from "../../../lib/useProvider"
import { ethers } from "ethers"
import { useRouter } from "next/router"
import { useRequireAuthentication } from "../../../lib/authenticate"


const MemberItem = ({ member }) => {
  const [ensName, setEnsName] = useState(null);
  const [ensAvatar, setEnsAvatar] = useState(null)
  const [ensNameLoading, setEnsNameLoading] = useState(true)
  const [user, setUser] = useState({})
  const account = member?.account
  useEffect(() => {
    const resetValues = () => {
      setUser({})
      setEnsName(null)
      setEnsAvatar(null)
    }

    const retrieveUser = async () => {
      const db = getFirestore()

      const userRef = doc(db, 'users', account)
      const userSnap = await getDoc(userRef)
      const user = userSnap.data()
      setUser(user)
    }

    const retrieveEnsName = async () => {
      setEnsNameLoading(true)
      const provider = getReadonlyProvider(1)
      const ensName = await provider.lookupAddress(account)
      setEnsName(ensName)
      setEnsNameLoading(false)

      if (!ensName) return

      const ensAvatar = await provider.getAvatar(ensName)
      setEnsAvatar(ensAvatar)
    }

    resetValues()

    if (!account) return

    retrieveEnsName()
    retrieveUser()
  }, [account])

  const shortAddress = (address, length = 6) => `${address.substring(0, (length / 2) + 2)}...${address.substring(address.length - length / 2)}`
  const getDisplayName = () => {
    if (!account) return ""
    if (ensNameLoading) return shortAddress(account)
    if (!ensNameLoading && ensName) return ensName
    if (!ensNameLoading && user?.name) return user.name
    return shortAddress(account)
  }
  const profile = {
    displayName: getDisplayName(),
    displayNameVerified: !!ensName,
    avatar: ensAvatar,
    user
  }


  return (
    <li >
      <Card>
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {profile.avatar && <img src={profile.avatar} alt="Member avatar" className="rounded-full h-10 w-10" />}
            {!profile.avatar && <PFP address={account} size={40} />}
            {/* Name */}
            {profile.displayNameVerified && <div className="flex gap-1 items-center">{profile.displayName}<CheckCircleIcon className="h-4 w-4 text-daonative-white" /></div>}
            {!profile.displayNameVerified && profile.displayName}
          </div>
          <div className="mt-2 sm:flex flex-col items-end gap-0.5">
            {profile?.roles?.map((role, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 font-weight-600 font-space">
                {role}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </li >)

}

const MemberList = ({ members }) => {
  return (
    <ul role="list" className="flex flex-col gap-3">
      {
        members?.map((member, idx) => (
          <MemberItem key={idx} member={member} />
        ))}
    </ul>)
}

export const Members = () => {
  const roomId = useRoomId()
  const [open, setOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const { query: params } = useRouter()
  const { account } = useWallet()
  const membership = useMembership(account, roomId)
  const isAdmin = membership?.roles?.includes('admin')
  const [members] = useNewMembers()
  const requireAuthentication = useRequireAuthentication()


  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  const handleModal = async () => {
    await requireAuthentication()
    const db = getFirestore()
    const inviteRef = await addDoc(collection(db, 'invites'), { roomId: params.daoId });
    setInviteLink(`${window?.origin}/dao/${roomId}/join?inviteCode=${inviteRef.id}`)
    openModal()
  }

  return (
    <>
      <InviteMemberModal open={open} onClose={closeModal} inviteLink={inviteLink} />
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Members</h2>
            {isAdmin && (<PrimaryButton onClick={handleModal}>Add member</PrimaryButton>)}
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