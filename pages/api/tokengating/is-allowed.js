import { ERC1155Abi } from '@/lib/abi'
import { getReadonlyProvider } from '@/lib/chainSupport';
import { ethers } from 'ethers'

const hasERC1155Token = async (chainId, contractAddress, tokenId, owner) => {
  const readonlyProvider = getReadonlyProvider(chainId)
  const contract = new ethers.Contract(contractAddress, ERC1155Abi, readonlyProvider)
  const balance = await contract.balanceOf(owner, tokenId)
  return balance.gt(0)
}


const handler = async (req, res) => {
  const { roomId, account } = req.body

  if (!roomId || !account) {
    return res.status(400).json({ error: 'Missing one of the required parameters' })
  }

  const allowed = await hasERC1155Token(4, '0x8552799e56a6882712da818f5b0578f3d41b3860', 1, account)

  res.status(200).json({ roomId, allowed });
}

export default handler