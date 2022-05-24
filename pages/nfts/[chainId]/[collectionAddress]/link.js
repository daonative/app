import axios from "axios"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useWallet } from "@/lib/useWallet"
import { PrimaryButton } from "../../../../components/Button"
import { useRequireAuthentication } from "../../../../lib/authenticate"
import { getUserRooms } from "../../../../lib/useMembership"

const LinkCollection = () => {
  const [rooms, setRooms] = useState([])
  const { account } = useWallet()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const { query: { chainId, collectionAddress } } = useRouter()
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
    const roles = admin ? ['admin'] : []
    try {
      const result = await axios.post('/api/link-nft', { tokenAddress: collectionAddress, roomId, roles, chainId }, { headers: { 'Authorization': `Bearer ${tokenId}` } })
      console.log(result.data)
    } catch (e) {
      console.error(e)
    }
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
    <form onSubmit={handleSubmit(handleLinkDAO)}>
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
          </ul>
          {errors.room && (
            <span className="text-xs text-red-400">You need to select a DAO</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <PrimaryButton type="submit">
          Link
        </PrimaryButton>
      </div>
    </form>
  )
}

export default LinkCollection