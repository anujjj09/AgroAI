import React, { useState, useEffect, useRef } from 'react';
import { API } from '../utils/api';

const ChatTab = ({ user }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello ${user?.name || 'Farmer'}! I'm your AI agricultural assistant. I can help you with crop advice, weather insights, pest management, and market information. What would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      const response = await API.post('/ai-chat', {
        message: userMessage.content,
        userContext: {
          name: user?.name,
          district: user?.district,
          language: user?.language
        }
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What's the best time to plant wheat in Punjab?",
    "How do I identify pest diseases in my crops?",
    "What are current market prices for rice?",
    "How much water does my crop need?",
    "What fertilizer should I use for vegetables?",
    "When is the best time to harvest?"
  ];

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <h2>
            <i className="fas fa-robot"></i>
            AI Agricultural Assistant
          </h2>
          <p>Get personalized farming advice and insights</p>
        </div>
        <div className="chat-status">
          <span className="status-indicator online"></span>
          <span>Online</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'ai' ? (
                <i className="fas fa-robot"></i>
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message ai">
            <div className="message-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="quick-questions">
        <h4>Quick Questions:</h4>
        <div className="questions-grid">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              className="quick-question-btn"
              onClick={() => setNewMessage(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        <div className="chat-input">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about farming, crops, weather, or market prices..."
            rows="2"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
            className="send-button"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      <style jsx>{`
        .chat-container {
          max-width: 1000px;
          margin: 0 auto;
          height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        .chat-header {
          background: white;
          padding: 20px;
          border-radius: 15px 15px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-info h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2E7D32;
          margin: 0 0 5px 0;
        }

        .header-info p {
          color: #666;
          margin: 0;
        }

        .chat-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4CAF50;
          font-weight: 500;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4CAF50;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: white;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .message {
          display: flex;
          gap: 15px;
          max-width: 80%;
        }

        .message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message.ai {
          align-self: flex-start;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .message.ai .message-avatar {
          background: linear-gradient(135deg, #4CAF50, #2E7D32);
          color: white;
        }

        .message.user .message-avatar {
          background: linear-gradient(135deg, #2196F3, #1976D2);
          color: white;
        }

        .message-content {
          flex: 1;
        }

        .message-text {
          background: #f5f5f5;
          padding: 12px 16px;
          border-radius: 15px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message.user .message-text {
          background: #2196F3;
          color: white;
        }

        .message.ai .message-text {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .message-time {
          font-size: 0.75rem;
          color: #999;
          margin-top: 5px;
          text-align: right;
        }

        .message.ai .message-time {
          text-align: left;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: #E8F5E8;
          border-radius: 15px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4CAF50;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .quick-questions {
          background: white;
          padding: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .quick-questions h4 {
          margin: 0 0 15px 0;
          color: #2E7D32;
        }

        .questions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 10px;
        }

        .quick-question-btn {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          padding: 10px 15px;
          border-radius: 20px;
          cursor: pointer;
          text-align: left;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .quick-question-btn:hover {
          background: #E8F5E8;
          border-color: #4CAF50;
          color: #2E7D32;
        }

        .chat-input-container {
          background: white;
          padding: 20px;
          border-radius: 0 0 15px 15px;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }

        .chat-input {
          display: flex;
          gap: 15px;
          align-items: flex-end;
        }

        .chat-input textarea {
          flex: 1;
          border: 2px solid #e0e0e0;
          border-radius: 15px;
          padding: 15px;
          resize: none;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .chat-input textarea:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .send-button {
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          background: #45a049;
          transform: scale(1.05);
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .input-hint {
          font-size: 0.8rem;
          color: #999;
          margin-top: 8px;
          text-center;
        }

        @media (max-width: 768px) {
          .chat-container {
            height: calc(100vh - 80px);
          }

          .message {
            max-width: 90%;
          }

          .questions-grid {
            grid-template-columns: 1fr;
          }

          .chat-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatTab;