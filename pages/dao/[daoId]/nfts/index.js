import { LayoutWrapper } from "../../../../components/LayoutWrapper";
import useRoomId from "../../../../lib/useRoomId";
import { Gator } from "../../../gator"; 

const NFTSPage = () => {
  const roomId = useRoomId()

  return (
    <LayoutWrapper>
      <Gator roomId={roomId}/>
    </LayoutWrapper>
  )
}

export default NFTSPage