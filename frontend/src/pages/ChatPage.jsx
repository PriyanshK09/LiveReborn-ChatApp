"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
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
  X,
  MoreVertical,
  Users,
  Plus,
} from "lucide-react"
import "../styles/ChatPage.css"

function ChatPage() {
  const navigate = useNavigate()
  const [activeChat, setActiveChat] = useState(null) // Set default to null
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)
  const [chatFilter, setChatFilter] = useState("all")
  const messagesEndRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const attachMenuRef = useRef(null)
  const messageListRef = useRef(null)
  const inputRef = useRef(null)

  // Add class to body when chat page mounts and remove when unmounts
  useEffect(() => {
    document.body.classList.add('chat-page-active');
    
    // Prevent body scrolling on mobile
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.classList.remove('chat-page-active');
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Check for authentication
  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      navigate("/login")
    }
  }, [navigate])

  // Close emoji picker and attach menu when changing active chat
  useEffect(() => {
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  }, [activeChat]);

  // Handle window resize to close sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileSidebarOpen]);

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
      type: "academic",
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
      type: "personal",
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
      type: "club",
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
      type: "personal",
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
      type: "announcement",
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

  // Filter chats based on search query and chat filter
  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = chatFilter === "all" || chat.type === chatFilter
    return matchesSearch && matchesFilter
  })

  // Handle scroll behavior in the message list
  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [shouldScrollToBottom, messages])

  // Track scroll position to determine if auto-scrolling should happen
  useEffect(() => {
    const handleScroll = () => {
      if (!messageListRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current
      // If user is at or very near bottom (within 100px), enable auto-scroll
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

      setShouldScrollToBottom(isNearBottom)
    }

    const messageList = messageListRef.current
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll)
      return () => messageList.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Scroll to bottom when entering chat page initially
  useEffect(() => {
    // Ensure we scroll to the bottom of the chat messages area, not the whole page
    if (messageListRef.current) {
      setTimeout(() => {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight
      }, 100) // Small delay to ensure content is rendered
    }
  }, [])

  // Reset scroll when changing chats
  useEffect(() => {
    if (messageListRef.current) {
      // Immediately scroll to bottom when changing chats
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
      setShouldScrollToBottom(true)
    }
  }, [activeChat])

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && 
          !event.target.closest('button')?.classList.contains('chat-input-button')) {
        setShowEmojiPicker(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target) && 
          !event.target.closest('button')?.classList.contains('chat-input-button')) {
        setShowAttachMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() === "") return

    // In a real app, you would send this message to your backend
    const newMessage = {
      id: messages.length + 1,
      sender: "Me",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    }

    // For demo purposes, we're just adding to the local state
    // messages.push(newMessage)
    // setMessages([...messages])

    setMessage("")
    setShouldScrollToBottom(true) // Ensure we scroll to bottom after sending
    
    // Focus input field after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  // Generate avatar from name
  const generateColorFromName = (name) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const h = hash % 360
    return `hsl(${h}, 70%, 50%)` // Generate HSL color with consistent saturation and lightness
  }

  // Function to get user or group avatar
  const getAvatar = (chat) => {
    // Placeholder for avatar images - in a real app, you would use the actual avatar URLs
    if (chat.avatar) {
      return (
        <div className="chat-avatar-wrapper">
          <img
            src={
              chat.avatar.startsWith("/")
                ? chat.avatar
                : `http://localhost:5000${chat.avatar}`
            }
            alt={chat.name}
            className="chat-avatar-img"
            onError={(e) => {
              // Safely check if the parent has the text avatar as a child before hiding the image
              e.target.style.display = "none";
              // Create and add the text avatar if it doesn't exist
              const parent = e.target.parentNode;
              if (parent) {
                // Check if text avatar already exists
                const existingTextAvatar = parent.querySelector(".chat-avatar-text");
                if (!existingTextAvatar) {
                  // Create text avatar element
                  const initials = chat.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2);
                  
                  const textAvatar = document.createElement("div");
                  textAvatar.className = "chat-avatar-text";
                  textAvatar.style.backgroundColor = generateColorFromName(chat.name);
                  textAvatar.textContent = initials;
                  
                  // Append to parent
                  parent.appendChild(textAvatar);
                }
              }
            }}
          />
        </div>
      );
    }

    // If no avatar or image fails, use first letter(s) of name
    const initials = chat.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);

    return (
      <div className="chat-avatar-text" style={{ backgroundColor: generateColorFromName(chat.name) }}>
        {initials}
      </div>
    );
  };

  // Get avatar for message
  const getMessageAvatar = (message) => {
    if (message.avatar) {
      return (
        <div className="chat-avatar-wrapper">
          <img
            src={message.avatar || "/placeholder.svg"}
            alt={message.sender}
            onError={(e) => {
              // Safely check if the parent has the text avatar as a child before hiding the image
              e.target.style.display = "none";
              // Create and add the text avatar if it doesn't exist
              const parent = e.target.parentNode;
              if (parent) {
                // Check if text avatar already exists
                const existingTextAvatar = parent.querySelector(".chat-message-avatar-placeholder");
                if (!existingTextAvatar) {
                  // Create text avatar element
                  const textAvatar = document.createElement("div");
                  textAvatar.className = "chat-message-avatar-placeholder";
                  textAvatar.style.backgroundColor = generateColorFromName(message.sender);
                  textAvatar.textContent = message.sender.charAt(0);
                  
                  // Append to parent
                  parent.appendChild(textAvatar);
                }
              }
            }}
          />
        </div>
      );
    }

    return (
      <div
        className="chat-message-avatar-placeholder"
        style={{ backgroundColor: generateColorFromName(message.sender) }}
      >
        {message.sender.charAt(0)}
      </div>
    );
  };

  // Handle backdrop click to close sidebar
  const handleBackdropClick = () => {
    setMobileSidebarOpen(false);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  return (
    <div className="chat-page-wrapper">
      <div className="chat-page">
        {/* Mobile sidebar backdrop */}
        {mobileSidebarOpen && <div className="chat-sidebar-backdrop" onClick={handleBackdropClick}></div>}

        {/* Sidebar with chat list */}
        <div className={`chat-sidebar ${mobileSidebarOpen ? "chat-sidebar-open" : ""}`}>
          {/* Sidebar header */}
          <div className="chat-sidebar-header">
            <div className="chat-title">
              <h2>Chats</h2>
              <span className="chat-count">{chats.length}</span>
            </div>
            <div className="chat-actions">
              <button className="chat-action-button">
                <Plus size={20} />
              </button>
              <button className="chat-action-button">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="chat-search">
            <Search size={18} className="chat-search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="chat-search-clear" onClick={() => setSearchQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Chat filters */}
          <div className="chat-filters">
            <button
              className={`chat-filter-button ${chatFilter === "all" ? "active" : ""}`}
              onClick={() => setChatFilter("all")}
            >
              All
            </button>
            <button
              className={`chat-filter-button ${chatFilter === "academic" ? "active" : ""}`}
              onClick={() => setChatFilter("academic")}
            >
              Academic
            </button>
            <button
              className={`chat-filter-button ${chatFilter === "personal" ? "active" : ""}`}
              onClick={() => setChatFilter("personal")}
            >
              Personal
            </button>
            <button
              className={`chat-filter-button ${chatFilter === "club" ? "active" : ""}`}
              onClick={() => setChatFilter("club")}
            >
              Clubs
            </button>
          </div>

          {/* Chat list */}
          <div className="chat-list">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-list-item ${activeChat === chat.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveChat(chat.id)
                    setMobileSidebarOpen(false)
                  }}
                >
                  <div className="chat-list-avatar">
                    {getAvatar(chat)}
                    {!chat.isGroup && chat.status === "online" && <div className="chat-status-dot"></div>}
                    {chat.isGroup && (
                      <div className="chat-group-indicator">
                        <Users size={10} />
                      </div>
                    )}
                  </div>
                  <div className="chat-list-content">
                    <div className="chat-list-header">
                      <h4>{chat.name}</h4>
                      <span className="chat-time">{chat.time}</span>
                    </div>
                    <div className="chat-list-message-preview">
                      <p>{chat.lastMessage}</p>
                      {chat.unread > 0 && <span className="chat-unread">{chat.unread}</span>}
                    </div>
                    {chat.isGroup && (
                      <div className="chat-list-meta">
                        <span>{chat.online} online</span>
                        <span className="chat-list-dot">•</span>
                        <span>{chat.members} members</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="chat-no-results">
                <div className="chat-no-results-icon">
                  <Search size={32} />
                </div>
                <p>No conversations found</p>
                <button
                  className="chat-reset-search"
                  onClick={() => {
                    setSearchQuery("")
                    setChatFilter("all")
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="chat-main">
          {activeChat === null ? (
            <div className="chat-placeholder">
              <p>Select a chat to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-header-avatar">{chats[activeChat] && getAvatar(chats[activeChat])}</div>
                  <div className="chat-header-text">
                    <h3>{chats[activeChat]?.name}</h3>
                    {chats[activeChat]?.isGroup ? (
                      <span>
                        {chats[activeChat]?.online} online • {chats[activeChat]?.members} members
                      </span>
                    ) : (
                      <span>{chats[activeChat]?.status === "online" ? "Online" : "Offline"}</span>
                    )}
                  </div>
                </div>

                <div className="chat-header-actions">
                  <button className="chat-header-button" data-tooltip="Call">
                    <Phone size={20} />
                  </button>
                  <button className="chat-header-button" data-tooltip="Video">
                    <Video size={20} />
                  </button>
                  <button className="chat-header-button" data-tooltip="Search">
                    <Search size={20} />
                  </button>
                  <button className="chat-header-button" data-tooltip="Info">
                    <Info size={20} />
                  </button>
                  <button className="chat-header-button" onClick={() => setActiveChat(null)} data-tooltip="Close">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div className="chat-messages" ref={messageListRef}>
                <div className="chat-date-divider">
                  <span>Today</span>
                </div>

                {messages.map((message, index) => {
                  // Check if we should show sender name again (for group conversations)
                  const showSender =
                    index === 0 ||
                    messages[index - 1].sender !== message.sender ||
                    messages[index - 1].isMe !== message.isMe

                  return (
                    <div
                      key={message.id}
                      className={`chat-message ${message.isMe ? "chat-message-out" : "chat-message-in"} ${
                        showSender ? "" : "chat-message-continued"
                      }`}
                    >
                      {!message.isMe && showSender && (
                        <div className="chat-message-avatar">{getMessageAvatar(message)}</div>
                      )}
                      <div className="chat-message-content">
                        {!message.isMe && showSender && <p className="chat-message-sender">{message.sender}</p>}
                        <div className="chat-message-bubble">
                          <p>{message.text}</p>
                          <span className="chat-message-time">{message.time}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef}></div>
              </div>

              {/* Chat input */}
              <div className="chat-input-container">
                <div className="chat-input-actions">
                  <div className="chat-input-buttons">
                    <button
                      className={`chat-input-button ${showEmojiPicker ? "active" : ""}`}
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker)
                        setShowAttachMenu(false)
                      }}
                    >
                      <Smile size={22} />
                    </button>
                    <div className={`emoji-picker-container ${showEmojiPicker ? "show" : ""}`} ref={emojiPickerRef}>
                      <div className="emoji-picker">
                        <div className="emoji-picker-header">
                          <h4>Emojis</h4>
                          <button onClick={() => setShowEmojiPicker(false)}>
                            <X size={14} />
                          </button>
                        </div>
                        <div className="emoji-picker-content">
                          <div className="emoji-grid">
                            {[
                              "😊",
                              "😂",
                              "❤️",
                              "👍",
                              "🙏",
                              "🔥",
                              "✨",
                              "😎",
                              "😁",
                              "🤣",
                              "😍",
                              "🥳",
                              "😇",
                              "🤔",
                              "👏",
                              "🎉",
                            ].map((emoji) => (
                              <button
                                key={emoji}
                                className="emoji-item"
                                onClick={() => {
                                  setMessage(message + emoji)
                                  setShowEmojiPicker(false)
                                  inputRef.current?.focus()
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`chat-input-button ${showAttachMenu ? "active" : ""}`}
                      onClick={() => {
                        setShowAttachMenu(!showAttachMenu)
                        setShowEmojiPicker(false)
                      }}
                    >
                      <Paperclip size={22} />
                    </button>
                    <div className={`attach-menu-container ${showAttachMenu ? "show" : ""}`} ref={attachMenuRef}>
                      <div className="attach-menu">
                        <button className="attach-menu-item">
                          <div className="attach-menu-icon image-icon">
                            <ImageIcon size={20} />
                          </div>
                          <span>Image</span>
                        </button>
                        <button className="attach-menu-item">
                          <div className="attach-menu-icon file-icon">
                            <File size={20} />
                          </div>
                          <span>Document</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onClick={() => {
                        setShowEmojiPicker(false);
                        setShowAttachMenu(false);
                      }}
                    />
                    {message.trim() === "" ? (
                      <button type="button" className="chat-input-mic">
                        <Mic size={20} />
                      </button>
                    ) : (
                      <button type="submit" className="chat-input-send">
                        <Send size={20} />
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage
