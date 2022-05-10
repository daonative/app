import { useRouter } from 'next/router'
import { useEffect } from 'react'

const DiscordConnect = () => {
  const router = useRouter()

  useEffect(() => {

    const connectDiscordGuild = async () => {
      const fragment = new URLSearchParams(window.location.hash.slice(1))
      const accessToken = fragment.get('access_token')
      const tokenType = fragment.get('token_type')
      const error = fragment.get('error')

      if (error) {
        window.opener.setDiscordError(error)
        window.close()
        return
      }

      if (!accessToken || !tokenType) {
        window.opener.setDiscordError("no_token")
        window.close()
        return
      }

      window.opener.setDiscordToken({accessToken, tokenType})
      window.close()
    }
    connectDiscordGuild()
  }, [])

  return (
    <div>
      
    </div>
  )
}

export default DiscordConnect