import { ERC1155Abi } from '@/lib/abi'
import { getReadonlyProvider } from '@/lib/chainSupport';
import { ethers } from 'ethers'
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

const hasERC1155Token = async (chainId, contractAddress, tokenId, owner) => {
  const readonlyProvider = getReadonlyProvider(chainId)
  const contract = new ethers.Contract(contractAddress, ERC1155Abi, readonlyProvider)
  const balance = await contract.balanceOf(owner, tokenId)
  return balance.gt(0)
}

const checkGate = async (gate, account) => {
  // We only support ERC1155 for now
  if (gate.type !== "ERC1155") return

  const { chainId, contractAddress, tokenId} = gate

  return hasERC1155Token(chainId, contractAddress, tokenId, account)
}

const getGates = async (roomId) => {
  const tokenGates = await db.collection('gates').where('roomId', '==', roomId).get()
  return tokenGates.docs.map(doc => doc.data())
}

export const canJoin = async (roomId, account) => {
  const gates = await getGates(roomId)
  const checkResults = await Promise.all(gates.map(async gate => await checkGate(gate, account)))
  const canJoin = checkResults.filter(result => result === true).length > 0
  return canJoin
}

const handler = async (req, res) => {
  const { roomId, account } = req.body

  if (!roomId || !account) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  const hasAccess = await canJoin(roomId, account)
  res.status(200).json({ roomId, hasAccess });
}

export default handler