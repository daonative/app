import { collection, query, getFirestore, onSnapshot, } from 'firebase/firestore';
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

  useEffect(() => {
    const db = getFirestore()


    if (!roomId) return

    const membershipObserver = onSnapshot(collection(db, 'rooms', roomId, 'members'), async (snapshot) => {
      setIsLoading(true)

      const members = snapshot.docs.map(doc => doc.data())
      setMembers(members)
      setIsLoading(false)

    })

    return membershipObserver
  }, [roomId])


  return [members, isLoading,]
}

export default useMembers