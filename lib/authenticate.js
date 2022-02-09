import { getAuth, setPersistence, signInWithCustomToken, inMemoryPersistence } from 'firebase/auth'
import axios from 'axios'

const getNonce = async (account) => {
  const result = await axios.post('/api/user-nonce', { account })
  const { nonce } = result.data
  return nonce
}


const authenticate = async (account, provider) => {
  const nonce = await getNonce(account)

  const message = `${account} ${nonce}`

  const signer = provider.getSigner(account)
  const signature = await signer.signMessage(message)
  const result = await axios.post('/api/authenticate', { account, signature })
  const { firebaseToken } = result.data

  const auth = getAuth()
  await setPersistence(auth, inMemoryPersistence)
  await signInWithCustomToken(auth, firebaseToken)
}

export default authenticate