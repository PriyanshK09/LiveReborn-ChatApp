import Badge from "./Badge"
import "../styles/ChatListItem.css"

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
          {unread > 0 && <Badge className="unread-badge">{unread}</Badge>}
        </div>
        <p className="chat-list-message">{message}</p>
      </div>
    </div>
  )
}

export default ChatListItem

