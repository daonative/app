import axios from 'axios';
import { getFirestore, doc, query, collection, where, getDocs, collectionGroup, documentId } from 'firebase/firestore';
import { useEffect } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';

const useMembership = (account, roomId) => {
  const db = getFirestore()
  const [membership] = useDocumentData(
    doc(db, 'rooms', roomId || '0', 'members', account || '0')
  );
  const [user] = useDocumentData(
    doc(db, 'users', account || '0')
  )

  useEffect(() => {
    const checkNftGate = async () => {
      const result = await axios.post('/api/check-nft-gate', { roomId, account })
      console.log(result)
    }

    if (!account) return
    if (!roomId) return

    checkNftGate()
  })

  if (!membership)
    return null;

  return {
    name: user?.name,
    ...membership
  };
};

export const getUserRooms = async (account) => {
  const db = getFirestore()
  const membershipsQuery = query(collectionGroup(db, 'members'), where('account', '==', account))
  const membershipsSnapshot = await getDocs(membershipsQuery)
  const memberships = membershipsSnapshot.docs.map(doc => ({
    roomId: doc?.ref?.parent?.parent?.id,
    membership: doc.data()
  }))
  const roomIds = memberships.map(membership => membership.roomId)

  if (roomIds?.length === 0) return []

  const roomsQuery = query(collection(db, 'rooms'), where(documentId(), 'in', roomIds))
  const roomsSnapshot = await getDocs(roomsQuery)
  const rooms = roomsSnapshot.docs.map(doc => ({
    ...doc.data(),
    roomId: doc.id,
    membership: memberships
      .find(membership => membership.roomId === doc.id)
      ?.membership
  }))

  return rooms
}

export default useMembership