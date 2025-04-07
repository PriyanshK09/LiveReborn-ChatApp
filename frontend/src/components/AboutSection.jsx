import Badge from "./Badge"
import "../styles/AboutSection.css"; // Updated to use its own CSS file

function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="section-container">
        <div className="about-content">
          <div className="about-text">
            <Badge>About LPU Live</Badge>
            <h2 className="section-title">Designed for the LPU community</h2>
            <p className="about-description">
              LPU Live is a dedicated communication platform created exclusively for Lovely Professional University
              students and faculty. Our mission is to enhance campus connectivity and foster a stronger sense of
              community.
            </p>
            <p className="about-description">
              With a focus on security, ease of use, and reliability, LPU Live brings together all aspects of campus
              communication in one seamless application.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <div className="about-feature-icon">✓</div>
                <p>Department-specific chat groups</p>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">✓</div>
                <p>Direct messaging with professors</p>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">✓</div>
                <p>Campus event notifications</p>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">✓</div>
                <p>Academic resource sharing</p>
              </div>
            </div>
          </div>
          <div className="about-image">
            <img src="/images/lpu-campus.jpeg" alt="LPU Campus" className="campus-image" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
