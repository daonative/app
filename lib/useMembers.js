import { providers } from 'ethers';
import { collection, query, getFirestore, onSnapshot, documentId, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import useRoomId from './useRoomId';

const useMembers = () => {
  const db = getFirestore()
  const roomId = useRoomId()
  const [membershipsSnapshot] = useCollection(
    query(collection(db, 'members', roomId || 'x', 'members'))
  );

  return membershipsSnapshot?.docs.map((doc) => (
    {
      ...doc.data(),
      membershipId: doc.id
    }
  )) || []
};

export const useNewMembers = () => {
  const roomId = useRoomId()
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingEns, setIsLoadingEns] = useState(true)

  useEffect(() => {
    const db = getFirestore()

    const getENSProfile = async (address) => {
      const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET)
      const ensName = await provider.lookupAddress(address)

      if (!ensName) return { ensName }

      const ensAvatar = await provider.getAvatar(ensName)

      return { ensName, ensAvatar }
    }

    const joinEnsProfiles = async (members) => {
      return await Promise.all(members.map(async member => ({
        ...member,
        ...(await getENSProfile(member.account))
      })))
    }

    const joinUsers = async (members) => {
      const accounts = members.map(member => member.account)

      if (accounts && accounts.length === 0) return members

      const usersQuery = query(collection(db, 'users'), where(documentId(), 'in', accounts))
      const usersSnapshot = await getDocs(usersQuery)
      const users = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        account: doc.id,
      }))

      return members.map(member => ({
        ...member,
        name: users.find(user => user.account === member.account)?.name
      }))
    }

    if (!roomId) return

    const membershipObserver = onSnapshot(collection(db, 'rooms', roomId, 'members'), async (snapshot) => {
      setIsLoading(true)
      setIsLoadingEns(true)

      const members = snapshot.docs.map(doc => doc.data())
      const membersWithNames = await joinUsers(members)
      setMembers(membersWithNames)
      setIsLoading(false)

      const membersWithEnsProfiles = await joinEnsProfiles(membersWithNames)
      setMembers(membersWithEnsProfiles)
      setIsLoadingEns(false)
    })

    return membershipObserver
  }, [roomId])


  return [members, isLoading, isLoadingEns]
}

export default useMembers