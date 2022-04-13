import { getFirestore, doc, query, where, getDocs, collectionGroup, getDoc } from 'firebase/firestore';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';

const useMembership = (account, roomId) => {
  const db = getFirestore()
  const [membership] = useDocumentDataOnce(
    doc(db, 'rooms', roomId || '0', 'members', account || '0')
  );
  const [user] = useDocumentDataOnce(
    doc(db, 'users', account || '0')
  )

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

  const rooms = roomIds.map(async roomId => {
    const roomSnap = await getDoc(doc(db, 'rooms', roomId))
    return {
    ...roomSnap.data(),
    roomId: roomSnap.id,
    membership: memberships
      .find(membership => membership.roomId === roomSnap.id)
      ?.membership
    }
  })

  return await Promise.all(rooms)
}

export default useMembership