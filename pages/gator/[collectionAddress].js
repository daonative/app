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

const MintModal = ({ show, onClose, collectionAddress, inviteCode, inviteSig }) => {
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
      //onClose()
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
          { account && isPolygon && (
            <SecondaryButton onClick={handleMintNFT}>Mint your NFT</SecondaryButton>
          )}
          { account && !isPolygon && (
            <PolygonWarning />
          )}
        </div>
      </ModalBody>
    </Modal>
  )
}

const TokenList = ({ tokens }) => {
  return (
    <ul role="list" className="flex flex-col gap-3">
      {
        tokens?.map((token, idx) => (
          <li key={idx}>
            <div className="px-4 py-4 sm:px-6 bg-daonative-dark-100 rounded flex justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-weight-600 font-space">
                  #{String(idx + 1).padStart(3, '0')}
                </span>
                <p className="text-sm font-medium text-daonative-gray-100">{idx}</p>
              </div>
              <div className="mt-2 sm:flex flex-col items-end gap-0.5">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 font-weight-600 font-space">
                  {idx}
                </span>
              </div>
            </div>
          </li>
        ))}
    </ul>)
}

const GatorCollection = () => {
  const [collectionName, setCollectionName] = useState("")
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

  const retrieveCollectionTokens = async (address) => {
    const contract = new ethers.Contract(address, collectionAbi, readonlyProvider)
    const mintFilter = contract.filters.Transfer(null)
    const mintEvents = await contract.queryFilter(mintFilter)
    setCollectionTokens(mintEvents)
    console.log(mintEvents)
  }

  const retrieveInviteCodes = async (message) => {
    const signer = injectedProvider.getSigner()
    const inviteHash = ethers.utils.solidityKeccak256(['string'], [message]);
    const inviteSig = await signer.signMessage(ethers.utils.arrayify(inviteHash))
    return { inviteCode: inviteHash, inviteSig }
  }

  const handleOpenInviteModal = async () => {
    const toastId = toast.loading("Sign to create invite link")
    try {
      const {inviteCode, inviteSig} = await retrieveInviteCodes(collectionAddress)
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

  useEffect(() => {
    if (!collectionAddress) return
    if (!ethers.utils.isAddress(collectionAddress)) return
    retrieveCollectionName(collectionAddress)
    retrieveCollectionTokens(collectionAddress)
  }, [collectionAddress])

  useEffect(() => {
    if(!inviteCode) return
    if(!inviteSig) return
    if (account) {
      handleShowMintModal()
    } else {
      openConnectWalletModal()
    }
  }, [inviteCode, inviteSig, account])

  return (
    <div>
      <MintModal show={showMintModal} onClose={handleCloseMintModal} collectionAddress={collectionAddress} inviteCode={inviteCode} inviteSig={inviteSig} />
      <InviteModal show={showInviteModal} onClose={handleCloseInviteModal} inviteLink={inviteLink} />
      <Header>
        {collectionName}
      </Header>
      <div className="flex flex-col gap-8 p-8">
        <div className="flex justify-end w-full">
          <PrimaryButton onClick={handleOpenInviteModal}>Invite to mint</PrimaryButton>
        </div>
        <TokenList tokens={collectionTokens} />
      </div>
    </div>
  )
}

export default GatorCollection;