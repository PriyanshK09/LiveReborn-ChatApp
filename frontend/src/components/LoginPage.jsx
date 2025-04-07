import "../styles/LoginPage.css"
import Button from "./Button"
import { ArrowRight, User, Lock, Info } from "lucide-react"

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/images/lpu-logo.png" alt="LPU Logo" />
            <span>LPU Live</span>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Log in to your account</p>
        </div>

        <div className="login-tip-container">
          <div className="login-tip">
            <Info size={16} className="tip-icon" />
            <p>Use your UMS credentials to login</p>
          </div>
        </div>
        
        <form className="login-form">
          <div className="form-group">
            <label htmlFor="regno" className="form-label">Registration Number</label>
            <div className="input-container">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                id="regno" 
                className="form-input" 
                placeholder="Enter your registration number" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password" className="form-label">Password</label>
              <a href="https://ums.lpu.in/lpuums/forgetpassword.aspx" target="_blank" rel="noopener noreferrer" className="forgot-password-link">Forgot password?</a>
            </div>
            <div className="input-container">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                id="password" 
                className="form-input" 
                placeholder="Enter your password" 
                required 
              />
            </div>
          </div>

          <div className="remember-me">
            <label className="checkbox-container">
              <input type="checkbox" id="remember" />
              <span className="checkmark"></span>
              Remember me
            </label>
          </div>

          <Button type="submit" className="login-button" variant="primary">
            Log In <ArrowRight size={18} className="button-icon" />
          </Button>
        </form>
      </div>

      <div className="login-background">
        <div className="background-shape shape1"></div>
        <div className="background-shape shape2"></div>
        <div className="background-shape shape3"></div>
      </div>
    </div>
  )
}

export default LoginPage
