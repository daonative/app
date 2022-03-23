import admin from 'firebase-admin';
import { collectionAbi, ERC1155Abi } from '../../lib/abi'
import { ethers, providers } from 'ethers'
import { getReadonlyProvider, isSupportedChain } from '../../lib/chainSupport';

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

const getERC721TokenHolders = async (chainId, collectionAddress) => {
  const readonlyProvider = getReadonlyProvider(chainId)
  const contract = new ethers.Contract(collectionAddress, collectionAbi, readonlyProvider)
  const mintFilter = contract.filters.Transfer(null)
  const mintEvents = await contract.queryFilter(mintFilter)
  const tokens = await Promise.all(mintEvents.map(async event => ({
    tokenId: event.args?.tokenId.toNumber(),
    owner: event.args?.to
  })))
  return tokens
}

const getERC1155TokenHolders = async (chainId, address) => {
  const readonlyProvider = getReadonlyProvider(chainId)
  const contract = new ethers.Contract(address, ERC1155Abi, readonlyProvider)
  const transferSingleFilter = contract.filters.TransferSingle()
  const transferSingleEvents = await contract.queryFilter(transferSingleFilter)
  const tokenHolders = transferSingleEvents.reduce((holders, event) => {
    const id = event.args.id.toString()
    const { from, to, value } = event.args
    holders[`${to}-${id}`] = { address: to, id, balance: value }
    if (from !== '0x0000000000000000000000000000000000000000') {
      const newValue = holders[`${from}-${id}`].balance.sub(value)
      holders[`${from}-${id}`].balance = newValue
    }
    return holders
  }, {})
  const holders = Object.values(tokenHolders).filter(obj => obj.balance > 0).map(holder => holder.address)
  return holders
}

const supportsInterface = async (provider, address, ifaceId) => {
  const iface = new ethers.utils.Interface([
    'function supportsInterface(bytes4 interfaceID) external view returns (bool)'
  ])
  const contract = new ethers.Contract(address, iface, provider)
  return await contract.supportsInterface(ifaceId)
}

const getTokenHolders = async (chainId, address) => {
  const readonlyProvider = getReadonlyProvider(chainId)
  const isERC721 = await supportsInterface(readonlyProvider, address, '0x80ac58cd')

  if (isERC721) {
    return await getERC721TokenHolders(chainId, address)
  }

  const isERC1155 = await supportsInterface(readonlyProvider, address, '0xd9b67a26')

  if (isERC1155) {
    return await getERC1155TokenHolders(chainId, address)
  }

  throw Error('Invalid contract address')
}

const setMembership = async (account, roomId, roles) => {
  const rolesData = roles?.length > 0 ? { roles: admin.firestore.FieldValue.arrayUnion(...roles) } : { }

  // Set membership
  await db.collection('rooms').doc(roomId).collection('members').doc(account).set({
    account,
    ...rolesData
  }, { merge: true })

  // Update user
  //await db.collection('users').doc(account).set({
  //  rooms: admin.firestore.FieldValue.arrayUnion(account)
  //}, { merge: true })
}

const setRoomTokenGate = async (roomId, chainId, tokenAdress, roles) => {
  await db.collection('rooms').doc(roomId).set({
    tokenGates: admin.firestore.FieldValue.arrayUnion({
      chainId,
      tokenAdress,
      roles,
    })
  }, { merge: true })
}

async function handler(req, res) {
  await checkAuth(req, res)

  if (!req.uid) return

  const { chainId, tokenAddress, roomId, roles } = req.body

  if (!tokenAddress || !roomId || admin === undefined) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  if (roles.length > 0 && roles !== ['admin']) {
    return res.status(400).json({ error: 'Invalid roles' })
  }

  if (!isSupportedChain(Number(chainId))) {
    return res.status(400).json({ error: 'Unsupported chainId' })
  }

  if (!await isRoomAdmin(roomId, req.uid)) {
    return res.status(401).json({ error: "You're not an admin of this DAO" })
  }

  // Configure the gate at room level
  await setRoomTokenGate(roomId, Number(chainId), tokenAddress, roles)

  // Get the holders and add them as members
  const holders = await getTokenHolders(Number(chainId), tokenAddress)
  holders.forEach(token => setMembership(token, roomId, roles))

  res.status(200).json({ roomId, roles, tokens: holders });
}

export default handler;