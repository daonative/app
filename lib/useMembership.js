import { getFirestore, doc } from 'firebase/firestore';
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

export default useMembership