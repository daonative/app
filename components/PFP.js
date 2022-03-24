import { CheckCircleIcon } from '@heroicons/react/solid'
import { providers } from 'ethers'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

const PFP = ({ address, size }) => (
  <Jazzicon diameter={size} seed={jsNumberForAddress(address || '')} />
)

export const UserAvatar = ({ account }) => {
  const [ensAvatar, setEnsAvatar] = useState(null)

  useEffect(() => {
    const retrieveEnsName = async (account) => {
      const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET)
      const ensName = await provider.lookupAddress(account)
      if (!ensName) return
      const ensAvatar = await provider.getAvatar(ensName)
      console.log(ensAvatar)
      setEnsAvatar(ensAvatar)
    }

    setEnsAvatar(null)
    if (!account) return
    retrieveEnsName(account)
  }, [account])

  if (!ensAvatar)
    return <PFP address={account} size={40} />

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ensAvatar} alt="Member avatar" className="rounded-full h-10 w-10" />
}

export const UserName = ({ account }) => {
  const [ensName, setEnsName] = useState(null);
  const [ensNameLoading, setEnsNameLoading] = useState(true)
  const [user, setUser] = useState({})

  const shortAddress = (address, length = 6) => `${address.substring(0, (length / 2) + 2)}...${address.substring(address.length - length / 2)}`
  const getDisplayName = () => {
    if (!account) return ""
    if (ensNameLoading) return shortAddress(account)
    if (!ensNameLoading && ensName) return ensName
    if (!ensNameLoading && user?.name) return user.name
    return shortAddress(account)
  }

  const displayNameVerified = !!ensName
  const displayName = getDisplayName()

  useEffect(() => {
    const retrieveUser = async () => {
      const db = getFirestore()
      const userRef = doc(db, 'users', account)
      const userSnap = await getDoc(userRef)
      const user = userSnap.data()
      setUser(user)
    }

    const retrieveEnsName = async () => {
      setEnsNameLoading(true)
      const provider = new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET)
      const ensName = await provider.lookupAddress(account)
      setEnsName(ensName)
      setEnsNameLoading(false)
    }

    setUser({})
    setEnsName(null)

    if (!account) return

    retrieveUser()
    retrieveEnsName()
  }, [account])

  if (displayNameVerified)
    return <span className="flex gap-1 items-center">{displayName}<CheckCircleIcon className="h-4 w-4 text-daonative-white" /></span>
  return <>{displayName}</>
}

export default PFP