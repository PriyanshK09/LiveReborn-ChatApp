import Badge from "./Badge"
import "../styles/ChatHeroDemo.css"

function ChatHeroDemo() {
  return (
    <div className="chat-hero-demo">
      <div className="hero-chat-header">
        <div className="hero-chat-logo">
          <img src="/images/lpu-logo.png" alt="LPU Logo" className="hero-logo-image" />
          <div>
            <p className="hero-chat-title">LPU Live</p>
            <p className="hero-chat-subtitle">Campus Connect</p>
          </div>
        </div>
        <div className="hero-chat-status">
          <Badge variant="outline" className="online-badge">
            Online
          </Badge>
        </div>
      </div>

      <div className="hero-chat-body">
        <div className="hero-chat-sidebar">
          <div className="hero-chat-search">
            <input type="text" placeholder="Search chats..." className="hero-search-input" />
          </div>
          <div className="hero-chat-list">
            <ChatListItem
              name="Campus Announcements"
              message="New event scheduled for next week"
              active={true}
              unread={3}
            />
            <ChatListItem name="Computer Science Dept" message="Project submissions due on Friday" unread={0} />
            <ChatListItem name="Student Council" message="Meeting at 3 PM in the auditorium" unread={5} />
            <ChatListItem name="Hostel Group" message="Maintenance scheduled for tomorrow" unread={0} />
            <ChatListItem name="Sports Committee" message="Basketball tournament registrations open" unread={2} />
          </div>
        </div>

        <div className="hero-chat-main">
          <div className="hero-chat-messages">
            <div className="hero-date-divider">
              <Badge variant="outline" className="date-badge">
                Today
              </Badge>
            </div>

            <div className="hero-message-group">
              <div className="hero-message-avatar">
                <div className="hero-avatar-placeholder">AD</div>
              </div>
              <div className="hero-message incoming">
                <p className="hero-message-sender">Admin</p>
                <p className="hero-message-text">Welcome to LPU Live! This is your campus communication hub.</p>
                <p className="hero-message-time">9:00 AM</p>
              </div>
            </div>

            <div className="hero-message-group">
              <div className="hero-message-avatar">
                <div className="hero-avatar-placeholder">AD</div>
              </div>
              <div className="hero-message incoming">
                <p className="hero-message-sender">Admin</p>
                <p className="hero-message-text">
                  You can join department groups, chat with professors, and stay updated with campus events.
                </p>
                <p className="hero-message-time">9:01 AM</p>
              </div>
            </div>

            <div className="hero-message outgoing">
              <p className="hero-message-text">Thanks! How do I join my department group?</p>
              <p className="hero-message-time">9:05 AM</p>
            </div>

            <div className="hero-message-group">
              <div className="hero-message-avatar">
                <div className="hero-avatar-placeholder">AD</div>
              </div>
              <div className="hero-message incoming">
                <p className="hero-message-sender">Admin</p>
                <p className="hero-message-text">
                  You can go to the 'Groups' tab and search for your department. All official department groups are
                  verified with a checkmark.
                </p>
                <p className="hero-message-time">9:06 AM</p>
              </div>
            </div>

            <div className="hero-message outgoing">
              <p className="hero-message-text">Perfect! And how do I contact my professors directly?</p>
              <p className="hero-message-time">9:08 AM</p>
            </div>

            <div className="hero-message-group">
              <div className="hero-message-avatar">
                <div className="hero-avatar-placeholder">AD</div>
              </div>
              <div className="hero-message incoming">
                <p className="hero-message-sender">Admin</p>
                <p className="hero-message-text">
                  Faculty members are listed in the 'Directory' section. You can start a private chat from there.
                </p>
                <p className="hero-message-time">9:10 AM</p>
              </div>
            </div>
          </div>

          <div className="hero-chat-input">
            <input type="text" placeholder="Type a message..." className="hero-message-input" />
            <button className="hero-send-button">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatListItem({ name, message, active = false, unread = 0 }) {
  return (
    <div className={`chat-list-item ${active ? "active" : ""}`}>
      <div className={`chat-list-avatar ${active ? "active" : ""}`}>
        {name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .substring(0, 2)}
      </div>
      <div className="chat-list-content">
        <div className="chat-list-header">
          <p className={`chat-list-name ${active ? "active" : ""}`}>{name}</p>
          {unread > 0 && <span className="unread-badge">{unread}</span>}
        </div>
        <p className="chat-list-message">{message}</p>
      </div>
    </div>
  )
}

export default ChatHeroDemo

