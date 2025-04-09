"use client"

import { Menu, X, ChevronDown, Bell } from "lucide-react"
import { useLocation } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import ScrollLink from "./ScrollLink"
import "../styles/Header.css"

function Header({ menuOpen, setMenuOpen }) {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem("user")) 
  const firstName = user?.name?.split(" ")[0]
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogoClick = (event) => {
    if (location.pathname !== "/") {
      setMenuOpen(false)
    } else {
      event.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    window.location.reload()
  }

  const handleDropdownClick = (callback) => {
    callback();
    setDropdownOpen(false);
  };

  const notifications = [
    { id: 1, text: "Professor Kumar mentioned you in CSE 101", time: "2m ago", unread: true },
    { id: 2, text: "New announcement in Campus Group", time: "1h ago", unread: true },
    { id: 3, text: "Your friend Raj sent you a message", time: "3h ago", unread: false }
  ]

  return (
    <header className="header">
      <div className="header-container">
        <ScrollLink to="/" className="header-logo">
          <div className="logo-image-container">
            <img src="/images/lpu-logo.png" alt="LPU Live" />
          </div>
          <span className="logo-text">LPU Live</span>
        </ScrollLink>

        <div className="header-actions">
          {user && (
            <div className="notification-container" ref={notificationRef}>
              <button 
                className={`notification-button ${notificationsOpen ? 'active' : ''}`}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <Bell size={20} />
                <span className="notification-badge">2</span>
              </button>
              
              <div className={`notification-dropdown ${notificationsOpen ? 'show' : ''}`}>
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-all">Mark all as read</button>
                </div>
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                      <div className="notification-content">
                        <p>{notification.text}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {notification.unread && <div className="unread-dot"></div>}
                    </div>
                  ))}
                </div>
                <div className="notification-footer">
                  <a href="#" className="view-all">View all notifications</a>
                </div>
              </div>
            </div>
          )}
          
          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className={`user-button ${dropdownOpen ? "active" : ""}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar">{firstName?.charAt(0) || "U"}</div>
                <span className="user-name">Hi, {firstName}</span>
                <ChevronDown size={16} className={`dropdown-icon ${dropdownOpen ? "open" : ""}`} />
              </button>

              <div className={`dropdown-menu ${dropdownOpen ? "dropdown-visible" : ""}`}>
                <div className="dropdown-header">
                  <div className="dropdown-avatar">{firstName?.charAt(0) || "U"}</div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-username">{user.name}</span>
                    <span className="dropdown-userrole">LPU Student</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-links">
                  <ScrollLink to="/profile" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                    <span className="dropdown-icon-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <span>Profile</span>
                  </ScrollLink>
                  <button className="dropdown-button" onClick={() => handleDropdownClick(handleLogout)}>
                    <span className="dropdown-icon-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    </span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ScrollLink to="/login" className="auth-button-container">
              <button className="login-button">Log in</button>
            </ScrollLink>
          )}
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
