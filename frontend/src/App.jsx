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
import "./styles/App.css"
import AOS from "aos"
import "aos/dist/aos.css"

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo({ top: 0, behavior: "smooth" })

    // Initialize AOS for animations
    AOS.init({ duration: 1000, once: true })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  useEffect(() => {
    const handleClickOutside = (event) => {
      const navContainer = document.querySelector(".header-nav")
      const mobileButton = document.querySelector(".header-menu-toggle")

      if (
        menuOpen &&
        navContainer &&
        !navContainer.contains(event.target) &&
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
        <Header scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
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
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App

