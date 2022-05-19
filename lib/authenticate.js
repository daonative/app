import { getAuth, setPersistence, signInWithCustomToken, inMemoryPersistence } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import axios from 'axios'
import { useWallet } from '@/lib/useWallet'
import { useAuthState } from 'react-firebase-hooks/auth'
import toast from 'react-hot-toast'
import { useSigner } from 'wagmi'
import { useCallback, useEffect, useState } from 'react'

const getNonce = async (account) => {
  const result = await axios.post('/api/user-nonce', { account })
  const { nonce } = result.data
  return nonce
}


const authenticate = async (account, signer) => {
  const nonce = await getNonce(account)
  const message = `${account} ${nonce}`

  const signature = await signer.signMessage(message)
  const result = await axios.post('/api/authenticate', { account, signature })
  const { firebaseToken } = result.data

  const auth = getAuth()
  await setPersistence(auth, inMemoryPersistence)
  await signInWithCustomToken(auth, firebaseToken)
  return firebaseToken
}

export const useRequireAccess = (roomId) => {
  const { account } = useWallet()
  const [hasToken, setHasToken] = useState(null)
  const [isMember, setIsMember] = useState(null)
  const [roles, setRoles] = useState([])
  const hasAccess = hasToken || isMember

  useEffect(() => {
    const retrieveHasToken = async () => {
      try {
        const response = await axios.post('/api/tokengating/has-access', { roomId, account })
        const hasToken = response.data.hasAccess
        setHasToken(hasToken)
      } catch (_) {
        setHasToken(false)
      }
    }

    const retrieveIsMember = async () => {
      const db = getFirestore()
      const membershipDoc = await getDoc(doc(db, 'rooms', roomId, 'members', account))
      setIsMember(membershipDoc.exists())

      if (!membershipDoc.exists()) return
      setRoles(membershipDoc.data()?.roles || [])
    }

    if (!account || !roomId) return

    setHasToken(null)
    setIsMember(null)
    setRoles([])
    retrieveHasToken()
    retrieveIsMember()
  }, [account, roomId])

  const requireAccess = useCallback(() => async () => {
    if (isMember) return
    if (!hasToken) throw Error('User is not a member and not eligible to become a member')

    try {
      await axios.post('/api/tokengating/join', { roomId, account })
      setIsMember(true)
    } catch (e) {
      throw Error('User is not a member and not eligible to become a member')
    }
  }, [isMember, hasToken, roomId, account])

  return { requireAccess, roles, hasAccess, hasToken, isMember }
}

export const useRequireAuthentication = () => {
  const auth = getAuth()
  const { account } = useWallet()
  const [user] = useAuthState(auth)
  const { data: signer } = useSigner()

  const requireAuthentication = async () => {
    if (user?.uid === account) return await user.getIdToken()

    const toastId = toast.loading('Please check your wallet and sign the message to continue')

    try {
      await authenticate(account, signer)
      const tokenId = await auth.currentUser.getIdToken()
      toast.remove(toastId)
      return tokenId
    } catch (error) {
      toast.error('Unable to sign message', { id: toastId })
      return null
    }
  }

  return requireAuthentication
}

export default authenticate