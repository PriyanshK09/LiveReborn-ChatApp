import { Twitter, Github, Instagram } from "lucide-react"
import "../styles/Footer.css"
import ScrollLink from "./ScrollLink"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/images/lpu-logo.png" alt="LPU Logo" className="footer-logo-image" />
              <span className="footer-logo-text">LPU Live</span>
            </div>
            <p className="footer-tagline">Modern messaging for the LPU community.</p>
            <div className="social-links">
              <a href="#" className="social-link">
                <Twitter className="social-icon" />
              </a>
              <a href="#" className="social-link">
                <Github className="social-icon" />
              </a>
              <a href="#" className="social-link">
                <Instagram className="social-icon" />
              </a>
            </div>
          </div>
          <div className="footer-links">
            <h3 className="footer-heading">Platform</h3>
            <ul className="footer-list">
              <li>
                <a href="/#features" className="footer-link">
                  Features
                </a>
              </li>
              <li>
                <ScrollLink to="/faq" className="footer-link">
                  FAQ
                </ScrollLink>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h3 className="footer-heading">University</h3>
            <ul className="footer-list">
              <li>
                <a href="https://www.lpu.in/about-lpu/" className="footer-link" target="_blank" rel="noopener noreferrer">
                  About LPU
                </a>
              </li>
              <li>
                <a href="https://www.lpu.in/newsreleasehome.aspx" className="footer-link" target="_blank" rel="noopener noreferrer">
                  Campus News
                </a>
              </li>
              <li>
                <a href="https://www.lpu.in/campus-life/campus-events.php" className="footer-link" target="_blank" rel="noopener noreferrer">
                  Events
                </a>
              </li>
              <li>
                <a href="https://www.lpu.in/contact-us/contact-us.php" className="footer-link" target="_blank" rel="noopener noreferrer">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-list">
              <li>
                <a href="https://www.lpu.in/privacy-lpulive.php" className="footer-link" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://www.lpu.in/terms-conditions.php" className="footer-link" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LPU Live. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
