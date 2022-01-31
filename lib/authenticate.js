import { getAuth, signInWithCustomToken } from 'firebase/auth'
import axios from 'axios'


const authenticate = async (walletAddress, provider) => {
  const signer = provider.getSigner(walletAddress)
  const message = "HELLO"
  const signature = await signer.signMessage(message)
  const result = await axios.post('/api/authenticate', { walletAddress, signature })
  const { firebaseToken } = result.data
  const auth = getAuth()
  await signInWithCustomToken(auth, firebaseToken)
}

export default authenticate