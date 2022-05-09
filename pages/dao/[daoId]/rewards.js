import { Card } from "@/components/Card"
import { Input, TextField } from "@/components/Input"
import { LayoutWrapper } from "@/components/LayoutWrapper"
import { Modal, ModalActionFooter, ModalBody, ModalTitle } from "@/components/Modal"
import useMembership from "@/lib/useMembership"
import useRoomId from "@/lib/useRoomId"
import { CheckIcon } from "@heroicons/react/solid"
import Image from "next/image"
import { useWallet } from "@/lib/useWallet"
import { PrimaryButton } from "@/components/Button"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRequireAuthentication } from "@/lib/authenticate"
import { addDoc, collection, getFirestore, query, where } from "firebase/firestore"
import { useCollectionData } from "react-firebase-hooks/firestore"
import { classNames } from "@/lib/utils"

const RewardModal = ({ show, onClose }) => {
  const { handleSubmit, register, formState: { errors } } = useForm()
  const requireAuthentication = useRequireAuthentication()
  const roomId = useRoomId()

  const createRolesReward = async (name, role, xps) => {
    const db = getFirestore()
    await addDoc(collection(db, 'rewards'), {
      roomId,
      name,
      reward: {
        type: 'role',
        role: role
      },
      conditionTypes: ['minXps'],
      conditions: { 'minXps': xps }
    })
  }

  const handleCreateReward = async (data) => {
    await requireAuthentication()
    await createRolesReward(data.name, data.role, data.xps)
    onClose()
  }

  return (
    <Modal show={show} onClose={onClose}>
      <ModalTitle>Create reward</ModalTitle>
      <form onSubmit={handleSubmit(handleCreateReward)}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div>
              <TextField label="Name" name="name" register={register} required />
              {errors.name && (
                <span className="text-xs text-red-400">You need to set a reward name</span>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium pb-2"
              >
                Type
              </label>
              <select
                {...register("type")}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300"
              >
                <option value="role">Role</option>
                <option value="nft" disabled>NFT</option>
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium pb-2"
              >
                Reward with role
              </label>
              <select
                {...register("role")}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-gray-300"
              >
                <option value="verifier">Verifier</option>
                <option value="lurker">Lurker</option>
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium pb-2"
              >
                Active condition
              </label>
              <span className="text-sm text-daonative-subtitle">💡 This role will be given automatically to members that fit the following criteria</span>
              <label className="block text-sm font-medium pb-2">At least</label>
              <div className="relative rounded-md shadow-sm" style={{ maxWidth: '100px' }}>
                <Input register={register} name="xps" required placeholder="100" />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">
                    XPs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalActionFooter>
          <PrimaryButton type="submit">Create Reward</PrimaryButton>
        </ModalActionFooter>
      </form>
    </Modal>
  )
}

const RewardItem = ({ title, type, weight, eligibleCount }) =>
  <Card onClick={() => null}>
    <div className="flex justify-between">
      <div className="flex gap-3">
        <div>
          <Image width="64" height="64" src="/reward.svg" alt="sample-challenge-picture" />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold  whitespace-normal ">{title}</p>
          <div className="text-sm text-daonative-subtitle">
            {type}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end min-w-max gap-3">
        <div className={classNames(
          "flex items-center text-sm text-daonative-gray-300",
          !eligibleCount && "invisible"
        )}>
          <CheckIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-daonative-primary-blue" />
          <p>
            {eligibleCount} Members Eligible
          </p>
        </div>
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {weight} XPs
          </span>
        </div>
      </div>
    </div>
  </Card >

const Rewards = () => {
  const db = getFirestore()
  const { account } = useWallet()
  const roomId = useRoomId()
  const membership = useMembership(account, roomId)
  const isAdmin = membership?.roles?.includes('admin')
  const [rewardModalOpen, setRewardModalOpen] = useState(false)
  const [rewards, loading] = useCollectionData(query(collection(db, 'rewards'), where('roomId', '==', roomId || '')))

  const handleShowRewardModal = () => setRewardModalOpen(true)
  const handleCloseRewardModal = () => setRewardModalOpen(false)

  return (
    <LayoutWrapper>
      <RewardModal show={rewardModalOpen} onClose={handleCloseRewardModal} />
      <div className="mx-auto px-4 sm:px-6 md:px-8 max-w-4xl">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Rewards</h2>
            {isAdmin && <PrimaryButton onClick={handleShowRewardModal}>Add a reward</PrimaryButton>}
          </div>
          <ul role="list" className="flex flex-col gap-3">
            {rewards?.map((reward, index) => <RewardItem key={index} title={reward.name} type="Role" weight={reward?.conditions?.minXps} />)}
          </ul>
        </div>
      </div>
    </LayoutWrapper >
  )
}

export default Rewards