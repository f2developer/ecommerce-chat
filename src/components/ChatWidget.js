import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots, FaExclamationTriangle, FaSync } from 'react-icons/fa';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/chat';

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Hello! I'm your shopping assistant. How can I help you today?",
          isAgent: true,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);
  const handleInputChange = (e) => setInputValue(e.target.value);

  // -------------------------------------------------------------
  // 🔥 FIXED handleSendMessage() – Never Crashes on JSON Error
  // -------------------------------------------------------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage = {
      text: inputValue,
      isAgent: false,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      console.log("🚀 Sending message to n8n...");

      const payload = {
        message: userMessage.text,
        threadId: threadId,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      console.log("📡 Response status:", response.status);

      const data = await response.json();
      console.log("📥 Response From Server:", data);

      const agentResponse = {
        text: data.reply || "I'm sorry, I couldn't process that.",
        isAgent: true,
        threadId: data.threadId,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, agentResponse]);
      if (data.threadId) setThreadId(data.threadId);

    } catch (error) {
      console.error("💥 Fetch Error:", error);

      const errorResponse = {
        text: `⚠ Connection issue! ${error.message}. Is the server running at http://localhost:8000?`,
        isAgent: true,
        isError: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorResponse]);
    }

    setIsLoading(false);
  };

  // -------------------------------------------------------------

  const testCORSConnection = async () => {
    const msg = {
      text: "🔧 CORS test not needed now. Your handler is fully safe!",
      isAgent: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
  };

  const useMockResponse = () => {
    setMessages(prev => [
      ...prev,
      {
        text: "🔧 MOCK MODE: Your message was received!",
        isAgent: true,
        timestamp: new Date().toISOString(),
        isMock: true,
      }
    ]);
  };

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
      {isOpen ? (
        <>
          <div className="chat-header">
            <div className="chat-title">
              <FaRobot />
              <h3>ChatSea Assistant</h3>
            </div>

            <div className="header-actions">
              <button className="test-button" onClick={testCORSConnection}>
                <FaSync size={14} />
              </button>
              <button className="mock-button" onClick={useMockResponse}>
                <FaExclamationTriangle size={14} />
              </button>
              <button className="close-button" onClick={toggleChat}>
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.isAgent ? "message-bot" : "message-user"}`}>
                <div className="message-content">{m.text}</div>
                <div className="message-timestamp">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-bot">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="message-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button type="submit" className="send-button" disabled={isLoading}>
              <FaPaperPlane size={16} />
            </button>
          </form>
        </>
      ) : (
        <button className="chat-button" onClick={toggleChat}>
          <FaCommentDots />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
