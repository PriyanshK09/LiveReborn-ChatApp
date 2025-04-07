import "../styles/Button.css"

function Button({ children, variant = "default", size = "medium", className = "", ...props }) {
  return (
    <button className={`button ${variant} ${size} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button

