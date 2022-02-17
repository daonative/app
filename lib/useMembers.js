import { collection, where, query, getFirestore } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import useRoomId from './useRoomId';

const useMembers = () => {
  const db = getFirestore()
  const roomId = useRoomId()
  const [membershipsSnapshot] = useCollection(
    query(collection(db, 'memberships'), where('roomId', '==', roomId || ''))
  );

  return membershipsSnapshot?.docs.map((doc) => (
    {
      ...doc.data(),
      membershipId: doc.id
    }
  )) || []
};

export default useMembers