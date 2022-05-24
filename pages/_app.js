import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { Toaster } from "react-hot-toast";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import Head from "next/head";
import { ConnectWalletModalProvider } from "../components/ConnectWalletModal";
import { useEffect, useMemo } from "react";
import { ProfileModalProvider } from "../components/ProfileModal";
import { WagmiConfig, createClient, chain } from "wagmi";

import {
  apiProvider,
  configureChains,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

const EMULATORS_STARTED = "EMULATORS_STARTED";
function startEmulators() {
  if (global[EMULATORS_STARTED]) return;

  const auth = getAuth();
  const db = getFirestore();
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  global[EMULATORS_STARTED] = true;
}

if (process.env.NEXT_PUBLIC_EMULATOR === "true") {
  startEmulators();
}

const { chains, provider } = configureChains(
  [chain.mainnet, chain.rinkeby, chain.polygon, chain.optimism, chain.arbitrum],
  [apiProvider.infura(process.env.NEXT_PUBLIC_INFURA_API_KEY), apiProvider.fallback()],
);

const { connectors } = getDefaultWallets({
  appName: "DAOnative",
  chains,
});

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    getAnalytics();
  }, []);

  const wagmiClient = useMemo(
    () =>
      createClient({
        autoConnect: true,
        connectors,
        provider,
      }),
    [],
  );

  return (
    <>
      <Head>
        <title>DAOnative</title>
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ConnectWalletModalProvider>
            <ProfileModalProvider>
              <Toaster position="bottom-center" />
              <Component {...pageProps} />
            </ProfileModalProvider>
          </ConnectWalletModalProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;
