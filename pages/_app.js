import '../styles/globals.css'

import { UseWalletProvider } from 'use-wallet'
import { Toaster } from 'react-hot-toast'
import { initializeApp} from 'firebase/app'
import Head from 'next/head';
import { ConnectWalletModalProvider } from '../components/ConnectWalletModal';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

initializeApp(firebaseConfig)

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>DAOnative</title>
      </Head>
      <UseWalletProvider
        autoConnect={true}
        chainId={137}
        connectors={{
          walletconnect: {
            bridge: 'https://bridge.walletconnect.org',
            rpc: {
              1: process.env.NEXT_PUBLIC_RPC_MAINNET,
              4: process.env.NEXT_PUBLIC_RPC_RINKEBY,
              137: process.env.NEXT_PUBLIC_RPC_POLYGON
            }
          }
        }}
      >
        <ConnectWalletModalProvider>
          <Toaster position="bottom-center" />
          <Component {...pageProps} />
        </ConnectWalletModalProvider>
      </UseWalletProvider>
    </>
  )
}

export default MyApp