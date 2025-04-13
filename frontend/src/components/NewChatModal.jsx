import { useState } from 'react';
import { X } from 'lucide-react';
import "../styles/Modal.css";

function NewChatModal({ onClose, onSendRequest, loading }) {
  const [regno, setRegno] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!regno.trim()) {
      setError('Registration number is required');
      return;
    }
    
    if (!message.trim()) {
      setError('Message is required');
      return;
    }
    
    onSendRequest({ recipient: regno, message });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>New Message</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {error && <div className="modal-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="regno">Registration Number</label>
              <input
                type="text"
                id="regno"
                placeholder="Enter recipient's registration number"
                value={regno}
                onChange={(e) => setRegno(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                placeholder="Write your introduction message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                disabled={loading}
              />
              <p className="form-hint">
                The recipient will need to accept your request before you can continue the conversation.
              </p>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="modal-button cancel" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="modal-button primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
