import { Twitter, Github, Instagram } from "lucide-react"
import "../styles/Footer.css"

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
                <a href="#" className="footer-link">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h3 className="footer-heading">University</h3>
            <ul className="footer-list">
              <li>
                <a href="#" className="footer-link">
                  About LPU
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Campus News
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Events
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-list">
              <li>
                <a href="#" className="footer-link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Cookie Policy
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
