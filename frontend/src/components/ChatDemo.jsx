import Button from "./Button"
import "../styles/ChatDemo.css"

function ChatDemo() {
  return (
    <div className="chat-demo">
      <div className="chat-header">
        <div className="chat-avatar">
          <img src="/placeholder.svg?height=50&width=50" alt="Chat Avatar" />
        </div>
        <div>
          <p className="chat-name">LPU Campus Group</p>
          <p className="chat-status">15 members online</p>
        </div>
      </div>

      <div className="chat-messages">
        <div className="message-group">
          <div className="message-avatar">
            <div className="avatar-placeholder rp">RP</div>
          </div>
          <div className="message incoming">
            <p className="message-sender">Raj Patel</p>
            <p className="message-text">Has anyone seen the notice about the upcoming cultural fest?</p>
            <p className="message-time">10:30 AM</p>
          </div>
        </div>

        <div className="message-group">
          <div className="message-avatar">
            <div className="avatar-placeholder as">AS</div>
          </div>
          <div className="message incoming">
            <p className="message-sender">Ananya Singh</p>
            <p className="message-text">Yes, it's on the university portal. The fest starts next Monday!</p>
            <p className="message-time">10:32 AM</p>
          </div>
        </div>

        <div className="message outgoing">
          <p className="message-text">Thanks for the info! I'm excited for the dance competition.</p>
          <p className="message-time">10:33 AM</p>
        </div>

        <div className="message-group">
          <div className="message-avatar">
            <div className="avatar-placeholder dk">DK</div>
          </div>
          <div className="message incoming">
            <p className="message-sender">Dr. Kumar</p>
            <p className="message-text">
              All participants should register by Thursday. Please share this with your classmates.
            </p>
            <p className="message-time">10:35 AM</p>
          </div>
        </div>

        <div className="message outgoing">
          <p className="message-text">Will do, Dr. Kumar. Is there a registration fee?</p>
          <p className="message-time">10:36 AM</p>
        </div>
      </div>

      <div className="chat-input">
        <input type="text" placeholder="Type a message..." className="message-input" />
        <Button className="send-button">Send</Button>
      </div>
    </div>
  )
}

export default ChatDemo

