import create from "zustand";
import { getReadonlyProvider } from './chainSupport';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useEffect } from 'react';

const ENSStore = create(
  () => ({ addressBook: {} }),
  { name: "ens-address-book" }
);

const updateAddressBookEntry = (address, entry) => {
  ENSStore.setState(({ addressBook }) => ({
    addressBook: {
      ...addressBook,
      [address]: {
        ...addressBook?.[address],
        ...entry
      }
    }
  }))
}

const useUserProfile = (address, fetch = true) => {
  const profile = ENSStore((state) => state?.addressBook?.[address])

  useEffect(() => {
    const loadENSProfile = async (address) => {
      updateAddressBookEntry(address, { ensNameLoading: true })

      const provider = getReadonlyProvider(1)
      const ensName = await provider.lookupAddress(address)
      updateAddressBookEntry(address, { ensName, ensNameLoading: false })

      if (!ensName) return

      const ensAvatar = await provider.getAvatar(ensName)
      updateAddressBookEntry(address, { ensAvatar })
    }

    const loadUserProfile = async (address) => {
      const db = getFirestore()
      const userRef = doc(db, 'users', address)
      const userSnap = await getDoc(userRef)
      const user = userSnap.data()
      updateAddressBookEntry(address, { userName: user?.name })
    }

    const loadProfile = async (address) => {
      console.log('loading', address)
      updateAddressBookEntry(address, { profileLoading: true })
      await Promise.all([
        loadENSProfile(address),
        loadUserProfile(address)
      ])
      updateAddressBookEntry(address, { profileLoading: false, lastUpdated: new Date().getTime() })
    }

    if (!fetch) return
    if (!address) return
    if (profile) return

    loadProfile(address)

  }, [address, profile, fetch])


  const shortAddress = (address, length = 6) => `${address.substring(0, (length / 2) + 2)}...${address.substring(address.length - length / 2)}`

  const getDisplayName = () => {
    if (!address) return ""
    if (profile?.ensNameLoading) return shortAddress(address)
    if (!profile?.ensNameLoading && profile?.ensName) return profile?.ensName
    if (!profile?.ensNameLoading && profile?.userName) return profile?.userName
    return shortAddress(address)
  }

  return { ...profile, displayName: getDisplayName(), displayNameVerified: !!profile?.ensName }
}

export default useUserProfile