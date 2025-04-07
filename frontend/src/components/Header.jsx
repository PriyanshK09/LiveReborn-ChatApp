import { Menu, X } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import "../styles/Header.css"

function Header({ scrolled, menuOpen, setMenuOpen }) {
  const location = useLocation()

  const handleNavigation = (event, targetId) => {
    event.preventDefault()
    const targetElement = document.querySelector(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" })
      setMenuOpen(false)
    }
  }

  const handleLogoClick = (event) => {
    if (location.pathname !== "/") {
      setMenuOpen(false)
    } else {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="header-container">
        <Link to="/" className="header-logo" onClick={handleLogoClick}>
          <img src="/images/lpu-logo.png" alt="LPU Live" />
          <span>LPU Live</span>
        </Link>
        <div className={`header-nav ${menuOpen ? "header-nav-open" : ""}`}>
          <nav>
            <a href="#features" onClick={(e) => handleNavigation(e, "#features")}>Features</a>
            <a href="#about" onClick={(e) => handleNavigation(e, "#about")}>About</a>
          </nav>
          <Link to="/login">
            <button className="login-button">Log in</button>
          </Link>
        </div>
        <button 
          className="header-menu-toggle" 
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuOpen && <div className="header-backdrop" onClick={() => setMenuOpen(false)} />}
    </header>
  )
}

export default Header
