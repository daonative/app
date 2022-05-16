import requireAuthenticationMiddleware from '@/lib/requireAuthenticationMiddleware'
import admin from 'firebase-admin';
import { canJoin } from './has-access';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
  });
}

const db = admin.firestore();

const addMember = async (account, roomId) => {
  await db.collection('rooms').doc(roomId).collection('members').doc(account).set({ account }, { merge: true })
}

const handler = async (req, res) => {
  const account = req.uid
  const { roomId } = req.body

  if (!roomId) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  const hasAccess = await canJoin(roomId, account)

  if (!hasAccess) {
    return res.status(400).json({ error: "You don't have access to this DAO" })
  }

  await addMember(account, roomId)

  res.status(200).json({ roomId });
}

export default requireAuthenticationMiddleware(handler);