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

const verifyToken = async (tokenId) => {
  try {
    const token = await admin.auth().verifyIdToken(tokenId)
    return token.uid
  } catch (e) {
    return null
  }
}

const checkAuth = async (req, res) => {
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
}

export default async function handler(req, res) {
  await checkAuth(req, res)

  if (!req.uid) return

  const account = req.uid
  const { inviteCode, roomId, name } = req.body

  if (!inviteCode || !roomId || !name) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  const inviteDoc = await db.collection('invites').doc(inviteCode).get()

  if (!inviteDoc.exists) {
    return res.status(400).json({ error: 'Invalid invite' })
  }

  const invite = inviteDoc.data()

  if (invite.roomId !== roomId) {
    return res.status(400).json({ error: 'Invalid invite' })
  }

  const rolesData = invite?.roles?.length > 0 ? { roles: admin.firestore.FieldValue.arrayUnion(...invite.roles) } : { }
  await db.collection('rooms').doc(roomId).collection('members').doc(account).set({
    account,
    ...rolesData
  }, { merge: true })

  await db.collection('users').doc(account).set({
    name
  }, { merge: true })


    return res.status(200).json({})
}