import '../styles/globals.css'

import { UseWalletProvider } from 'use-wallet'
import { Toaster } from 'react-hot-toast'
import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import Head from 'next/head';
import { ConnectWalletModalProvider } from '../components/ConnectWalletModal';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: "1:208459706334:web:1138476679353f3ba5b74f",
  measurementId: "G-BJ2Y4Y62SY"
}

if (!getApps().length) {
  const app = initializeApp(firebaseConfig)
  getAnalytics(app);
}


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