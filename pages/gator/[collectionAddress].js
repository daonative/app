import { Header } from '.'
import { ethers, providers } from 'ethers'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { collectionAbi } from '../../lib/abi'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../components/Button'
import useProvider from '../../lib/useProvider'
import toast from 'react-hot-toast'
import { useWallet } from 'use-wallet'
import PolygonWarning from '../../components/PolygonWarning'
import { useConnectWalletModal } from '../../components/ConnectWalletModal'
import Spinner from '../../components/Spinner'
import { create as IPFSClient } from "ipfs-http-client"
 const ipfs = IPFSClient({
   url: "https://ipfs.infura.io:5001/api/v0",
 });

const InviteModal = ({ show, onClose, inviteLink }) => {
  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Invite to mint</ModalTitle>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium pb-2">
              Invite Link
            </label>
            <input
              type="text"
              value={inviteLink}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300"
              disabled
            />
          </div>
        </div>
      </ModalBody>
      <ModalActionFooter>
        <SecondaryButton onClick={onClose}>
          Close
        </SecondaryButton>
      </ModalActionFooter>
    </Modal>
  )
}

const MintModal = ({ show, onClose, collectionAddress, inviteCode, inviteSig, onSuccessfulMint = () => { } }) => {
  const { account, chainId } = useWallet()
  const injectedProvider = useProvider()
  const isPolygon = chainId === 137

  const mintNFT = async (collectionAddress, inviteCode, inviteSig) => {
    const signer = injectedProvider.getSigner()
    const contract = new ethers.Contract(collectionAddress, collectionAbi, signer)
    await contract.safeMint(inviteCode, inviteSig)
  }

  const handleMintNFT = async () => {
    const toastId = toast.loading("Minting your NFT...")
    try {
      await mintNFT(collectionAddress, inviteCode, inviteSig)
      onSuccessfulMint()
      toast.success("Successfully minted your NFT", { id: toastId })
    } catch (e) {
      console.log(e)
      toast.error("Failed to mint your NFT", { id: toastId })
    }
  }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Invitation to mint</ModalTitle>
      <ModalBody>
        <div className="flex flex-col gap-4 items-center p-8">
          {account && isPolygon && (
            <SecondaryButton onClick={handleMintNFT}>Mint your NFT</SecondaryButton>
          )}
          {account && !isPolygon && (
            <PolygonWarning />
          )}
        </div>
      </ModalBody>
    </Modal>
  )
}

const Token = ({ tokenId, owner, metadataUri }) => {
  const [metadata, setMetadata] = useState({})

  const retrieveMetadata = async (uri) => {
    const metadata = await ipfs.get(metadataUri)
    console.log(metadata)
    setMetadata(JSON.parse(metadata))

  }

  useEffect(() => {
    retrieveMetadata()
  }, [])

  return (
    <>{metadata.image}</>
  )
}

const TokenList = ({ tokens }) => {
  return (
    <ul role="list" className="flex flex-col gap-3">
      {
        tokens?.map((token) => {
          return (
            <li key={token.tokenId}>
              <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded flex justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
                    #{String(token.tokenId + 1).padStart(3, '0')}
                  </span>
                  <p className="text-sm font-medium text-daonative-gray-100">{token.owner}</p>
                </div>
              </div>
            </li>
          )
        })}
    </ul>)
}

const GatorCollection = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [collectionName, setCollectionName] = useState("")
  const [collectionOwner, setCollectionOwner] = useState("")
  const [collectionTokens, setCollectionTokens] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showMintModal, setShowMintModal] = useState(false)
  const [inviteLink, setInviteLink] = useState(null)
  const { replace: routerReplace, query: { collectionAddress, inviteCode, inviteSig } } = useRouter()
  const { account } = useWallet()
  const { openConnectWalletModal } = useConnectWalletModal()
  const injectedProvider = useProvider()
  const readonlyProvider = new providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_POLYGON
  )

  const retrieveCollectionName = async (address) => {
    const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
    const collectionName = await contract.name()
    setCollectionName(collectionName)
  }

  const retrieveCollectionOwner = async (address) => {
    const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
    const owner = await contract.owner()
    setCollectionOwner(owner)
  }

  const getTokenURI = async (address, tokenId) => {
    const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
    const uri = await contract.tokenURI(tokenId)
    return uri
  }

  const listenForNewCollectionTokens = async (address) => {
    const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
    contract.on('Transfer', async (from, to, tokenId) => {
      const token = {
        tokenId: tokenId.toNumber(),
        owner: to,
        metadataUri: await getTokenURI(address, tokenId.toNumber())
      }
      setCollectionTokens(tokens => [...tokens, token])
      setIsLoading(false)
    })
  }

  const retrieveCollectionTokens = async (address) => {
    setIsLoading(true)
    const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
    const mintFilter = contract.filters.Transfer(null)
    const mintEvents = await contract.queryFilter(mintFilter)
    const tokens = await Promise.all(mintEvents.map(async event => ({
      tokenId: event.args?.tokenId.toNumber(),
      owner: event.args?.to,
      metadataUri: await getTokenURI(address, event.args?.tokenId.toNumber())
    })))
    setCollectionTokens(tokens)
    setIsLoading(false)
    listenForNewCollectionTokens(address)
  }

  const generateInviteCodes = async (message) => {
    const signer = injectedProvider.getSigner()
    const inviteHash = ethers.utils.solidityKeccak256(['string'], [message]);
    const inviteSig = await signer.signMessage(ethers.utils.arrayify(inviteHash))
    return { inviteCode: inviteHash, inviteSig }
  }

  const handleOpenInviteModal = async () => {
    const toastId = toast.loading("Sign to create invite link")
    try {
      const { inviteCode, inviteSig } = await generateInviteCodes(collectionAddress)
      const inviteLink = `${window?.origin}/gator/${collectionAddress}?inviteCode=${inviteCode}&inviteSig=${inviteSig}`
      setInviteLink(inviteLink)
      setShowInviteModal(true)
      toast.success("Invite link generated", { id: toastId })
    } catch (e) {
      toast.error("Failed to generated link", { id: toastId })
    }
  }

  const handleCloseInviteModal = () => {
    setShowInviteModal(false)
    setInviteLink(null)
  }

  const handleShowMintModal = () => setShowMintModal(true)
  const handleCloseMintModal = () => {
    // clear url query params
    routerReplace(`/gator/${collectionAddress}`, undefined, { shallow: true });
    setShowMintModal(false)
  }
  const handleSuccessfulMint = () => {
    setIsLoading(true)
    handleCloseMintModal()
  }

  useEffect(() => {
    if (!collectionAddress) return
    if (!ethers.utils.isAddress(collectionAddress)) return
    retrieveCollectionName(collectionAddress)
    retrieveCollectionTokens(collectionAddress)
    retrieveCollectionOwner(collectionAddress)
  }, [collectionAddress])

  useEffect(() => {
    if (!inviteCode) return
    if (!inviteSig) return
    if (account) {
      // Need to make sure the connect modal is closed
      setTimeout(handleShowMintModal, 1000)
    } else {
      openConnectWalletModal()
    }
  }, [inviteCode, inviteSig, account])

  return (
    <div>
      <MintModal show={showMintModal} onClose={handleCloseMintModal} collectionAddress={collectionAddress} inviteCode={inviteCode} inviteSig={inviteSig} onSuccessfulMint={handleSuccessfulMint} />
      <InviteModal show={showInviteModal} onClose={handleCloseInviteModal} inviteLink={inviteLink} />
      <Header>
        {collectionName}
      </Header>
      <div className="flex flex-col gap-8 p-8">
        <div className="flex justify-end w-full">
          {collectionOwner === account && <PrimaryButton onClick={handleOpenInviteModal}>Invite to mint</PrimaryButton>}
        </div>
        <TokenList tokens={collectionTokens} />
        {isLoading && (
          <div className="flex w-full justify-center">
            <div className="w-8 h-8">
              <Spinner />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GatorCollection;