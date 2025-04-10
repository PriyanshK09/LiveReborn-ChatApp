"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { 
  User, Mail, Calendar, BookOpen, Briefcase, Camera, Save,
  Moon, UserCheck, Settings, LogOut, ChevronRight
} from "lucide-react"
import "../styles/ProfilePage.css"

function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [aboutMe, setAboutMe] = useState("I am a student at LPU, passionate about learning and growing.")
  const [activeTab, setActiveTab] = useState('personal')
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      navigate("/login") // Redirect to login if not authenticated
      return
    }

    // Fetch user data from backend
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/userdata', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await response.json();
        setUser(data); // Update user state with backend data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate])

  const handleSaveAboutMe = () => {
    setEditMode(false)
    // Save to localStorage or backend if needed
    const updatedUser = { ...user, aboutMe }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    
    // Show success message
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'personal':
        return renderPersonalTab()
      case 'settings':
        return renderSettingsTab()
      default:
        return renderPersonalTab()
    }
  }
  
  const renderPersonalTab = () => (
    <>
      <div className="profile-section">
        <div className="section-header">
          <h3>Personal Information</h3>
        </div>
        <div className="profile-info">
          <div className="info-card">
            <div className="info-item">
              <div className="info-icon">
                <User size={18} />
              </div>
              <div className="info-content">
                <span className="info-label">Full Name</span>
                <span className="info-value">{user?.name || 'N/A'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <UserCheck size={18} />
              </div>
              <div className="info-content">
                <span className="info-label">Registration Number</span>
                <span className="info-value">{user?.regno || 'N/A'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Mail size={18} />
              </div>
              <div className="info-content">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || 'N/A'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Calendar size={18} />
              </div>
              <div className="info-content">
                <span className="info-label">Joined</span>
                <span className="info-value">{user?.joinDate || 'N/A'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <BookOpen size={18} />
              </div>
              <div className="info-content">
                <span className="info-label">Department</span>
                <span className="info-value">{user?.department || 'N/A'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Briefcase size={18} />
              </div>
              <div className="info-content">
                <span className="info-label">Role</span>
                <span className="info-value">{user?.role || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <div className="section-header about-me-header">
          <h3 className="section-title">About Me</h3>
          <div className="section-actions">
            {!editMode ? (
              <button className="edit-button" onClick={() => setEditMode(true)}>
                Edit About Me
              </button>
            ) : (
              <button className="save-button" onClick={handleSaveAboutMe}>
                <Save size={16} />
                Save Changes
              </button>
            )}
          </div>
        </div>
        <div className="about-me-container">
          {!editMode ? (
            <div className="bio-card">
              <p>{aboutMe}</p>
            </div>
          ) : (
            <textarea
              className="about-me-textarea"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Write something about yourself..."
            ></textarea>
          )}
        </div>
      </div>
    </>
  )
  
  const renderSettingsTab = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>Account Settings</h3>
      </div>
      
      <div className="settings-card">
        <div className="settings-group">
          <h4>Notifications</h4>
          <div className="settings-option">
            <div>
              <h5>Email Notifications</h5>
              <p>Receive email updates about your account activity</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="settings-option">
            <div>
              <h5>Push Notifications</h5>
              <p>Receive push notifications for messages and updates</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-group">
          <h4>Appearance</h4>
          <div className="settings-option">
            <div>
              <h5>Dark Mode</h5>
              <p>Switch between light and dark themes</p>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-group">
          <h4>Account Management</h4>
          <button className="password-button">
            Change Password
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-shapes">
          <div className="profile-shape shape1"></div>
          <div className="profile-shape shape2"></div>
          <div className="profile-shape shape3"></div>
        </div>
        <div className="profile-header-content">
          <h1>My Profile</h1>
          <p>Manage your account information and settings</p>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user?.profilePicture ? (
                <img 
                  src={`http://localhost:5000${user.profilePicture}`} 
                  alt={user.name}
                  className="profile-avatar-image"
                />
              ) : (
                <span>{user?.name?.charAt(0) || "U"}</span>
              )}
            </div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-role">{user?.department || 'Student'} at LPU</p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-value">42</div>
                <div className="stat-label">Chats</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">8</div>
                <div className="stat-label">Groups</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">156</div>
                <div className="stat-label">Messages</div>
              </div>
            </div>
          </div>
          
          <div className="profile-tabs">
            <button 
              className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <User size={18} />
              <span>Personal Info</span>
              <ChevronRight size={16} className="tab-arrow" />
            </button>
            <button 
              className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              <span>Settings</span>
              <ChevronRight size={16} className="tab-arrow" />
            </button>
          </div>
          
          <button className="logout-button">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="profile-content">
          {renderTabContent()}
        </div>
      </div>
      
      <div className={`success-message ${showSuccess ? 'show' : ''}`}>
        <div className="success-content">
          <Check size={18} />
          <span>Changes saved successfully!</span>
        </div>
      </div>
    </div>
  )
}

// Add missing Check icon import
function Check(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default ProfilePage