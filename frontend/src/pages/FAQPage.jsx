"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronDown, MessageSquare, Shield, Users, Settings, HelpCircle, Mail } from "lucide-react"
import "../styles/FAQPage.css"

function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [filteredFaqs, setFilteredFaqs] = useState([])
  const searchInputRef = useRef(null)

  // FAQ categories with their respective icons
  const categories = [
    { id: "all", name: "All Questions", icon: <HelpCircle size={20} /> },
    { id: "general", name: "General", icon: <MessageSquare size={20} /> },
    { id: "account", name: "Account", icon: <Users size={20} /> },
    { id: "security", name: "Security", icon: <Shield size={20} /> },
    { id: "features", name: "Features", icon: <Settings size={20} /> },
  ]

  // FAQ items with categories
  const faqItems = [
    {
      question: "What is LPU Live Chat App?",
      answer:
        "LPU Live is a campus-based chat application designed specifically for Lovely Professional University students and faculty. It provides a secure and user-friendly platform for communication within the university community.",
      category: "general",
    },
    {
      question: "Who can use LPU Live?",
      answer:
        "LPU Live is available for all current students, faculty, and staff members of Lovely Professional University with a valid university email address.",
      category: "general",
    },
    {
      question: "How do I create an account?",
      answer:
        "You can sign up using your official LPU email address. Simply visit the registration page, enter your details, and follow the verification process to activate your account.",
      category: "account",
    },
    {
      question: "Is my data secure on LPU Live?",
      answer:
        "Yes, we take data privacy very seriously. LPU Live uses end-to-end encryption for messages and follows strict data protection protocols. Your information is stored securely and never shared with third parties.",
      category: "security",
    },
    {
      question: "Can I create group chats?",
      answer:
        "Yes, you can create group chats with your classmates, project teams, or student organizations. Simply go to the 'New Chat' option and select 'Create Group' to add participants.",
      category: "features",
    },
    {
      question: "How do I report inappropriate behavior?",
      answer:
        "You can report any concerning or inappropriate behavior by clicking the 'Report' button in any chat. Our moderation team will review all reports and take appropriate action according to our community guidelines.",
      category: "security",
    },
    {
      question: "Can I delete messages after sending them?",
      answer:
        "Yes, you can delete messages you've sent within 24 hours. However, please note that recipients may have already seen your message before deletion.",
      category: "features",
    },
    {
      question: "Is LPU Live available on mobile devices?",
      answer:
        "Yes, LPU Live is accessible through our web application and will soon be available as a dedicated mobile app for both iOS and Android platforms.",
      category: "general",
    },
    {
      question: "How do I reset my password?",
      answer:
        "To reset your password, click on the 'Forgot Password' link on the login page. Enter your LPU email address, and we'll send you instructions to create a new password.",
      category: "account",
    },
    {
      question: "Can I customize notification settings?",
      answer:
        "Yes, you can customize your notification preferences in the Settings menu. You can choose to receive notifications for all messages, mentions only, or mute specific conversations.",
      category: "features",
    },
    {
      question: "Is there a limit to file sharing?",
      answer:
        "Yes, you can share files up to 25MB in size. Supported file types include documents, images, videos, and audio files.",
      category: "features",
    },
    {
      question: "How do I change my profile picture?",
      answer:
        "You can change your profile picture by going to your Profile page, clicking on your current picture, and selecting 'Upload New Photo'. You can then crop and adjust your image before saving.",
      category: "account",
    },
  ]

  // Filter FAQs based on search query and active category
  useEffect(() => {
    let results = faqItems

    // Filter by category
    if (activeCategory !== "all") {
      results = results.filter((item) => item.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (item) => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query),
      )
    }

    setFilteredFaqs(results)
  }, [searchQuery, activeCategory])

  // Toggle accordion
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setActiveIndex(null) // Close all accordions when searching
  }

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId)
    setActiveIndex(null) // Close all accordions when changing category
  }

  // Focus search input when pressing Ctrl+K or Command+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Handle feedback
  const handleFeedback = (helpful, index) => {
    // In a real app, you would send this feedback to your backend
    alert(`Thank you for your ${helpful ? "positive" : "negative"} feedback on this answer!`)
  }

  return (
    <div className="lpufaq-page">
      {/* Header with background shapes */}
      <div className="lpufaq-header">
        <div className="lpufaq-header-bg">
          <div className="lpufaq-shape lpufaq-shape1"></div>
          <div className="lpufaq-shape lpufaq-shape2"></div>
          <div className="lpufaq-shape lpufaq-shape3"></div>
        </div>
        <div className="lpufaq-header-content">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to commonly asked questions about LPU Live Chat App</p>

          {/* Search bar */}
          <div className="lpufaq-search-container">
            <div className="lpufaq-search-wrapper">
              <Search className="lpufaq-search-icon" size={18} />
              <input
                type="text"
                placeholder="Search for questions or keywords..."
                className="lpufaq-search-input"
                value={searchQuery}
                onChange={handleSearch}
                ref={searchInputRef}
              />
              <div className="lpufaq-search-shortcut">Ctrl+K</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lpufaq-container">
        <div className="lpufaq-content">
          {/* Category tabs */}
          <div className="lpufaq-categories">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`lpufaq-category-btn ${activeCategory === category.id ? "lpufaq-active" : ""}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.icon}
                <span>{category.name}</span> {/* Hidden on mobile via CSS */}
              </button>
            ))}
          </div>

          {/* FAQ accordion */}
          <div className="lpufaq-accordion">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, index) => (
                <div key={index} className={`lpufaq-item ${activeIndex === index ? "lpufaq-active" : ""}`}>
                  <button
                    className="lpufaq-question"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={activeIndex === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span>{item.question}</span>
                    <ChevronDown className={`lpufaq-icon ${activeIndex === index ? "lpufaq-rotate" : ""}`} />
                  </button>
                  <div id={`faq-answer-${index}`} className="lpufaq-answer" aria-hidden={activeIndex !== index}>
                    <p>{item.answer}</p>
                    <div className="lpufaq-feedback">
                      <p>Was this answer helpful?</p>
                      <div className="lpufaq-feedback-buttons">
                        <button onClick={() => handleFeedback(true, index)} className="lpufaq-feedback-yes">
                          Yes
                        </button>
                        <button onClick={() => handleFeedback(false, index)} className="lpufaq-feedback-no">
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="lpufaq-no-results">
                <div className="lpufaq-no-results-icon">🔍</div>
                <h3>No matching questions found</h3>
                <p>Try adjusting your search or browse all categories</p>
                <button
                  className="lpufaq-reset-search"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory("all")
                  }}
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>

          {/* Contact section */}
          <div className="lpufaq-contact">
            <div className="lpufaq-contact-content">
              <div className="lpufaq-contact-icon">
                <Mail size={28} />
              </div>
              <div className="lpufaq-contact-text">
                <h2>Still have questions?</h2>
                <p>If you couldn't find the answer to your question, please feel free to contact our support team.</p>
              </div>
              <a href="mailto:support@lpulive.com" className="lpufaq-contact-button">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQPage
