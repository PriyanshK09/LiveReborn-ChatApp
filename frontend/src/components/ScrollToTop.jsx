import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // For the chat page, don't do any scrolling behavior
    if (pathname === "/chat") {
      return;
    }

    // For all other routes, scroll to top immediately
    // Using scrollTo with {top: 0} to ensure we're at the very top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use instant instead of smooth to avoid potential conflicts
    });
  }, [pathname])

  return null
}

export default ScrollToTop
