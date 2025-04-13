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
  Bell,
} from "lucide-react"
import { io } from "socket.io-client"
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'
import NewChatModal from "../components/NewChatModal"
import ChatRequestsModal from "../components/ChatRequestsModal"
import "../styles/ChatPage.css"

function ChatPage() {
  const navigate = useNavigate()
  const [activeChat, setActiveChat] = useState(null)
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)
  const [chatFilter, setChatFilter] = useState("all")
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [user, setUser] = useState(null)
  const [keyPair, setKeyPair] = useState(null)
  const [publicKeys, setPublicKeys] = useState({})
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [showRequestsModal, setShowRequestsModal] = useState(false)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768)

  const messagesEndRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const attachMenuRef = useRef(null)
  const messageListRef = useRef(null)
  const inputRef = useRef(null)
  
  useEffect(() => {
    const savedKeyPair = localStorage.getItem('encryptionKeys')
    
    if (savedKeyPair) {
      setKeyPair(JSON.parse(savedKeyPair))
    } else {
      const encrypt = new JSEncrypt({ default_key_size: 2048 })
      const publicKey = encrypt.getPublicKey()
      const privateKey = encrypt.getPrivateKey()
      
      const newKeyPair = { publicKey, privateKey }
      setKeyPair(newKeyPair)
      localStorage.setItem('encryptionKeys', JSON.stringify(newKeyPair))
    }
  }, [])

  useEffect(() => {
    const userJson = localStorage.getItem('user')
    if (!userJson) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(userJson)
    setUser(userData)
    
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('authToken')
      }
    })
    
    setSocket(newSocket)
    
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server')
      
      if (keyPair) {
        newSocket.emit('share_public_key', { 
          userId: userData.regno,
          publicKey: keyPair.publicKey 
        })
      }
    })
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected to Socket.IO server after ${attemptNumber} attempts`);
    });
    
    newSocket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
    });
    
    newSocket.on('public_keys', (keys) => {
      setPublicKeys(keys)
    })
    
    newSocket.on('receive_message', (encryptedData) => {
      if (!keyPair) return
      
      try {
        const decrypt = new JSEncrypt()
        decrypt.setPrivateKey(keyPair.privateKey)
        const symmetricKey = decrypt.decrypt(encryptedData.encryptedKey)
        
        const decryptedBytes = CryptoJS.AES.decrypt(
          encryptedData.encryptedMessage,
          symmetricKey
        )
        
        const decryptedMessage = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8))
        
        if (decryptedMessage.chatId === activeChat) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: decryptedMessage.sender,
            text: decryptedMessage.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: decryptedMessage.sender === userData.regno
          }])
          
          setShouldScrollToBottom(true)
        }
        
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === decryptedMessage.chatId 
              ? { 
                  ...chat, 
                  lastMessage: `${decryptedMessage.sender === userData.regno ? 'You' : decryptedMessage.senderName}: ${decryptedMessage.text}`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  unread: decryptedMessage.sender === userData.regno || activeChat === chat.id ? 0 : chat.unread + 1 
                }
              : chat
          )
        )
      } catch (error) {
        console.error('Error decrypting message:', error)
      }
    })
    
    newSocket.on('chat_request', (data) => {
      console.log('New chat request received:', data)
      setPendingRequests(prev => prev + 1)
      
      const notification = new Notification('New Message Request', {
        body: `${data.senderName} wants to start a conversation with you.`,
        icon: '/images/lpu-logo.png'
      })
      
      notification.onclick = () => {
        setShowRequestsModal(true)
        window.focus()
      }
    })
    
    newSocket.on('chat_request_accepted', (data) => {
      console.log('Chat request accepted:', data)
      fetchChats(userData.regno)
    })
    
    newSocket.on('error', (error) => {
      console.error('Socket.IO error:', error)
    })
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
    })
    
    fetchChats(userData.regno)
    
    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [keyPair, navigate])

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chat-requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setPendingRequests(data.length)
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error)
      }
    }
    
    // Fetch pending requests immediately when user is set
    if (user) {
      fetchPendingRequests()
    }
    
    // Set up interval to refresh pending requests every 30 seconds
    const intervalId = setInterval(() => {
      if (user) {
        fetchPendingRequests()
      }
    }, 30000)
    
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [user])

  const fetchChats = async (userId) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/chats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch chats')
      
      const data = await response.json()
      setChats(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching chats:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeChat !== null && user) {
      fetchMessages(activeChat, user.regno)
    }
  }, [activeChat, user])
  
  const fetchMessages = async (chatId, userId) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch messages')
      
      const data = await response.json()
      
      const formattedMessages = data.map(msg => ({
        id: msg._id,
        sender: msg.sender,
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: msg.sender === userId
      }))
      
      setMessages(formattedMessages)
      setLoading(false)
      
      if (socket) {
        socket.emit('mark_messages_read', { chatId, userId })
        
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === chatId ? { ...chat, unread: 0 } : chat
          )
        )
      }
      
      setShouldScrollToBottom(true)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setLoading(false)
    }
  }

  const sendEncryptedMessage = (text, chatId, recipientId) => {
    if (!socket || !keyPair) return
    
    try {
      const recipientPublicKey = publicKeys[recipientId]
      if (!recipientPublicKey) {
        console.error('Recipient public key not found')
        return
      }
      
      const symmetricKey = CryptoJS.lib.WordArray.random(16).toString()
      
      const messageObj = {
        chatId,
        sender: user.regno,
        senderName: user.name,
        text,
        timestamp: new Date().toISOString()
      }
      
      const encryptedMessage = CryptoJS.AES.encrypt(
        JSON.stringify(messageObj),
        symmetricKey
      ).toString()
      
      const encrypt = new JSEncrypt()
      encrypt.setPublicKey(recipientPublicKey)
      const encryptedKey = encrypt.encrypt(symmetricKey)
      
      socket.emit('send_message', {
        to: recipientId,
        encryptedMessage,
        encryptedKey
      })
      
      const newMessage = {
        id: Date.now(),
        sender: user.regno,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }
      
      setMessages(prev => [...prev, newMessage])
      setShouldScrollToBottom(true)
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { 
                ...chat, 
                lastMessage: `You: ${text}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            : chat
        )
      )
    } catch (error) {
      console.error('Error encrypting/sending message:', error)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim() === "" || !activeChat) return
    
    const currentChat = chats.find(chat => chat.id === activeChat)
    if (!currentChat) return
    
    const recipientId = currentChat.isGroup 
      ? currentChat.id 
      : currentChat.participants.find(p => p !== user.regno)
      
    sendEncryptedMessage(message.trim(), activeChat, recipientId)
    setMessage("")
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  const handleBackdropClick = () => {
    setMobileSidebarOpen(false);
  };

  const getAvatar = (chat) => {
    if (!chat) {
      return (
        <div className="chat-avatar-text">
          ??
        </div>
      );
    }
    
    if (chat.avatar) {
      return (
        <div className="chat-avatar-wrapper">
          <img src={`http://localhost:5000${chat.avatar}`} alt={chat.name || 'User'} className="chat-avatar-img" />
        </div>
      );
    } else {
      return (
        <div className="chat-avatar-text">
          {chat.name
            ? chat.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .substring(0, 2)
            : "??"}
        </div>
      );
    }
  };

  const getMessageAvatar = (message) => {
    const sender = chats.find((c) => c.id === activeChat)?.participants.find(p => p === message.sender);
    if (sender && sender.avatar) {
      return (
        <img src={`http://localhost:5000${sender.avatar}`} alt={message.sender || 'User'} />
      );
    } else {
      return (
        <div className="chat-message-avatar-placeholder">
          {message.sender ? message.sender.substring(0, 2) : "??"}
        </div>
      );
    }
  };

  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        showAttachMenu &&
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target)
      ) {
        setShowAttachMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker, showAttachMenu]);

  useEffect(() => {
    document.body.classList.add("chat-page-active");
    return () => {
      document.body.classList.remove("chat-page-active");
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSendChatRequest = async (data) => {
    try {
      setSendingRequest(true);
      
      // Make only the API call, and the server will handle the socket emission
      const response = await fetch('http://localhost:5000/api/chat-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send chat request');
      }
      
      setShowNewChatModal(false);
      
      alert('Chat request sent successfully. You can send another message once they accept your request.');
    } catch (error) {
      console.error('Error sending chat request:', error);
      alert('Failed to send chat request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action: 'accept' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept chat request');
      }
      
      const data = await response.json();
      
      if (user) {
        fetchChats(user.regno);
      }
      
      setPendingRequests(prev => Math.max(0, prev - 1));
      
      if (data.chatId) {
        setActiveChat(data.chatId);
        setShowRequestsModal(false);
      }
      
      return data.chatId;
    } catch (error) {
      console.error('Error accepting chat request:', error);
      alert('Failed to accept chat request. Please try again.');
      return null;
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action: 'reject' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject chat request');
      }
      
      setPendingRequests(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error rejecting chat request:', error);
      alert('Failed to reject chat request. Please try again.');
      return false;
    }
  };

  const filteredChats = chats.filter((chat) => {
    // Check if chat and chat.name are defined before using toLowerCase()
    const matchesSearch = chat?.name 
      ? chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    const matchesFilter = chatFilter === "all" || chat?.type === chatFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="chat-page-wrapper">
      <div className="chat-page">
        {mobileSidebarOpen && isMobileView && <div className="chat-sidebar-backdrop" onClick={handleBackdropClick}></div>}
        <div className={`chat-sidebar ${isMobileView && !mobileSidebarOpen ? "chat-sidebar-close" : "chat-sidebar-open"}`}>
          <div className="chat-sidebar-header">
            <div className="chat-title">
              <h2>Chats</h2>
              <span className="chat-count">{chats.length}</span>
            </div>
            <div className="chat-actions">
              <button 
                className="chat-action-button"
                onClick={() => setShowNewChatModal(true)}
                title="Start new chat"
              >
                <Plus size={20} />
              </button>
              <button 
                className="chat-action-button notification-button"
                onClick={() => setShowRequestsModal(true)}
                title="Message requests"
              >
                <Bell size={20} />
                {pendingRequests > 0 && (
                  <span className="notification-badge">{pendingRequests}</span>
                )}
              </button>
              <button className="chat-action-button">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
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
          <div className="chat-list">
            {loading ? (
              <div className="chat-loading">Loading conversations...</div>
            ) : filteredChats.length > 0 ? (
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
                <button className="chat-reset-search" onClick={() => {
                  setSearchQuery("")
                  setChatFilter("all")
                }}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="chat-main">
          {activeChat === null ? (
            <div className="chat-placeholder">
              <p>Select a chat to start messaging</p>
            </div>
          ) : loading ? (
            <div className="chat-loading-messages">
              <div className="loading-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button 
                  className="mobile-menu-button"
                  onClick={() => setMobileSidebarOpen(true)}
                  style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
                >
                  <Menu size={20} />
                </button>
                
                <div className="chat-header-info">
                  <div className="chat-header-avatar">
                    {chats.find(c => c.id === activeChat) && getAvatar(chats.find(c => c.id === activeChat))}
                  </div>
                  <div className="chat-header-text">
                    <h3>{chats.find(c => c.id === activeChat)?.name || 'Unknown'}</h3>
                    {chats.find(c => c.id === activeChat)?.isGroup ? (
                      <span>
                        {chats.find(c => c.id === activeChat)?.online || 0} online • {chats.find(c => c.id === activeChat)?.members || 0} members
                      </span>
                    ) : (
                      <span>
                        {chats.find(c => c.id === activeChat)?.status === "online" ? "Online" : "Offline"}
                      </span>
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
              <div className="chat-messages" ref={messageListRef}>
                <div className="chat-date-divider">
                  <span>Today</span>
                </div>

                {messages.map((message, index) => {
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
                              "😊", "😂", "❤️", "👍", "🙏", "🔥", "✨", "😎",
                              "😁", "🤣", "😍", "🥳", "😇", "🤔", "👏", "🎉",
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

        {showNewChatModal && (
          <NewChatModal
            onClose={() => setShowNewChatModal(false)}
            onSendRequest={handleSendChatRequest}
            loading={sendingRequest}
          />
        )}
        {showRequestsModal && (
          <ChatRequestsModal
            onClose={() => setShowRequestsModal(false)}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        )}
      </div>
    </div>
  )
}

export default ChatPage
