import { ethers, providers } from 'ethers'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { collectionAbi } from '../../../../lib/abi'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../../../components/Button'
import useProvider from '../../../../lib/useProvider'
import toast from 'react-hot-toast'
import { useWallet } from 'use-wallet'
import Spinner from '../../../../components/Spinner'
import axios from 'axios'
import ShortAddress from '../../../../components/ShortAddress'
import { LayoutWrapper } from '../../../../components/LayoutWrapper'
import { Card, SimpleCard, SimpleCardBody } from '../../../../components/Card'
import { useForm } from 'react-hook-form'
import { getUserRooms } from '../../../../lib/useMembership'
import { useRequireAuthentication } from '../../../../lib/authenticate'
import { classNames } from '../../../../lib/utils'
import { ClipboardCopyIcon } from '@heroicons/react/solid'
import { ImagePreview, OpenSeaPreview } from '../../create'
import Link from 'next/link'
import { getReadonlyProvider } from '../../../../lib/chainSupport'
import { collection, doc, getDocs, getFirestore, query, where } from 'firebase/firestore'

const CreateDAOModal = ({ show, onClose, chainId, collectionAddress }) => {
  const { handleSubmit, register, formState: { isSubmitting } } = useForm()
  const requireAuthentication = useRequireAuthentication()
  const { push } = useRouter()

  const createDAO = async (name) => {
    const tokenId = await requireAuthentication()
    const authHeaders = { headers: { 'Authorization': `Bearer ${tokenId}` } }
    const createResult = await axios.post('/api/create-dao', { name }, authHeaders)
    const { roomId } = createResult.data
    await axios.post('/api/import-from-nft', { chainId, collectionAddress, roomId }, authHeaders)
    return roomId
  }

  const handleCreateDAO = async (data) => {
    const roomId = await createDAO(data.name)
    await push(`/dao/${roomId}`)
  }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Create a DAO</ModalTitle>
      <form onSubmit={handleSubmit(handleCreateDAO)}>
        <ModalBody>
          <div className="flex flex-col gap-8">
            <p className="text-center text-sm text-daonative-gray-200">All NFT holders will be eligible to join the DAO.</p>
            <div>
              <label className="block font-bold pb-2 font-space">Name</label>
              <div className="flex gap-2 items-center">
                <input type="text" {...register("name", { required: true })} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300 w-full" />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <div className="flex gap-2">
            <PrimaryButton type="submit">
              {isSubmitting && (
                <span className="w-4 h-4 mr-2"><Spinner /></span>
              )}
              Create
            </PrimaryButton>
          </div>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const InviteModal = ({ show, onClose, inviteLink }) => {
  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteLink)
    toast.success('Copied invite link to clipboard', { icon: <ClipboardCopyIcon className="h-6 w-6 text-green" /> })
  }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Invite to mint</ModalTitle>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium pb-2">
              Share this link to give minting access (only share it people you want to mint)
            </label>
            <input
              type="text"
              value={inviteLink}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300"
              disabled
            />
          </div>
        </div>
      </ModalBody>
      <ModalActionFooter>
        <div className="flex gap-2">
          <SecondaryButton onClick={onClose}>
            Close
          </SecondaryButton>
          <PrimaryButton onClick={handleCopyToClipboard}>
            <ClipboardCopyIcon className="h-4 w-4 mr-1" />
            Copy to clipboard
          </PrimaryButton>
        </div>
      </ModalActionFooter>
    </Modal>
  )
}

const Token = ({ chainId, tokenAddress, tokenId, owner, metadataUri, timestamp }) => {
  const [metadata, setMetadata] = useState({})
  const date = new Date(timestamp * 1000)

  const getOpenSeaUrl = (chainId, tokenAddress, tokenId) => {
    if (chainId === 1) {
      return `https://opensea.io/assets/${tokenAddress}/${tokenId}`
    }

    if (chainId === 4) {
      return `https://testnets.opensea.io/assets/rinkeby/${tokenAddress}/${tokenId}`
    }

    if (chainId === 137) {
      return `https://opensea.io/assets/matic/${tokenAddress}/${tokenId}`
    }
  }

  useEffect(() => {
    const retrieveMetadata = async (uri) => {
      try {
        const response = await axios.get(uri)
        const metadata = response.data
        setMetadata(metadata)
      } catch (e) { console.error(e) }
    }

    retrieveMetadata(metadataUri)
  }, [metadataUri])

  return (
    <SimpleCard className="opacity-[80%] hover:opacity-100">
      <SimpleCardBody>
        <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
          #{String(tokenId + 1).padStart(3, '0')}
        </span >
        <a href={getOpenSeaUrl(Number(chainId), tokenAddress, tokenId)}>
          <img className="object-cover w-full py-2 min-h-[100px] w-[200px]" src={metadata.image} />
        </a >
        < div className="absolute w-full py-8 top-0 inset-x-0 leading-4 flex flex-col gap-4 items-center" >
          <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
            {/*date.getFullYear()}-{date.getMonth() + 1}-{date.getDate()*/}
          </span>
        </div >
        <div className="absolute w-full py-8 bottom-0 inset-x-0 leading-4 flex flex-col gap-4 items-center">
        </div>
        <div className='text-daonative-subtitle'>
          Minted
          <div>
            by <span className='text-daonative-white'><ShortAddress>{owner}</ShortAddress></span>
          </div>
        </div>
      </SimpleCardBody>
    </SimpleCard >
  )
}

const EmptyTokenList = ({ onInviteToMint, canInvite, children }) => (
  <div className="w-full text-center flex flex-col items-center">
    <h3 className="text-lg font-medium text-daonative-white">{"No NFTs have been minted in this collection"}</h3>
    {canInvite && (
      <>
        <p className="mt-1 text-sm text-daonative-subtitle my-6">Create an invitation and share it with people to mint!</p>
        <PrimaryButton onClick={onInviteToMint}>Create an invitation link</PrimaryButton>

        <Link href="/nfts/faq"><a className="underline text-sm mt-3">How does this work?</a></Link>
      </>
    )}
  </div>
)

export const CollectionNotFound = () => (
  <div className="w-full p-8 text-center flex flex-col items-center">
    <h3 className="mt-2 text-lg font-medium text-daonative-white">{"We couldn't find this NFT collection."}</h3>
  </div>
)

const TokenList = ({ address, tokens }) => (
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
    {tokens?.map((token) => (
      <Token key={token.tokenId} {...token} tokenAddress={address} />
    ))}
  </div>
)

const PauseUnpauseButton = ({ className, address, isPaused, setIsPaused }) => {
  const [isPausingOrUnpausing, setIsPausingOrUnpausing] = useState(false)
  const injectedProvider = useProvider()

  const handlePauseCollection = async () => {
    setIsPausingOrUnpausing(true)
    const toastId = toast.loading("Pausing the collection")

    try {
      const signer = injectedProvider.getSigner()
      const contract = new ethers.Contract(address, collectionAbi, signer)
      const tx = await contract.pause()
      await tx.wait()
      setIsPaused(true)
      toast.success("Successfully paused the contract", { id: toastId })
    } catch (e) {
      console.log(e)
      const message = e?.data?.message || e.message
      toast.error("Failed to pause the collection", { id: toastId })
      toast.error(message, { id: toastId })
    }

    setIsPausingOrUnpausing(false)
  }

  const handleUnpauseCollection = async () => {
    setIsPausingOrUnpausing(true)
    const toastId = toast.loading("Unpausing the collection")

    try {
      const signer = injectedProvider.getSigner()
      const contract = new ethers.Contract(address, collectionAbi, signer)
      const tx = await contract.unpause()
      await tx.wait()
      setIsPaused(false)
      toast.success("Successfully unpaused the contract", { id: toastId })
    } catch (e) {
      console.log(e)
      const message = e?.data?.message || e.message
      toast.error("Failed to unpause the collection", { id: toastId })
      toast.error(message, { id: toastId })
    }

    setIsPausingOrUnpausing(false)
  }

  const ActionButton = ({ children, onClick, isLoading, className }) => (
    <SecondaryButton onClick={onClick} disabled={isLoading} className={className}>
      {isLoading && (
        <span className="w-4 h-4 mr-2"><Spinner /></span>
      )}
      {children}
    </SecondaryButton>
  )

  if (isPaused === true)
    return <ActionButton onClick={handleUnpauseCollection} isLoading={isPausingOrUnpausing} className={className}>Unpause collection</ActionButton>

  if (isPaused === false)
    return <ActionButton onClick={handlePauseCollection} isLoading={isPausingOrUnpausing} className={className}>Pause collection</ActionButton>

  return <></>
}

export const GatorCollection = () => {
  const [isLoading, setIsLoading] = useState(false)
  // Collection
  const [collectionName, setCollectionName] = useState("")
  const [collectionOwner, setCollectionOwner] = useState("")
  const [collectionTokens, setCollectionTokens] = useState([])
  const [collectionImageURI, setCollectionImageURI] = useState('')
  const [collectionPaused, setCollectionPaused] = useState(null)
  const [collectionHasError, setCollectionHasError] = useState(false)
  const [tokenGateCount, setTokenGateCount] = useState(0)
  // Modals
  const [showCreateDAOModal, setShowCreateDAOModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  const { query: { chainId, collectionAddress } } = useRouter()
  const { account } = useWallet()
  const injectedProvider = useProvider()

  const isOwner = collectionOwner === account

  const generateInviteCodes = async (inviteMaxUse) => {
    const signer = injectedProvider.getSigner()
    const inviteCode = (Math.random() + 1).toString(36).substring(2)
    const inviteHash = ethers.utils.solidityKeccak256(['string', 'uint'], [inviteCode, 0]);
    const inviteSig = await signer.signMessage(ethers.utils.arrayify(inviteHash))
    return { inviteCode, inviteMaxUse, inviteSig }
  }

  const handleOpenInviteModal = async () => {
    const toastId = toast.loading("Sign to create invite link")
    try {
      const { inviteCode, inviteMaxUse, inviteSig } = await generateInviteCodes(0)
      const inviteLink = `${window?.origin}/nfts/${chainId}/${collectionAddress}/mint?inviteCode=${inviteCode}&inviteMaxUse=${inviteMaxUse}&inviteSig=${inviteSig}`
      setInviteLink(inviteLink)
      setShowInviteModal(true)
      toast.success("Invite link generated", { id: toastId })
    } catch (e) {
      console.log(e)
      toast.error("Failed to generated link", { id: toastId })
    }
  }

  const handleCloseInviteModal = () => {
    setShowInviteModal(false)
    setInviteLink("")
  }

  const handleOpenCreateDAOModal = () => setShowCreateDAOModal(true)
  const handleCloseCreateDAOModal = () => setShowCreateDAOModal(false)

  useEffect(() => {
    const readonlyProvider = getReadonlyProvider(Number(chainId))

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

    const retrieveCollectionImageURI = async (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      const uri = await contract.collectionURI()
      const res = await axios.get(uri)
      setCollectionImageURI(res?.data?.image)
    }

    const retrieveCollectionPaused = async (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      const paused = await contract.paused()
      setCollectionPaused(paused)
    }

    const getTokenURI = async (address, tokenId) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      const uri = await contract.tokenURI(tokenId)
      return uri
    }

    const listenForNewCollectionTokens = async (address) => {
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      const mintFilter = contract.filters.Transfer(null)
      contract.on(mintFilter, async (_, to, tokenId, event) => {
        const token = {
          tokenId: tokenId?.toNumber(),
          owner: to,
          metadataUri: await getTokenURI(address, event.args?.tokenId.toNumber()),
          timestamp: (await readonlyProvider.getBlock(event.blockNumber)).timestamp,
          chainId
        }
        setCollectionTokens(tokens => [...tokens, token])
        setIsLoading(false)
      })
    }

    const retrieveCollectionTokens = async (address) => {
      setIsLoading(true)
      const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
      //const mintFilter = contract.filters.Transfer(null)
      //const mintEvents = await contract.queryFilter(mintFilter)
      const currentSupply = await contract.totalSupply()
      const tokenIds = [...Array(currentSupply.toNumber()).keys()]
      const tokens = await Promise.all(tokenIds.map(async tokenId => ({
        tokenId,
        owner: await contract.ownerOf(tokenId),
        metadataUri: await getTokenURI(address, tokenId),
        //timestamp: (await readonlyProvider.getBlock(event.blockNumber)).timestamp,
        chainId
      })))
      setCollectionTokens(tokens)
      setIsLoading(false)
      //listenForNewCollectionTokens(address)
    }

    const retrieveCollectionDAOs = async (collectionAddress) => {
      const db = getFirestore()
      const tokengates = await getDocs(
        query(
          collection(db, 'tokengates'),
          where('chainId', '==', Number(chainId)),
          where('tokenAddress', '==', collectionAddress)
        )
      )
      setTokenGateCount(tokengates.docs.length)
    }

    const retrieveCollectionData = async (collectionAddress) => {
      if (!ethers.utils.isAddress(collectionAddress)) {
        setCollectionHasError(true)
        return
      }

      try {
        await Promise.all([
          retrieveCollectionName(collectionAddress),
          retrieveCollectionTokens(collectionAddress),
          retrieveCollectionOwner(collectionAddress),
          retrieveCollectionImageURI(collectionAddress),
          retrieveCollectionPaused(collectionAddress),
          retrieveCollectionDAOs(collectionAddress)
        ])
      } catch (e) {
        console.log(e)
        setCollectionHasError(true)
      }
    }

    if (!chainId) return
    if (!collectionAddress) return

    retrieveCollectionData(collectionAddress)
  }, [collectionAddress, chainId])

  return (
    <div className="flex justify-center px-8 lg:px-0 ">
      <CreateDAOModal show={showCreateDAOModal} onClose={handleCloseCreateDAOModal} chainId={chainId} collectionAddress={collectionAddress} />
      <InviteModal show={showInviteModal} onClose={handleCloseInviteModal} inviteLink={inviteLink} />
      <div className="flex flex-col gap-8 w-full lg:w-3/4 items-center">
        <div className="flex justify-center items-center w-full max-w-2xl">
          {!isLoading && (
            <>
              <h2 className="text-2xl text-daonative-white">{collectionName} Collection</h2>
            </>
          )}
        </div>

        <div>
          <div className="flex shadow-daonative justify-center border border-daonative-border  rounded-lg w-64 h-[18em] overflow-hidden ">
            <ImagePreview uri={collectionImageURI} />
          </div>
        </div>


        <div className='flex justify-between w-full max-w-2xl'>
          <h2 className="text-2xl text-daonative-text font-bold">Owners</h2>
          <div>

            <div className={classNames(
              "flex gap-4",
              (!isOwner || isLoading) && "invisible"
            )}>
              <SecondaryButton className={(!isOwner || tokenGateCount > 0) && "invisible"} onClick={handleOpenCreateDAOModal}>Create a DAO</SecondaryButton>
              <PauseUnpauseButton className={!isOwner && "invisible"} isPaused={collectionPaused} setIsPaused={setCollectionPaused} address={collectionAddress} />
              {!collectionPaused && <PrimaryButton className={!isOwner && "invisible"} onClick={handleOpenInviteModal}>Invite to mint</PrimaryButton>}
            </div>
          </div>

        </div>
        <div className='w-full max-w-2xl'>
          {collectionTokens.length > 0 && (
            <div className="flex flex-wrap gap-4 ">
              <TokenList address={collectionAddress} tokens={collectionTokens} />
            </div>
          )}
        </div>

        {!collectionHasError && isLoading && (
          <div className="flex w-full justify-center">
            <div className="w-8 h-8">
              Loading
            </div>
          </div>
        )}

        {collectionHasError && (
          <CollectionNotFound />
        )}

        {!collectionHasError && !isLoading && collectionTokens.length === 0 && (
          <div className="flex gap-4">
            <EmptyTokenList onInviteToMint={handleOpenInviteModal} canInvite={isOwner} />
          </div>
        )}
      </div>
    </div >
  )
}

const CollectionPage = () => {
  return (
    <LayoutWrapper>
      <GatorCollection />
    </LayoutWrapper>
  )
}

export default CollectionPage;