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
  return (
    <>
      <Head>
        <title>DAOnative</title>
      </Head>
      <UseWalletProvider chainId={137}>
        <Toaster />
        <Component {...pageProps} />
      </UseWalletProvider>
    </>
  )
}

export default MyApp