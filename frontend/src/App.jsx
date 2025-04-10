"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import AboutSection from "./components/AboutSection"
import CTASection from "./components/CTASection"
import Footer from "./components/Footer"
import LoginPage from "./components/LoginPage"
import ProfilePage from "./components/ProfilePage"
import ScrollToTop from "./components/ScrollToTop"
import FAQPage from './pages/FAQPage';
import ChatPage from "./pages/ChatPage"
import "./styles/App.css"
import AOS from "aos"
import "aos/dist/aos.css"

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Initialize AOS (Animate on Scroll) and scroll handling
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    })
    
    // Disable browser's auto scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Handle initial page load
    window.scrollTo(0, 0);
    
    // Handle page refresh
    window.addEventListener('beforeunload', () => {
      window.scrollTo(0, 0);
    });
    
    return () => {
      window.removeEventListener('beforeunload', () => {
        window.scrollTo(0, 0);
      });
    }
  }, [])

  // Handle click outside mobile menu
  useEffect(() => {
    const mobileButton = document.querySelector(".header-menu-toggle")
    
    function handleClickOutside(event) {
      if (
        menuOpen &&
        !event.target.closest(".header-nav") &&
        mobileButton &&
        !mobileButton.contains(event.target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [menuOpen])

  return (
    <Router>
      <div className="app-container">
        <ScrollToTop />
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <FeaturesSection data-aos="fade-up" />
                <AboutSection data-aos="fade-up" />
                <CTASection data-aos="zoom-in" />
              </>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App

