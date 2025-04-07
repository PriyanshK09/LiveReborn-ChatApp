import "../styles/FeatureCard.css"

function FeatureCard({ icon, title, description, color = "orange" }) {
  return (
    <div className={`feature-card feature-${color}`}>
      <div className="feature-card-inner">
        <div className={`feature-icon-container ${color}`}>
          <div className="icon-background"></div>
          {icon}
        </div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
        <div className="feature-link">
          <a href="#">Learn more</a>
        </div>
      </div>
    </div>
  )
}

export default FeatureCard

