import '../styles/globals.css'

import { UseWalletProvider } from 'use-wallet'
import { Toaster } from 'react-hot-toast'

function MyApp({ Component, pageProps }) {
  return (
    <UseWalletProvider chainId={137}>
      <Toaster />
      <Component {...pageProps} />
    </UseWalletProvider>
  )
}

export default MyApp
