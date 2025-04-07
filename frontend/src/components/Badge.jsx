import "../styles/Badge.css"

function Badge({ children, variant = "default", className = "" }) {
  return <span className={`badge ${variant} ${className}`}>{children}</span>
}

export default Badge

