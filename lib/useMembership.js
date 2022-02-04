import { collection, where, query, getFirestore } from 'firebase/firestore';
import { useCollectionDataOnce } from 'react-firebase-hooks/firestore';

const useMembership = (account, roomId) => {
  const db = getFirestore()
  const [memberships] = useCollectionDataOnce(
    query(collection(db, 'memberships'), where('account', '==', account || ''), where('roomId', '==', roomId))
  );
  
  if (!memberships)
    return null;

  if (memberships.length === 0)
    return null;

  return memberships[0];
};

export default useMembership