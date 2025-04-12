import Badge from "./Badge"
import Button from "./Button"
import ChatHeroDemo from "./ChatHeroDemo"
import { ArrowRight } from "lucide-react"
import "../styles/HeroSection.css"

function HeroSection({ onGetStartedClick, isLoggedIn }) {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-shape shape-1"></div>
        <div className="hero-shape shape-2"></div>
        <div className="hero-shape shape-3"></div>
      </div>
      <div className="hero-content-wrapper">
        <div className="hero-content">
          <div className="logo-full-container">
            <img src="/images/lpu-full-logo.png" alt="LPU Full Logo" className="logo-full-image" />
          </div>
          <Badge className="hero-badge">Campus Connect</Badge>
          <h1 className="hero-title">
            Connect with the <span className="highlight">LPU community</span>
          </h1>
          <p className="hero-description">
            Experience seamless communication with our modern, secure, and feature-rich campus chat application
            designed exclusively for LPU students and faculty.
          </p>
          <div className="hero-buttons">
            <Button 
              size="large" 
              className="primary-button"
              onClick={onGetStartedClick}
            >
              {isLoggedIn ? "Chat Now" : "Get Started"} <ArrowRight className="button-icon" />
            </Button>
            <Button size="large" variant="outline" className="outline-button">
              Learn More
            </Button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-container">
            <ChatHeroDemo />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
