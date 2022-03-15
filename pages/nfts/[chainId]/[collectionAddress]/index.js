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
import { useConnectWalletModal } from '../../../../components/ConnectWalletModal'
import Spinner from '../../../../components/Spinner'
import axios from 'axios'
import ShortAddress from '../../../../components/ShortAddress'
import { LayoutWrapper } from '../../../../components/LayoutWrapper'
import { useForm } from 'react-hook-form'
import { getUserRooms } from '../../../../lib/useMembership'
import { useRequireAuthentication } from '../../../../lib/authenticate'
import { classNames } from '../../../../lib/utils'

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
        <div className="peer-checked:bg-daonative-dark-100 bg-daonative-dark-200 hover:cursor-pointer hover:bg-daonative-dark-200 hover:bg-opacity-50 px-2 py-1.5 rounded-md">
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
                <input type="checkbox" {...register("admin")} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md bg-daonative-dark-100 border-transparent text-daonative-gray-300" id="admin-roles" />
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
                {rooms.length > 0 && <div className="flex-grow border-t border-daonative-dark-100 my-2"></div>}
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

const MintModal = ({ show, onClose, chainId, collectionAddress, inviteCode, inviteMaxUse, inviteSig }) => {
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
      onClose()
    } catch (e) {
      console.log(e)
      toast.error("Failed to mint your NFT", { id: toastId })
      const message = e?.data?.message || e.message
      toast.error(message)
    }
  }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Invitation to mint</ModalTitle>
      <ModalBody>
        <div className="flex flex-col gap-4 items-center p-8">
          {account && isCorrectChain && (
            <SecondaryButton onClick={handleMintNFT}>Mint your NFT</SecondaryButton>
          )}
          {account && !isCorrectChain && (
            <>
              {isPolygonNFT && (
                <>
                  <span>This is a Polygon NFT</span>
                  <SwitchToPolygonButton />
                </>
              )}
              {isMainnetNFT && (
                <>
                  <span>This is a Ethereum mainnet NFT</span>
                  <SwitchToMainnetButton />
                </>
              )}
            </>
          )}
        </div>
      </ModalBody>
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
            {date.getFullYear()}-{date.getMonth()}-{date.getDay()}
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


const EmptyTokenList = ({ onInviteToMint, canInvite }) => (
  <div className="w-full p-8 text-center flex flex-col items-center">
    <h3 className="mt-2 text-lg font-medium text-daonative-white">{"No NFTs have been minted in this collection"}</h3>
    {canInvite && (
      <>
        <p className="mt-1 text-sm text-daonative-subtitle mb-6">Create an invitation link and mint your first NFT</p>
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

const CollectionTitle = ({ children }) => {
  return <h2 className="text-2xl text-daonative-white">{children}</h2>
}

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
  const [showMintModal, setShowMintModal] = useState(false)
  const [inviteLink, setInviteLink] = useState("")

  const { replace: routerReplace, query: { chainId, collectionAddress, inviteCode, inviteMaxUse, inviteSig } } = useRouter()
  const { account } = useWallet()
  const { openConnectWalletModal } = useConnectWalletModal()
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

  const handleOpenMintModal = () => setShowMintModal(true)
  const handleCloseMintModal = () => {
    // clear url query params
    routerReplace(`/nfts/${chainId}/${collectionAddress}`, undefined, { shallow: true });
    setShowMintModal(false)
  }

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

  useEffect(() => {
    if (!inviteCode) return
    if (!inviteMaxUse) return
    if (!inviteSig) return
    if (account) {
      // Need to make sure the connect modal is closed
      setTimeout(handleOpenMintModal, 1000)
    } else {
      openConnectWalletModal()
    }
  }, [inviteCode, inviteMaxUse, inviteSig, account, openConnectWalletModal])

  return (
    <div className="flex justify-center px-8 lg:px-0 ">
      <LinkDAOModal show={showLinkDAOModal} onClose={handleCloseLinkDAOModal} chainId={chainId} collectionAddress={collectionAddress} />
      <MintModal show={showMintModal} onClose={handleCloseMintModal} chainId={chainId} collectionAddress={collectionAddress} inviteCode={inviteCode} inviteMaxUse={inviteMaxUse} inviteSig={inviteSig} />
      <InviteModal show={showInviteModal} onClose={handleCloseInviteModal} inviteLink={inviteLink} />
      <div className="flex flex-col gap-8 w-full lg:w-3/4">
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center gap-3">
            <span className="inline-block relative h-12 w-12">
              {!collectionHasError && !collectionImageURI && <Spinner className='absolute top-0' />}
              {!collectionHasError && collectionImageURI && (
                <>
                  <img className="h-12 w-12 rounded-md" src={collectionImageURI} alt="" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-green-400" />
                </>
              )}
            </span>

            <CollectionTitle>
              {collectionName}
            </CollectionTitle>
          </div>

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
        {!collectionHasError && !isLoading && collectionTokens.length === 0 && (
          <EmptyTokenList onInviteToMint={handleOpenInviteModal} canInvite={isOwner} />
        )}
        {!collectionHasError && isLoading && (
          <div className="flex w-full justify-center">
            <div className="w-8 h-8">
              <Spinner />
            </div>
          </div>
        )}
        {collectionHasError && (
          <CollectionNotFound />
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