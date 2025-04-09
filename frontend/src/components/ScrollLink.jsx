import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"

/**
 * A custom Link component that scrolls to top before navigation
 */
function ScrollLink({ to, children, onClick, ...rest }) {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    
    // Scroll to top immediately with no animation
    window.scrollTo(0, 0);
    
    // If there's an onClick handler, call it
    if (onClick) {
      onClick(e);
    }
    
    // Navigate after a tiny delay to ensure scroll happens first
    setTimeout(() => {
      navigate(to);
    }, 10);
  };

  return (
    <Link to={to} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

export default ScrollLink
