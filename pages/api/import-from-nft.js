import requireAuthenticationMiddleware from '../../lib/requireAuthenticationMiddleware'
import admin from 'firebase-admin';
import { collectionAbi, ERC1155Abi } from '../../lib/abi'
import { ethers } from 'ethers'
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
  const totalSupply = await contract.totalSupply()
  const tokenIds = [...Array(totalSupply.toNumber()).keys()]
  const holders = await Promise.all(tokenIds.map(async tokenId => await contract.ownerOf(tokenId)))
  return holders
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
  const isEnumerable = await supportsInterface(readonlyProvider, address, '0x780e9d63')

  if (isERC721 && isEnumerable) {
    return await getERC721TokenHolders(chainId, address)
  }

  //const isERC1155 = await supportsInterface(readonlyProvider, address, '0xd9b67a26')

  //if (isERC1155) {
  //  return await getERC1155TokenHolders(chainId, address)
  //}

  throw Error('Invalid contract address. Needs to be an enumerable ERC721')
}

const setMembership = async (account, roomId) => {
  await db.collection('rooms').doc(roomId).collection('members').doc(account).set({ account }, { merge: true })
}

const setRoomTokenGate = async (roomId, chainId, tokenAddress) => {
  await db.collection('tokengates').add({
    roomId,
    chainId,
    tokenAddress
  })
}

const handler = async (req, res) => {
  const { chainId, collectionAddress, roomId } = req.body

  if (!chainId || !collectionAddress || !roomId) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  if (!isSupportedChain(Number(chainId))) {
    return res.status(400).json({ error: 'Unsupported chainId' })
  }

  if (!await isRoomAdmin(roomId, req.uid)) {
    return res.status(401).json({ error: "You're not an admin of this DAO" })
  }

  // Configure the gate at room level
  await setRoomTokenGate(roomId, Number(chainId), collectionAddress)

  // Get the holders and add them as members
  const holders = [...new Set(await getTokenHolders(Number(chainId), collectionAddress))]
  holders.forEach(token => setMembership(token, roomId))

  res.status(200).json({ roomId, holders });
}

export default requireAuthenticationMiddleware(handler);