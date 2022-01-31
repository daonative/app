import admin from 'firebase-admin';

import { ethers } from "ethers";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function handler(req, res) {
  const { account, signature } = req.body

  if ( !account || !signature) {
    return res.status(400).json({error: 'Missing one of the required parameters'})
  }

  const userDoc = await db.collection('users').doc(account).get()
  const nonce = userDoc.exists && userDoc.data()?.nonce

  if (!nonce) {
    return res.status(400).json({error: "No nonce available for this user"})
  }

  const message = `${account} ${nonce}`
  const signatureAccount = ethers.utils.verifyMessage(message, signature)

  if (account !== signatureAccount) {
    return res.status(400).json({error: "Signature didn't match account"})
  }
  const firebaseToken = await auth.createCustomToken(account);
  
  await db.collection('users').doc(account).set({nonce: null}, {merge: true})

  res.status(200).json({firebaseToken});
}

export default handler;