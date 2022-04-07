import { CheckCircleIcon } from '@heroicons/react/solid'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { useProfile } from './ENSProvider'

const PFP = ({ address, size }) => (
  <Jazzicon diameter={size} seed={jsNumberForAddress(address || '')} />
)

export const UserAvatar = ({ account, }) => {
  const {ensAvatar} = useProfile(account)

  if (!ensAvatar)
    return <PFP address={account} size={40} />

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ensAvatar} alt="Member avatar" className="rounded-full h-10 w-10" />
}

export const UserName = ({ account }) => {
  const {displayName, displayNameVerified} = useProfile(account)

  if (displayNameVerified)
    return <span className="flex gap-1 items-center">{displayName}<CheckCircleIcon className="h-4 w-4 text-daonative-white" /></span>
  return <>{displayName}</>
}

export default PFP