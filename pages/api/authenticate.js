import admin from 'firebase-admin';

import { ethers } from "ethers";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    }),
  });
}

const auth = admin.auth();

async function handler(req, res) {
  const { account, signature } = req.body
  const message = "HELLO"

  if ( !account || !signature) {
    return res.status(400).json({error: 'Missing one of the required parameters'})
  }

  const signatureAccount = ethers.utils.verifyMessage(message, signature)

  if (account !== signatureAccount) {
    return res.status(400).json({error: "Signature didn't match account"})
  }

  const firebaseToken = await auth.createCustomToken(account);

  res.status(200).json({firebaseToken});
}

export default handler;