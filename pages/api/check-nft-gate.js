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

const getReadonlyProvider = (chainId) => {
  if (chainId === 137)
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_POLYGON)
  if (chainId === 1)
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET)

  throw Error("Unknown chain id")
}

const doesAccountHaveNFT = async (account, chainId, collectionAddress) => {
  const readonlyProvider = getReadonlyProvider(chainId)
  const contract = new ethers.Contract(collectionAddress, collectionAbi, readonlyProvider)
  const balance = await contract.balanceOf(account)
  console.log(balance)
  return balance !== 0
}

const getRoomNFTGates = async (roomId, account) => {
  const roomSnapshot = await db.collection('rooms').doc(roomId).get()
  const roomData = roomSnapshot.data()
  const gates = await Promise.all(
    roomData?.nftGates.map(async gate => ({
      ...gate,
      test: console.log(gate),
      isMember: await doesAccountHaveNFT(account, gate.chainId, gate.collectionAddress)
    }))
  )
  console.log(gates)
}

async function handler(req, res) {
  const { roomId, account } = req.body

  if (!roomId || !account) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  getRoomNFTGates(roomId, account)
}
export default handler;