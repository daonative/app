import { doc, getDoc, getFirestore } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "use-wallet";
import { getReadonlyProvider } from "../lib/chainSupport";


const ProfileContext = createContext()

export const ProfileProvider = ({ children }) => {
  const [ensName, setEnsName] = useState(null);
  const [ensAvatar, setEnsAvatar] = useState(null)
  const [ensNameLoading, setEnsNameLoading] = useState(true)
  const [user, setUser] = useState({})
  const { account } = useWallet()

  const shortAddress = (address, length = 6) => `${address.substring(0, (length / 2) + 2)}...${address.substring(address.length - length / 2)}`
  const getDisplayName = () => {
    if (!account) return ""
    if (ensNameLoading) return shortAddress(account)
    if (!ensNameLoading && ensName) return ensName
    if (!ensNameLoading && user?.name) return user.name
    return shortAddress(account)
  }

  useEffect(() => {
    const resetValues = () => {
      setUser({})
      setEnsName(null)
      setEnsAvatar(null)
    }

    const retrieveUser = async () => {
      const db = getFirestore()
      const userRef = doc(db, 'users', account)
      const userSnap = await getDoc(userRef)
      const user = userSnap.data()
      setUser(user)
    }

    const retrieveEnsName = async () => {
      setEnsNameLoading(true)
      const provider = getReadonlyProvider(1)
      const ensName = await provider.lookupAddress(account)
      setEnsName(ensName)
      setEnsNameLoading(false)

      if (!ensName) return

      const ensAvatar = await provider.getAvatar(ensName)
      setEnsAvatar(ensAvatar)
    }

    resetValues()

    if (!account) return

    retrieveEnsName()
    retrieveUser()
  }, [account])

  const value = {
    displayName: getDisplayName(),
    displayNameVerified: !!ensName,
    avatar: ensAvatar,
    user
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  return useContext(ProfileContext);
}