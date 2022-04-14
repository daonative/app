import requireAuthenticationMiddleware from '../../lib/requireAuthenticationMiddleware'
import admin from 'firebase-admin';
import { serverTimestamp } from 'firebase/firestore';

const db = admin.firestore()

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
  });
}

const handler = async (req, res) => {
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  const roomRef = await db.collection('rooms').add({ name, created: serverTimestamp() })
  const { id: roomId } = roomRef
  const account = req.uid

  await db.collection('rooms').doc(roomId).collection('members').doc(account).set({
    account,
    roles: ['admin']
  }, { merge: true })

  return res.status(200).json({ roomId });
}

export default requireAuthenticationMiddleware(handler);