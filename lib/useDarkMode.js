import { useEffect } from "react"

const useDarkMode = () => {
  useEffect(() =>
    document.documentElement.classList.add('dark')
  , [])
}

export default useDarkMode