"use client"

import { useState, useEffect } from "react"
import { User, Mail, Calendar, Edit, Camera, MapPin, BookOpen, Briefcase, Save } from "lucide-react"
import "../styles/ProfilePage.css";

function ProfilePage() {
  // Fetch user data from localStorage (in a real app, you might fetch from an API)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    location: "",
    bio: "",
  })

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      const userData = JSON.parse(localStorage.getItem("user")) || {
        name: "John Doe",
        email: "john.doe@lpu.edu",
        department: "Computer Science",
        role: "Student",
        joinDate: "January 2022",
        location: "Punjab, India",
        bio: "Computer Science student passionate about web development and AI. Active member of the coding club and participant in hackathons.",
      }
      setUser(userData)
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        department: userData.department || "",
        role: userData.role || "",
        location: userData.location || "",
        bio: userData.bio || "",
      })
      setLoading(false)
    }, 500)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = () => {
    // In a real app, you would send this data to your backend
    const updatedUser = { ...user, ...formData }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setEditMode(false)

    // Show success message
    const successMessage = document.querySelector(".success-message")
    successMessage.classList.add("show")
    setTimeout(() => {
      successMessage.classList.remove("show")
    }, 3000)
  }

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
        <div className="profile-header-content">
          <h1>My Profile</h1>
          <p>Manage your account information and settings</p>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user.name.charAt(0)}
              <button className="avatar-upload-button">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-role">{user.role} at LPU</p>
          </div>

          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            <button
              className={`profile-tab ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => setActiveTab("activity")}
            >
              <Calendar size={18} />
              <span>Activity</span>
            </button>
            <button
              className={`profile-tab ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Edit size={18} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div className="profile-content">
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                {!editMode ? (
                  <button className="edit-button" onClick={() => setEditMode(true)}>
                    <Edit size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <button className="save-button" onClick={handleSaveProfile}>
                    <Save size={16} />
                    Save Changes
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="profile-info">
                  <div className="info-card">
                    <div className="info-item">
                      <div className="info-icon">
                        <User size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Full Name</span>
                        <span className="info-value">{user.name}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <Mail size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Email</span>
                        <span className="info-value">{user.email}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <BookOpen size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Department</span>
                        <span className="info-value">{user.department}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <Briefcase size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Role</span>
                        <span className="info-value">{user.role}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <Calendar size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Joined</span>
                        <span className="info-value">{user.joinDate}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon">
                        <MapPin size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Location</span>
                        <span className="info-value">{user.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bio-card">
                    <h4>About Me</h4>
                    <p>{user.bio}</p>
                  </div>
                </div>
              ) : (
                <div className="profile-edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="department">Department</label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="role">Role</label>
                      <input type="text" id="role" name="role" value={formData.role} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">About Me</label>
                    <textarea id="bio" name="bio" rows="4" value={formData.bio} onChange={handleInputChange}></textarea>
                  </div>

                  <div className="form-actions">
                    <button className="cancel-button" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                    <button className="save-button" onClick={handleSaveProfile}>
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Recent Activity</h3>
              </div>
              <div className="activity-list">
                <div className="activity-empty">
                  <div className="empty-icon">
                    <Calendar size={48} />
                  </div>
                  <h4>No recent activity</h4>
                  <p>Your recent activities will appear here</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Account Settings</h3>
              </div>
              <div className="settings-card">
                <div className="settings-group">
                  <h4>Notification Preferences</h4>
                  <div className="settings-option">
                    <div>
                      <h5>Email Notifications</h5>
                      <p>Receive email notifications for messages and updates</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-option">
                    <div>
                      <h5>Chat Notifications</h5>
                      <p>Receive in-app notifications for new messages</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <h4>Privacy Settings</h4>
                  <div className="settings-option">
                    <div>
                      <h5>Profile Visibility</h5>
                      <p>Control who can see your profile information</p>
                    </div>
                    <select className="settings-select">
                      <option value="everyone">Everyone</option>
                      <option value="connections">Connections Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="settings-group">
                  <h4>Account Management</h4>
                  <button className="password-button">Change Password</button>
                  <button className="delete-button">Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="success-message">
        <div className="success-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Profile updated successfully!</span>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
