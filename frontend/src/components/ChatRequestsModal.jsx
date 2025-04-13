import { useState, useEffect } from 'react';
import { X, Check, X as XIcon } from 'lucide-react';
import "../styles/Modal.css";

function ChatRequestsModal({ onClose, onAccept, onReject }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchChatRequests();
  }, []);

  const fetchChatRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/chat-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat requests');
      }
      
      const data = await response.json();
      console.log("Chat requests data:", data); // Debug log to see what's coming from backend
      setRequests(data);
    } catch (error) {
      console.error('Error fetching chat requests:', error);
      setError('Failed to load chat requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setProcessingId(requestId);
      const chatId = await onAccept(requestId);
      if (chatId) {
        setRequests(requests.filter(req => req.id !== requestId));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessingId(requestId);
      const success = await onReject(requestId);
      if (success) {
        setRequests(requests.filter(req => req.id !== requestId));
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getAvatar = (request) => {
    // Handle the case when request is undefined
    if (!request) {
      return (
        <div className="request-avatar-text">
          ??
        </div>
      );
    }

    if (request.senderAvatar) {
      return (
        <img 
          src={`http://localhost:5000${request.senderAvatar}`} 
          alt={request.senderName || 'User'} 
          className="request-avatar-img" 
        />
      );
    } else {
      // Provide a text avatar with the sender's initials
      const initials = request.senderName 
        ? request.senderName
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : (request.sender || "??").substring(0, 2).toUpperCase();

      return (
        <div className="request-avatar-text">
          {initials}
        </div>
      );
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content request-modal">
        <div className="modal-header">
          <h3>Message Requests</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {error && <div className="modal-error">{error}</div>}
          
          {loading ? (
            <div className="request-loading">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="request-empty">
              <p>No pending message requests</p>
            </div>
          ) : (
            <div className="request-list">
              {requests.map(request => (
                <div key={request.id} className="request-item">
                  <div className="request-avatar">
                    {getAvatar(request)}
                  </div>
                  <div className="request-content">
                    <div className="request-header">
                      <h4>{request.senderName || 'User ' + request.sender}</h4>
                      <span>{request.sender || 'Unknown'}</span>
                    </div>
                    <p className="request-message">{request.message || 'No message'}</p>
                    <div className="request-timestamp">
                      {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Unknown time'}
                    </div>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="request-button accept"
                      onClick={() => handleAccept(request.id)}
                      disabled={processingId === request.id}
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      className="request-button reject"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatRequestsModal;
