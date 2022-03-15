import axios from "axios";
import { ethers, providers } from "ethers";
import Image from "next/image";
import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useWallet } from "use-wallet";
import { CollectionNotFound } from ".";
import { PrimaryButton, SecondaryButton } from "../../../../components/Button";
import { SwitchToMainnetButton, SwitchToPolygonButton } from "../../../../components/ChainWarning";
import ConnectWalletButton from "../../../../components/ConnectWalletButton";
import { LayoutWrapper } from "../../../../components/LayoutWrapper";
import Spinner from "../../../../components/Spinner";
import { collectionAbi } from "../../../../lib/abi";
import useProvider from "../../../../lib/useProvider";


const getReadonlyProvider = (chainId) => {
  if (Number(chainId) === 137)
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_POLYGON)

  return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET)
}

const CollectionHeader = ({ isLoading, imageUri, children }) => (
  <div className="flex justify-between items-center gap-3">
    <CollectionImage imageUri={imageUri} isLoading={isLoading} />
    <CollectionTitle>{children}</CollectionTitle>
  </div>
)

const CollectionTitle = ({ children }) => (
  <h2 className="text-2xl text-daonative-white">{children}</h2>
)

const CollectionImage = ({ imageUri, isLoading }) => (
  <span className="inline-block relative h-12 w-12">
    {isLoading && <Spinner className='absolute top-0' />}
    {!isLoading && imageUri && (
      <>
        <img className="h-12 w-12 rounded-md" src={imageUri} alt="" />
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-green-400" />
      </>
    )}
  </span>
)

const InvalidInviteCode = () => (
  <div className="w-full p-8 text-center flex flex-col items-center">
    <h3 className="mt-2 text-lg font-medium text-daonative-white">Invalid mint invite code.</h3>
  </div>
)

const Mint = () => {
  const [isLoading, setIsLoading] = useState(false)

  // Collection
  const [collectionName, setCollectionName] = useState("")
  const [collectionImageURI, setCollectionImageURI] = useState('')
  const [collectionHasError, setCollectionHasError] = useState(false)

  // Invite
  const [isValidInvite, setIsValidInvite] = useState(true)

  const { push: routerPush, query: { chainId, collectionAddress, inviteCode, inviteMaxUse, inviteSig } } = useRouter()
  const { account, chainId: injectedChainId } = useWallet()
  const injectedProvider = useProvider()
  const isMainnetNFT = Number(chainId) === 1
  const isPolygonNFT = Number(chainId) === 137
  const isCorrectChain = Number(chainId) === injectedChainId


  const mintNFT = async (collectionAddress, inviteCode, inviteMaxUse, inviteSig) => {
    const signer = injectedProvider.getSigner()
    const contract = new ethers.Contract(collectionAddress, collectionAbi, signer)
    return await contract.safeMint(inviteCode, inviteMaxUse, inviteSig)
  }

  const handleMintNFT = async () => {
    const toastId = toast.loading("Minting your NFT...")
    try {
      const tx = await mintNFT(collectionAddress, inviteCode, inviteMaxUse, inviteSig)
      await tx.wait()
      toast.success("Successfully minted your NFT", { id: toastId })
      routerPush(`/nfts/${chainId}/${collectionAddress}`)
    } catch (e) {
      console.log(e)
      toast.error("Failed to mint your NFT", { id: toastId })
      const message = e?.data?.message || e.message
      toast.error(message)
    }
  }

  useEffect(() => {
    const readonlyProvider = getReadonlyProvider(chainId)

    const retrieveCollectionName = async (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      const collectionName = await contract.name()
      setCollectionName(collectionName)
    }

    const retrieveCollectionImageURI = async (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      const uri = await contract.collectionURI()
      const res = await axios.get(uri)
      setCollectionImageURI(res?.data?.image)
    }

    const retrieveCollectionData = async (collectionAddress) => {
      if (!ethers.utils.isAddress(collectionAddress)) {
        setCollectionHasError(true)
        return
      }

      setIsLoading(true)
      try {
        await Promise.all([
          retrieveCollectionName(collectionAddress),
          retrieveCollectionImageURI(collectionAddress),
        ])
      } catch (e) {
        setCollectionHasError(true)
      }
      setIsLoading(false)
    }

    if (!chainId) return
    if (!collectionAddress) return

    retrieveCollectionData(collectionAddress)
  }, [collectionAddress, chainId])

  useEffect(() => {
    setIsValidInvite(inviteCode !== undefined && inviteMaxUse !== undefined && inviteSig !== undefined)
  }, [inviteCode, inviteMaxUse, inviteSig])

  return (
    <div className="flex justify-center px-8 lg:px-0">
      <div className="flex flex-col gap-8 w-full lg:w-3/4">
        <div className="flex justify-between items-center">
          {!collectionHasError && <CollectionHeader imageUri={collectionImageURI} isLoading={isLoading}>{collectionName}</CollectionHeader>}
        </div>

        {!collectionHasError && isValidInvite && account && (
          <div className="flex flex-col items-center gap-4">
            {isCorrectChain && (
              <SecondaryButton onClick={handleMintNFT}>Mint your NFT</SecondaryButton>
            )}
            {!isCorrectChain && isPolygonNFT && (
              <>
                <span>Switch to Polygon to mint your NFT</span>
                <SwitchToPolygonButton />
              </>
            )}
            {!isCorrectChain && isMainnetNFT && (
              <>
                <span>Switch to mainnet to mint your NFT</span>
                <SwitchToMainnetButton />
              </>
            )}
          </div>
        )}

        {!collectionHasError && !isValidInvite && (
          <InvalidInviteCode />
        )}

        {collectionHasError && (
          <CollectionNotFound />
        )}

        {!collectionHasError && !account && (
          <ConnectWalletButton >
            <PrimaryButton >
              Connect your wallet
            </PrimaryButton>
          </ConnectWalletButton>
        )}
      </div>
    </div>
  )
}

const MintPage = () => {
  return (
    <LayoutWrapper>
      <Mint />
    </LayoutWrapper>
  )
}

export default MintPage