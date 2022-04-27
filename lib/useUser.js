import { getFirestore, doc } from 'firebase/firestore';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useWallet } from '@/lib/useWallet';

const useUser = () => {
  const db = getFirestore()
  const { account } = useWallet()
  const [user] = useDocumentDataOnce(
    doc(db, 'users', account || '0')
  )

  return user
};

export default useUser