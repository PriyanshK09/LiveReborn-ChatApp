import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Use instant scroll for immediate effect when route changes
    window.scrollTo(0, 0);
  }, [pathname])

  return null
}

export default ScrollToTop
