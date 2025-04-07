import FeatureCard from "./FeatureCard"
import Badge from "./Badge"
import { MessageSquare, Lock, Palette, Smartphone } from "lucide-react"
import "../styles/FeaturesSection.css"

function FeaturesSection() {
  return (
    <section id="features" className="features-section">
      <div className="section-container">
        <div className="section-header">
          <Badge>Features</Badge>
          <h2 className="section-title">Everything you need to connect</h2>
          <p className="section-description">
            Our platform is designed with the latest technology to provide you with the best campus communication
            experience.
          </p>
        </div>
        <div className="features-grid">
          <FeatureCard
            icon={<MessageSquare className="feature-icon" />}
            title="Real-time Messaging"
            description="Send and receive messages instantly with our lightning-fast infrastructure. Stay connected with classmates and professors without delays."
            color="blue"
          />
          <FeatureCard
            icon={<Lock className="feature-icon" />}
            title="End-to-End Encryption"
            description="Your conversations are secure with our advanced encryption technology. Privacy is our priority for all campus communications."
            color="green"
          />
          <FeatureCard
            icon={<Palette className="feature-icon" />}
            title="Custom Themes"
            description="Personalize your chat experience with a variety of themes and colors. Make LPU Live uniquely yours with customization options."
            color="purple"
          />
          <FeatureCard
            icon={<Smartphone className="feature-icon" />}
            title="Multi-Device Sync"
            description="Access your chats from any device with seamless synchronization. Switch between your phone and laptop without missing a message."
            color="orange"
          />
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
