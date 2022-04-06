import axios from "axios";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useWallet } from "use-wallet";
import { CollectionNotFound } from ".";
import { PrimaryButton } from "../../../../components/Button";
import { SwitchToMainnetButton, SwitchToPolygonButton, SwitchToRinkebyButton } from "../../../../components/ChainWarning";
import ConnectWalletButton from "../../../../components/ConnectWalletButton";
import { collectionAbi } from "../../../../lib/abi";
import useProvider from "../../../../lib/useProvider";
import { ImagePreview } from "../../create";
import { getReadonlyProvider } from "../../../../lib/chainSupport";
import { NextSeo } from "next-seo";

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
  const [collectionMaxSupply, setCollectionMaxSupply] = useState(null)
  const [collectionTotalSupply, setCollectionTotalSupply] = useState(null)

  // Invite
  const [isValidInvite, setIsValidInvite] = useState(true)

  const { push: routerPush, query: { chainId, collectionAddress, inviteCode, inviteMaxUse, inviteSig } } = useRouter()
  const { account, chainId: injectedChainId } = useWallet()
  const injectedProvider = useProvider()
  const isMainnetNFT = Number(chainId) === 1
  const isPolygonNFT = Number(chainId) === 137
  const isRinkebyNFT = Number(chainId) === 4
  const isCorrectChain = Number(chainId) === injectedChainId

  const canStillMint = (
    collectionMaxSupply !== null &&
    collectionTotalSupply !== null &&
    (collectionMaxSupply === 0 || collectionMaxSupply > collectionTotalSupply)
  )

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
      let message = e?.data?.message || e?.error?.message || e.message

      if (message === 'execution reverted: Max supply exceeded')
        message = "This collection has reached its max supply. You cannot mint any NFTs anymore."

      if (message === 'execution reverted: Recipient already has a token')
        message = "You already have an NFT from this collection. You can't have more than one NFT of this collection per wallet."

      toast.error(message)
    }
  }

  useEffect(() => {
    const readonlyProvider = getReadonlyProvider(Number(chainId))

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

    const retrieveCollectionSupply = async (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      const totalSupply = await contract.totalSupply()
      const maxSupply = await contract.maxSupply()
      //const supply = [totalSupply.toNumber(), maxSupply.toNumber()]
      setCollectionMaxSupply(maxSupply.toNumber())
      setCollectionTotalSupply(totalSupply.toNumber())
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
          retrieveCollectionSupply(collectionAddress)
        ])
      } catch (e) {
        console.log(e)
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
      <div className="flex flex-col gap-6 w-full ">
        {!collectionHasError && !account && (
          <ConnectWalletButton >
            <PrimaryButton >
              Connect your wallet
            </PrimaryButton>
          </ConnectWalletButton>
        )}
        {!collectionHasError && isValidInvite && account && collectionMaxSupply != null && !canStillMint && (
          <>
            <p className="text-center">This NFT has reached {"it's"} max supply.</p>
            <p className="text-center">Minting is not possible anymore.</p>
          </>
        )}
        {!collectionHasError && isValidInvite && account && collectionMaxSupply != null && canStillMint && (
          <div className="flex flex-col items-center gap-4">
            {isCorrectChain && (
              <PrimaryButton onClick={handleMintNFT}>Mint your NFT</PrimaryButton>
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
            {!isCorrectChain && isRinkebyNFT && (
              <>
                <span>Switch to Ethereum Rikeby (testnet) to mint your NFT</span>
                <SwitchToRinkebyButton />
              </>
            )}
          </div>
        )}

        <div>
          <div className="text-xs text-daonative-primary-purple h-12 flex justify-between items-center font-bold">
            <div>
              {collectionName || "DAOnative Core"}
            </div>
            {!!collectionTotalSupply && !!collectionMaxSupply && (
              <div>
                {collectionTotalSupply} / {collectionMaxSupply}
              </div>
            )}
          </div>
          <div className="flex shadow-daonative justify-center border border-daonative-border  rounded-lg w-96 min-h-[18em] overflow-hidden p-6">
            <ImagePreview uri={collectionImageURI} />
          </div>
        </div>


        {!collectionHasError && !isValidInvite && (
          <InvalidInviteCode />
        )}

        {collectionHasError && (
          <CollectionNotFound />
        )}
      </div>
    </div>
  )
}

const MintPage = (props) => {
  const url = 'https://app.daonative.xyz'
  return (
    <>
      <NextSeo
        title="DAONative | Mint your NFT"
        description=""
        canonical={url}
        openGraph={{
          url: url,
          title: `Mint your ${props.collectionName} NFT`,
          description: '',
          images: [
            { url: props.collectionImageURI },
          ],
          site_name: 'DAOnative',
        }}
        twitter={{
          handle: '@daonative',
          cardType: 'summary',
        }}
      />
      <div>
        <div className="overflow-hidden w-full h-screen">
          <main className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-space text-daonative-white pb-2 mb-4 ">{"You've been invited to mint an NFT"}</h1>
              < Mint {...props} />
            </div>
          </main>
        </div>
      </div>
    </>

  )
}

export default MintPage