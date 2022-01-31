import '../styles/globals.css'

import { UseWalletProvider } from 'use-wallet'
import { Toaster } from 'react-hot-toast'
import { initializeApp } from "firebase/app";
import Head from 'next/head';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

initializeApp(firebaseConfig)

function MyApp({ Component, pageProps }) {
  console.log(process.env.NEXT_PUBLIC_POLYGON_RPC)
  return (
    <>
      <Head>
        <title>DAOnative</title>
      </Head>
      <UseWalletProvider
        chainId={137}
        connectors={{
          walletconnect: {
            rpc: {
              1: 'https://mainnet.infura.io/v3/a0d8c94ba9a946daa5ee149e52fa5ff1',
              4: 'https://rinkeby.infura.io/v3/a0d8c94ba9a946daa5ee149e52fa5ff1',
              137: process.env.NEXT_PUBLIC_POLYGON_RPC
            }
          }
        }}
      >
        <Toaster />
        <Component {...pageProps} />
      </UseWalletProvider>
    </>
  )
}

export default MyApp