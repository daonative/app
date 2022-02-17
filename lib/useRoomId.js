import { useRouter } from "next/router"

const useRoomId = () => {
  const { query: params } = useRouter()
  return params.daoId
}

export default useRoomId