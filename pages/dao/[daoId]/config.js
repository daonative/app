import { LayoutWrapper } from "../../../components/LayoutWrapper";
import useRoomId from "../../../lib/useRoomId";

const RoomConfig = () => {
  const roomId = useRoomId()

  return (
    <LayoutWrapper>
      <div className="mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <h2 className="text-2xl">Config</h2>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}

export default RoomConfig