import "../styles/LoginPage.css";
import Button from "./Button";
import { ArrowRight, User, Lock, Info, Loader } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [regno, setRegno] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/login", {
        regno,
        password,
      });

      // Handle successful login
      const { token, user } = response.data;
      
      // Save auth data to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Show success message and redirect
      alert(`Login successful! Welcome, ${user?.name || "User"}`);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 500) {
        setError("An internal server error occurred. Please try again later.");
      } else if (err.response?.status === 401) {
        setError("Invalid credentials. Please check your registration number and password.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("An error occurred. Please try again later.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

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

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="regno" className="form-label">Registration Number</label>
            <div className="input-container">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="regno"
                className="form-input"
                placeholder="Enter your registration number"
                value={regno}
                onChange={(e) => setRegno(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-container">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="remember-forgot">
            <label className="checkbox-container">
              <input type="checkbox" id="remember" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a
              href="https://ums.lpu.in/lpuums/forgetpassword.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="forgot-password-link"
              onClick={(e) => {
                if (!window.confirm("Are you sure you want to navigate to the Forgot Password page?")) {
                  e.preventDefault();
                }
              }}
            >
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="login-button" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Loader size={18} className="spin-icon" /> Logging in...
              </>
            ) : (
              <>
                Log In <ArrowRight size={18} className="button-icon" />
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="login-background">
        <div className="background-shape shape1"></div>
        <div className="background-shape shape2"></div>
        <div className="background-shape shape3"></div>
      </div>
    </div>
  );
}

export default LoginPage;
