import { ethers, providers } from 'ethers'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { collectionAbi } from '../../../../lib/abi'
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from '../../../../components/Modal'
import { PrimaryButton, SecondaryButton } from '../../../../components/Button'
import useProvider from '../../../../lib/useProvider'
import toast from 'react-hot-toast'
import { useWallet } from 'use-wallet'
import { SwitchToMainnetButton, SwitchToPolygonButton } from '../../../../components/ChainWarning'
import Spinner from '../../../../components/Spinner'
import axios from 'axios'
import ShortAddress from '../../../../components/ShortAddress'
import { LayoutWrapper } from '../../../../components/LayoutWrapper'
import { useForm } from 'react-hook-form'
import { getUserRooms } from '../../../../lib/useMembership'
import { useRequireAuthentication } from '../../../../lib/authenticate'
import { classNames } from '../../../../lib/utils'
import { ClipboardCopyIcon } from '@heroicons/react/solid'
import { OpenSeaPreview } from '../../create'
import Link from 'next/link'

const getReadonlyProvider = (chainId) => {
  if (Number(chainId) === 137)
    return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_POLYGON)

  return new providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_MAINNET)
}

const LinkDAOModal = ({ show, onClose, collectionAddress }) => {
  const [rooms, setRooms] = useState([])
  const { account } = useWallet()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const requireAuthentication = useRequireAuthentication()

  useEffect(() => {
    const retrieveMyRooms = async () => {
      setRooms([])
      const userRooms = await getUserRooms(account)
      const userAdminRooms = userRooms.filter(room => room?.membership?.roles?.includes('admin'))
      setRooms(userAdminRooms)
    }

    if (!account) return

    retrieveMyRooms()
  }, [account])

  const linkDAO = async (collectionAddress, roomId, admin) => {
    const tokenId = await requireAuthentication()
    const result = await axios.post('/api/link-nft', { collectionAddress, roomId, admin }, { headers: { 'Authorization': `Bearer ${tokenId}` } })
    console.log(result.data)
  }

  const handleLinkDAO = async (data) => {
    await linkDAO(collectionAddress, data.room, !!data.admin)
  }

  const RoomOption = ({ roomId, name }) => (
    <li className="w-full py-1">
      <label className="text-sm">
        <input className="sr-only peer" type="radio" value={roomId} {...register('room', { required: true })} />
        <div className="peer-checked:bg-daonative-component-bg bg-daonative-dark-200 hover:cursor-pointer hover:bg-daonative-dark-200 hover:bg-opacity-50 px-2 py-1.5 rounded-md">
          {name}
        </div>
      </label>
    </li>
  )

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Link a DAO</ModalTitle>
      <form onSubmit={handleSubmit(handleLinkDAO)}>
        <ModalBody>
          <div className="flex flex-col gap-8">
            <p className="text-center text-sm text-daonative-gray-200 pb-4">Make the NFT holders become a member of the DAO.</p>
            <div>
              <label className="block font-bold pb-2 font-space">
                Membership Roles
              </label>
              <div className="flex gap-2 items-center">
                <input type="checkbox" {...register("admin")} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300" id="admin-roles" />
                <label className="text-sm font-medium" htmlFor="admin-roles">
                  Admin
                </label>
              </div>
            </div>
            <div>
              <label className="block font-bold pb-2 font-space">
                DAO
              </label>
              <ul className="justify-center w-full">
                {rooms.map((room) => <RoomOption key={room.roomId} name={room.name} roomId={room.roomId} />)}
                {rooms.length > 0 && <div className="flex-grow border-t border-daonative-component-bg my-2"></div>}
                <RoomOption name="Create a new DAO" roomId="" />
              </ul>
              {errors.room && (
                <span className="text-xs text-red-400">You need to select a DAO</span>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <div className="flex gap-2">
            <SecondaryButton onClick={onClose}>
              Close
            </SecondaryButton>
            <PrimaryButton type="submit">
              Link
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
              Invite Link
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
  const openseaUrl = `https://opensea.io/assets/${Number(chainId) === 137 ? 'matic/' : ''}${tokenAddress}/${tokenId}`

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
    <a href={openseaUrl}>
      <div className="relative w-64 rounded-lg overflow-hidden">
        <img className="object-cover w-full" src={metadata.image} />
        <div className="absolute w-full py-8 top-0 inset-x-0 leading-4 flex flex-col gap-4 items-center">
          <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
            <ShortAddress>{owner}</ShortAddress>
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
            {date.getFullYear()}-{date.getMonth() + 1}-{date.getDate()}
          </span>
        </div>
        <div className="absolute w-full py-8 bottom-0 inset-x-0 leading-4 flex flex-col gap-4 items-center">
          <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
            #{String(tokenId + 1).padStart(3, '0')}
          </span>
        </div>
      </div>
    </a>
  )
}

const EmptyTokenList = ({ onInviteToMint, canInvite, children }) => (
  <div className="w-full text-center flex flex-col items-center">
    <h3 className="text-lg font-medium text-daonative-white">{"No NFTs have been minted in this collection"}</h3>
    {canInvite && (
      <>
        <p className="mt-1 text-sm text-daonative-subtitle my-6">Create an invitation and share it with people to mint!</p>
        <PrimaryButton onClick={onInviteToMint}>Create an invitation link</PrimaryButton>
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
  <>
    {tokens?.map((token) => (
      <Token key={token.tokenId} {...token} tokenAddress={address} />
    ))}
  </>
)

export const CollectionHeader = ({ isLoading, imageUri, children }) => (
  <div className="flex justify-between items-center gap-3">
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
  // Modals
  const [showLinkDAOModal, setShowLinkDAOModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  const { query: { chainId, collectionAddress } } = useRouter()
  const { account } = useWallet()
  const injectedProvider = useProvider()

  const isOwner = collectionOwner === account
  const isLrnt = account === '0xec55D3113fb2fb929bE6Ca6B328927D7EF32a719'

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

  const handleOpenCreateDAOModal = () => setShowLinkDAOModal(true)
  const handleCloseLinkDAOModal = () => setShowLinkDAOModal(false)

  useEffect(() => {
    const readonlyProvider = getReadonlyProvider(chainId)

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
      const mintFilter = contract.filters.Transfer(null)
      const mintEvents = await contract.queryFilter(mintFilter)
      const tokens = await Promise.all(mintEvents.map(async event => ({
        tokenId: event.args?.tokenId.toNumber(),
        owner: event.args?.to,
        metadataUri: await getTokenURI(address, event.args?.tokenId.toNumber()),
        timestamp: (await readonlyProvider.getBlock(event.blockNumber)).timestamp,
        chainId
      })))
      setCollectionTokens(tokens)
      setIsLoading(false)
      listenForNewCollectionTokens(address)
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
          retrieveCollectionPaused(collectionAddress)
        ])
      } catch (e) {
        setCollectionHasError(true)
      }
    }

    if (!chainId) return
    if (!collectionAddress) return

    retrieveCollectionData(collectionAddress)
  }, [collectionAddress, chainId])

  return (
    <div className="flex justify-center px-8 lg:px-0 ">
      <LinkDAOModal show={showLinkDAOModal} onClose={handleCloseLinkDAOModal} chainId={chainId} collectionAddress={collectionAddress} />
      <InviteModal show={showInviteModal} onClose={handleCloseInviteModal} inviteLink={inviteLink} />
      <div className="flex flex-col gap-8 w-full lg:w-3/4">
        <div className="flex justify-between items-center">
          <div className={classNames(
            "flex gap-4",
            (isLoading || collectionTokens.length === 0) && "invisible"
          )}>
            <SecondaryButton onClick={handleOpenCreateDAOModal} className={(!isOwner || !isLrnt) && "invisible"}>Link a DAO</SecondaryButton>
            <PauseUnpauseButton className={!isOwner && "invisible"} isPaused={collectionPaused} setIsPaused={setCollectionPaused} address={collectionAddress} />
            {!collectionPaused && <PrimaryButton className={!isOwner && "invisible"} onClick={handleOpenInviteModal}>Invite to mint</PrimaryButton>}
          </div>
        </div>
        {collectionTokens.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            <TokenList address={collectionAddress} tokens={collectionTokens} />
          </div>
        )}
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
            <EmptyTokenList onInviteToMint={handleOpenInviteModal} canInvite={isOwner} >
            </EmptyTokenList>
            <div>
              <div>Preview</div>
              <div className='text-daonative-subtitle text-xs'>This is what you can expect after when minting!</div>
              <Link href="/nfts/faq"><a className="underline text-sm">How does this work?</a></Link>
              <OpenSeaPreview collectionName={collectionName} metadata={{ image: collectionImageURI }} />
            </div>
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