import { addDoc, collection, doc, getDocs, getFirestore, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useWallet } from "@/lib/useWallet"
import { PrimaryButton } from "../../../components/Button"
import { InviteMemberModal } from "../../../components/InviteMemberModal"
import { LayoutWrapper } from "../../../components/LayoutWrapper"
import PFP, { UserAvatar, UserName } from "../../../components/PFP"
import { useNewMembers } from "../../../lib/useMembers"
import useMembership from "../../../lib/useMembership"
import useRoomId from "../../../lib/useRoomId"
import { SimpleCard, SimpleCardBody } from "../../../components/Card"
import { useRouter } from "next/router"
import { useRequireAuthentication } from "../../../lib/authenticate"
import Moment from "react-moment"
import axios from "axios"
import { useSendTransaction } from "wagmi"
import ShortAddress from "@/components/ShortAddress"


const MemberItem = ({ member }) => {
  const account = member.account

  return (
    <li >
      <SimpleCard className="h-full">
        <SimpleCardBody>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 min-w-max items-start font-semibold text-sm">
              <UserAvatar account={account} />
              <div>
                <UserName account={account} />
                {member?.joinDate && (
                  <div className="text-xs text-gray-500 pr-1 min-w-max">
                    Joined {member?.joinDate && <Moment date={member?.joinDate?.toMillis()} fromNow />}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-end">
              {member?.roles?.map((role, idx) => (
                <div key={idx} className="text-xs px-1 py-0.5 rounded-md font-medium bg-blue-100 text-blue-800 font-weight-600 font-space">
                  {role}
                </div>
              ))}
            </div>

          </div>
        </SimpleCardBody>
      </SimpleCard>
    </li >)

}

const MemberList = ({ members }) => {
  return (
    <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {
        members?.map((member, idx) => (
          <MemberItem key={idx} member={member} />
        ))}
    </ul>)
}

const TokenHolderItem = ({ holder }) => {
  const account = holder.account

  return (
    <li >
      <SimpleCard className="h-full">
        <SimpleCardBody>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 min-w-max items-start font-semibold text-sm">
              <PFP address={account} size={40} />
              <div>
                <ShortAddress>{account}</ShortAddress>
              </div>
            </div>
          </div>
        </SimpleCardBody>
      </SimpleCard>
    </li >
  )
}

const TokenHoldersList = ({ holders }) => {
  return (
    <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {
        holders?.map((holder, idx) => (
          <TokenHolderItem key={idx} holder={holder} />
        ))}
    </ul>
  )
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

  const [tokenHolders, setTokenHolders] = useState([])

  useEffect(() => {
    const retrieveTokenGatedMembers = async () => {
      const db = getFirestore()
      const tokenGatesSnap = await getDocs(query(collection(db, 'gates'), where('roomId', '==', roomId)))
      const tokenGates = tokenGatesSnap.docs
        .map(gate => gate.data())
        .filter(gate => gate.chainId === 1)
        .map(gate => ({ tokenAddress: gate.contractAddress, amount: "1" }))

      if (tokenGates.length === 0) return

      const holdersResponse = await axios.post('https://balancy.guild.xyz/api/xyzHolders', {
        logic: 'OR',
        limit: 0,
        requirements: tokenGates
      })

      const tokenHolders = holdersResponse.data.addresses.map(address => ({ account: address }))
      setTokenHolders(tokenHolders)
    }

    if (!roomId) return

    retrieveTokenGatedMembers()
  }, [roomId])

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
      <div className="mx-auto px-4 sm:px-6 md:px-8 ">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl">Members</h2>
            <div className="flex gap-2 items-center">
              <span className="text-daonative-subtitle">{members?.length} member(s)</span>
              {isAdmin && (<PrimaryButton onClick={handleModal}>Add member</PrimaryButton>)}
            </div>
          </div>
          <MemberList members={members} />
          {tokenHolders.length > 0 && (
            <>
              <h2 className="text-2xl">Token Holders</h2>
              <TokenHoldersList holders={tokenHolders} />
            </>
          )
          }
        </div>
      </div>
    </>
  )
}

const MembersPage = () => {
  return (
    <LayoutWrapper>
      <div className="max-w-4xl m-auto">
        <Members />
      </div>
    </LayoutWrapper>
  )
}

export default MembersPage