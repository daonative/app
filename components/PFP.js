import { CheckCircleIcon } from '@heroicons/react/solid'
import { useState } from 'react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import useUserProfile from '../lib/useUserProfile'


const PFP = ({ address, size }) => (
  <Jazzicon diameter={size} seed={jsNumberForAddress(address || '')} />
)

export const UserRectangleAvatar = ({ account, size = 80 }) => {
  const { ensAvatar } = useUserProfile(account, false)
  const [ ensAvatarError, setEnsAvatarError] = useState(false)

  const handleEnsAvatarError = () => setEnsAvatarError(true)

  if (!ensAvatar || ensAvatarError)
    return <PFP address={account} size={size} />

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ensAvatar} alt="Member avatar" className={`rounded-lg h-[80px] w-[80px]`} onError={handleEnsAvatarError} />
}

export const UserAvatar = ({ account, size = 40 }) => {
  const { ensAvatar } = useUserProfile(account, false)
  const [ ensAvatarError, setEnsAvatarError] = useState(false)

  const handleEnsAvatarError = () => setEnsAvatarError(true)

  if (!ensAvatar || ensAvatarError)
    return <PFP address={account} size={size} />

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ensAvatar} alt="Member avatar" className={`rounded-full h-${size / 4} w-${size / 4}`} onError={handleEnsAvatarError} />
}

export const UserName = ({ account }) => {
  const { displayName, displayNameVerified } = useUserProfile(account)

  if (displayNameVerified)
    return <span className="flex gap-1 items-center">{displayName}<CheckCircleIcon className="h-4 w-4 text-daonative-white" /></span>
  return <>{displayName}</>
}

export default PFP