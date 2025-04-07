import Button from "./Button"
import { ArrowRight } from "lucide-react"
import "../styles/CTASection.css"

function CTASection() {
  return (
    <section className="cta-section">
      <div className="section-container">
        <h2 className="cta-title">Ready to transform campus communication?</h2>
        <p className="cta-description">
          Join thousands of LPU students and faculty and experience the future of campus messaging today.
        </p>
        <Button size="large" variant="secondary" className="cta-button">
          Get Started Now <ArrowRight className="button-icon" />
        </Button>
      </div>
    </section>
  )
}

export default CTASection
