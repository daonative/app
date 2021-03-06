import admin from 'firebase-admin';

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

async function handler(req, res) {
  const { account } = req.body

  const nonce = Math.floor(Math.random() * 10000)

  await db.collection('users').doc(account).set({ nonce }, { merge: true })

  res.status(200).json({ nonce });
}

export default handler;