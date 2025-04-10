"use client"

import { useState, useRef, useEffect } from "react"
import {
  Search,
  Menu,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Send,
  ImageIcon,
  File,
  Mic,
  MoreVertical,
  Users,
  Bell,
  Settings,
  LogOut,
} from "lucide-react"
import "../styles/ChatPage.css"

function ChatPage() {
  const [activeChat, setActiveChat] = useState(0)
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const attachMenuRef = useRef(null)
  const userMenuRef = useRef(null)

  // Sample data for chats
  const chats = [
    {
      id: 0,
      name: "Computer Science Group",
      avatar: "/placeholder.svg?height=50&width=50",
      isGroup: true,
      members: 28,
      online: 12,
      lastMessage: "Dr. Kumar: Don't forget to submit your assignments by Friday!",
      time: "10:45 AM",
      unread: 3,
    },
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=50&width=50",
      isGroup: false,
      status: "online",
      lastMessage: "I'll send you the lecture notes soon",
      time: "9:30 AM",
      unread: 0,
    },
    {
      id: 2,
      name: "Robotics Club",
      avatar: "/placeholder.svg?height=50&width=50",
      isGroup: true,
      members: 15,
      online: 5,
      lastMessage: "Meeting scheduled for tomorrow at 5 PM in Lab 3",
      time: "Yesterday",
      unread: 2,
    },
    {
      id: 3,
      name: "Raj Patel",
      avatar: "/placeholder.svg?height=50&width=50",
      isGroup: false,
      status: "offline",
      lastMessage: "Thanks for helping with the project",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: 4,
      name: "Campus Events",
      avatar: "/placeholder.svg?height=50&width=50",
      isGroup: true,
      members: 156,
      online: 43,
      lastMessage: "Cultural fest registrations are now open!",
      time: "2 days ago",
      unread: 0,
    },
    {
      id: 5,
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=50&width=50",
      isGroup: false,
      status: "online",
      lastMessage: "Are you coming to the workshop?",
      time: "2 days ago",
      unread: 0,
    },
  ]

  // Sample messages for the active chat
  const messages = [
    {
      id: 1,
      sender: "Dr. Kumar",
      avatar: "/placeholder.svg?height=50&width=50",
      text: "Good morning everyone! I hope you're all doing well.",
      time: "9:30 AM",
      isMe: false,
    },
    {
      id: 2,
      sender: "Dr. Kumar",
      avatar: "/placeholder.svg?height=50&width=50",
      text: "I wanted to remind you all about the upcoming assignment deadline this Friday.",
      time: "9:31 AM",
      isMe: false,
    },
    {
      id: 3,
      sender: "Ananya Singh",
      avatar: "/placeholder.svg?height=50&width=50",
      text: "Thank you for the reminder, Dr. Kumar. Could you please clarify the requirements for the final section?",
      time: "9:35 AM",
      isMe: false,
    },
    {
      id: 4,
      sender: "Dr. Kumar",
      avatar: "/placeholder.svg?height=50&width=50",
      text: "Of course, Ananya. For the final section, you need to include a practical implementation of the algorithms we discussed in class. Make sure to include proper documentation and test cases.",
      time: "9:40 AM",
      isMe: false,
    },
    {
      id: 5,
      sender: "Me",
      text: "Dr. Kumar, will we need to submit a presentation along with the assignment?",
      time: "9:42 AM",
      isMe: true,
    },
    {
      id: 6,
      sender: "Dr. Kumar",
      avatar: "/placeholder.svg?height=50&width=50",
      text: "No, a presentation is not required for this assignment. However, you will need to present your work in the next lab session.",
      time: "9:45 AM",
      isMe: false,
    },
    {
      id: 7,
      sender: "Raj Patel",
      avatar: "/placeholder.svg?height=50&width=50",
      text: "Is there a specific format we should follow for the documentation?",
      time: "9:48 AM",
      isMe: false,
    },
    {
      id: 8,
      sender: "Dr. Kumar",
      avatar: "/placeholder.svg?height=50&width=50",
      text: "Good question, Raj. Please follow the IEEE format for documentation. I've uploaded a template in the course materials section.",
      time: "9:50 AM",
      isMe: false,
    },
    {
      id: 9,
      sender: "Me",
      text: "Thank you for the clarification. I'll start working on it right away.",
      time: "10:00 AM",
      isMe: true,
    },
    {
      id: 10,
      sender: "Dr. Kumar",
      avatar: "/placeholder.svg?height=50&width=50",
      text: "Don't forget to submit your assignments by Friday! Late submissions will have a penalty.",
      time: "10:45 AM",
      isMe: false,
    },
  ]

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Scroll to bottom of messages when messages change or active chat changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeChat])

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setShowAttachMenu(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() === "") return

    // In a real app, you would send this message to your backend
    console.log("Sending message:", message)

    // Clear the input field
    setMessage("")
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  // Sample emojis for the picker
  const emojis = ["😊", "👍", "❤️", "🎉", "🔥", "😂", "🙏", "👏", "🤔", "😎", "🚀", "✨", "💯", "🌟", "👋"]

  return (
    <div className="lpuchat-page">
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div className="lpuchat-sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`lpuchat-sidebar ${mobileSidebarOpen ? "lpuchat-sidebar-open" : ""}`}>
        {/* Sidebar header */}
        <div className="lpuchat-sidebar-header">
          <div className="lpuchat-user-profile" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <div className="lpuchat-user-avatar">
              <span>J</span>
            </div>
            <div className="lpuchat-user-info">
              <h3>John Doe</h3>
              <p>Online</p>
            </div>
            <MoreVertical size={20} className="lpuchat-more-icon" />
          </div>

          {/* User menu */}
          {userMenuOpen && (
            <div className="lpuchat-user-menu" ref={userMenuRef}>
              <div className="lpuchat-menu-item">
                <Users size={18} />
                <span>Profile</span>
              </div>
              <div className="lpuchat-menu-item">
                <Bell size={18} />
                <span>Notifications</span>
              </div>
              <div className="lpuchat-menu-item">
                <Settings size={18} />
                <span>Settings</span>
              </div>
              <div className="lpuchat-menu-divider"></div>
              <div className="lpuchat-menu-item lpuchat-logout">
                <LogOut size={18} />
                <span>Logout</span>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="lpuchat-search-container">
            <Search size={18} className="lpuchat-search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="lpuchat-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="lpuchat-chat-list">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`lpuchat-chat-item ${activeChat === chat.id ? "lpuchat-active" : ""}`}
                onClick={() => {
                  setActiveChat(chat.id)
                  setMobileSidebarOpen(false)
                }}
              >
                <div className="lpuchat-chat-avatar">
                  <img src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
                  {chat.isGroup ? (
                    <div className="lpuchat-group-indicator">
                      <Users size={12} />
                    </div>
                  ) : (
                    chat.status === "online" && <div className="lpuchat-status-indicator"></div>
                  )}
                </div>
                <div className="lpuchat-chat-details">
                  <div className="lpuchat-chat-header">
                    <h4>{chat.name}</h4>
                    <span className="lpuchat-chat-time">{chat.time}</span>
                  </div>
                  <div className="lpuchat-chat-message">
                    <p>{chat.lastMessage}</p>
                    {chat.unread > 0 && <span className="lpuchat-unread-badge">{chat.unread}</span>}
                  </div>
                  {chat.isGroup && (
                    <div className="lpuchat-group-info">
                      <span>{chat.online} online</span>
                      <span className="lpuchat-dot">•</span>
                      <span>{chat.members} members</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="lpuchat-no-results">
              <p>No conversations found</p>
              <button onClick={() => setSearchQuery("")}>Clear search</button>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="lpuchat-main">
        {/* Chat header */}
        <div className="lpuchat-chat-header">
          <div className="lpuchat-header-left">
            <button className="lpuchat-menu-button" onClick={() => setMobileSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="lpuchat-chat-avatar">
              <img src={chats[activeChat].avatar || "/placeholder.svg"} alt={chats[activeChat].name} />
              {!chats[activeChat].isGroup && chats[activeChat].status === "online" && (
                <div className="lpuchat-status-indicator"></div>
              )}
            </div>
            <div className="lpuchat-chat-info">
              <h3>{chats[activeChat].name}</h3>
              {chats[activeChat].isGroup ? (
                <p>
                  {chats[activeChat].online} online • {chats[activeChat].members} members
                </p>
              ) : (
                <p>{chats[activeChat].status === "online" ? "Online" : "Offline"}</p>
              )}
            </div>
          </div>
          <div className="lpuchat-header-actions">
            <button className="lpuchat-action-button">
              <Phone size={20} />
            </button>
            <button className="lpuchat-action-button">
              <Video size={20} />
            </button>
            <button className="lpuchat-action-button">
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="lpuchat-messages">
          <div className="lpuchat-date-divider">
            <span>Today</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`lpuchat-message ${msg.isMe ? "lpuchat-message-sent" : "lpuchat-message-received"}`}
            >
              {!msg.isMe && (
                <div className="lpuchat-message-avatar">
                  <img src={msg.avatar || "/placeholder.svg"} alt={msg.sender} />
                </div>
              )}
              <div className="lpuchat-message-content">
                {!msg.isMe && <div className="lpuchat-message-sender">{msg.sender}</div>}
                <div className="lpuchat-message-bubble">
                  <p>{msg.text}</p>
                  <span className="lpuchat-message-time">{msg.time}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input area */}
        <div className="lpuchat-input-area">
          <div className="lpuchat-input-container">
            <div className="lpuchat-input-actions">
              <div className="lpuchat-emoji-container" ref={emojiPickerRef}>
                <button className="lpuchat-action-icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <Smile size={22} />
                </button>
                {showEmojiPicker && (
                  <div className="lpuchat-emoji-picker">
                    {emojis.map((emoji, index) => (
                      <button key={index} className="lpuchat-emoji" onClick={() => handleEmojiSelect(emoji)}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="lpuchat-attach-container" ref={attachMenuRef}>
                <button className="lpuchat-action-icon" onClick={() => setShowAttachMenu(!showAttachMenu)}>
                  <Paperclip size={22} />
                </button>
                {showAttachMenu && (
                  <div className="lpuchat-attach-menu">
                    <button className="lpuchat-attach-option">
                      <ImageIcon size={20} />
                      <span>Image</span>
                    </button>
                    <button className="lpuchat-attach-option">
                      <File size={20} />
                      <span>Document</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <form onSubmit={handleSendMessage} className="lpuchat-message-form">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="lpuchat-message-input"
              />
              <button type="button" className="lpuchat-action-icon lpuchat-mic-icon">
                <Mic size={22} />
              </button>
              <button type="submit" className="lpuchat-send-button" disabled={message.trim() === ""}>
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
