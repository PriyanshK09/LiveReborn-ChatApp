import { CheckCircle } from "lucide-react"
import Button from "./Button"
import Badge from "./Badge"
import "../styles/PricingCard.css"

function PricingCard({ title, price, period, description, features, buttonText, buttonVariant, highlighted = false }) {
  return (
    <div className={`pricing-card ${highlighted ? "pricing-card-highlighted" : ""}`}>
      {highlighted && (
        <div className="popular-badge">
          <Badge>Most Popular</Badge>
        </div>
      )}
      <h3 className="pricing-title">{title}</h3>
      <div className="pricing-price">
        <span className="price-amount">{price}</span>
        {period && <span className="price-period">{period}</span>}
      </div>
      <p className="pricing-description">{description}</p>
      <ul className="pricing-features">
        {features.map((feature, index) => (
          <li key={index} className="feature-item">
            <CheckCircle className="feature-check" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button className={`pricing-button ${highlighted ? "pricing-button-highlighted" : ""}`} variant={buttonVariant}>
        {buttonText}
      </Button>
    </div>
  )
}

export default PricingCard

