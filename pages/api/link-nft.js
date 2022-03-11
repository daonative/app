import admin from 'firebase-admin';
import { collectionAbi } from '../../lib/abi'
import { ethers, providers } from 'ethers'

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

const isRoomAdmin = async (roomId, uid) => {
  try {
    const membershipDoc = await db.collection('rooms').doc(roomId).collection('members').doc(uid).get()
    const membership = membershipDoc.data()
    return membership?.roles?.includes('admin')
  } catch (e) {
    return false
  }
}

const getCollectionTokens = async (collectionAddress) => {
  const readonlyProvider = new providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_POLYGON
  )
  const contract = new ethers.Contract(collectionAddress, collectionAbi, readonlyProvider)
  const mintFilter = contract.filters.Transfer(null)
  const mintEvents = await contract.queryFilter(mintFilter)
  const tokens = await Promise.all(mintEvents.map(async event => ({
    tokenId: event.args?.tokenId.toNumber(),
    owner: event.args?.to
  })))
  return tokens
}

const setMembership = async (account, roomId, roles) => {
  const rolesData = roles?.length > 0 ? {roles: admin.firestore.FieldValue.arrayUnion(...roles)} : {}

  // Set membership
  await db.collection('rooms').doc(roomId).collection('members').doc(account).set({
    account,
    ...rolesData
  }, { merge: true })

  // Update user
  await db.collection('users').doc(account).set({
    rooms: admin.firestore.FieldValue.arrayUnion(account)
  }, { merge: true })
}

async function handler(req, res) {
  await checkAuth(req, res)

  if (!req.uid) return

  const { collectionAddress, roomId, admin } = req.body

  if (!collectionAddress || !roomId || admin === undefined) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  if (!await isRoomAdmin(roomId, req.uid)) {
    return res.status(401).json({ error: "You're not an admin of this DAO" })
  }

  const tokens = await getCollectionTokens(collectionAddress)
  const roles = admin ? ['admin'] : []

  tokens.map(token => {
    setMembership(token.owner, roomId, roles)
  })

  res.status(200).json({ roomId, roles, tokens });
}

export default handler;