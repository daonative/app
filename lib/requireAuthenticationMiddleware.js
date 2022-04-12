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

const verifyToken = async (tokenId) => {
  try {
    const token = await admin.auth().verifyIdToken(tokenId)
    return token.uid
  } catch (e) {
    return null
  }
}

const middleware = (handler) => async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials' })
  }

  const authHeader = req.headers.authorization.split(' ')

  if (authHeader.length != 2) {
    return res.status(403).json({ error: 'Invalid credentials' })
  }

  const token = authHeader[1];
  const uid = await verifyToken(token)

  if (!uid) {
    return res.status(403).json({ error: 'Invalid credentials' })
  }

  req.uid = uid
  return handler(req, res)
}

export default middleware