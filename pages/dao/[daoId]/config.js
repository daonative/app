import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "../../../components/Button";
import { LayoutWrapper } from "../../../components/LayoutWrapper";
import { useRequireAuthentication } from "../../../lib/authenticate";
import useRoomId from "../../../lib/useRoomId";

const DiscordWebhookForm = ({ roomId }) => {
  const { register, handleSubmit } = useForm()
  const requireAuthentication = useRequireAuthentication()

  const saveDiscordWebhook = async (webhookUrl) => {
    const db = getFirestore()
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, { discordNotificationWebhook: webhookUrl})
  }

  const handleSaveDiscordWebhook = async (data) => {
    await requireAuthentication()
    await saveDiscordWebhook(data.webhookUrl)
  }

  return (
    <form onSubmit={handleSubmit(handleSaveDiscordWebhook)}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="py-2">
            Enable Discord notifications for your community with Discord webhooks. DAOnative will post a message when:
            <ul className="list-disc list-inside">
              <li>A new challenge is available</li>
              <li>A member submitted a Proof of Work for a challenge</li>
              <li>A proof of work has been verified</li>
            </ul>
          </p>
          <p className="py-2">
            More about Discord webhooks <a href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks" className="underline" target="_blank" rel="noreferrer">here</a>.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium pb-2">
            Webhook URL
          </label>
          <input type="text" {...register("webhookUrl", { required: true })} placeholder="https://discord.com/api/webhooks/..." className="shadow-sm focus:ring-indigo-500 focus:border-daonative-border block w-full sm:text-sm border-gray-300 rounded-md bg-daonative-component-bg border-transparent text-daonative-white" />
        </div>
        <PrimaryButton type="submit">Save</PrimaryButton>
      </div>
    </form>
  )
}

const RoomConfig = () => {
  const roomId = useRoomId()
  const db = getFirestore()
  const [room] = useDocumentData(doc(db, 'rooms', roomId || 'x'))

  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 text-daonative-gray-200">{room?.name}</h1>
        </div>
      </div>
      <div className="mx-auto py-4 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl text-daonative-subtitle">Discord Notifications</h2>
          <DiscordWebhookForm roomId={roomId} />
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default RoomConfig