import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am the Temple Information Assistant. How may I assist your pilgrimage today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'What time does darshan start?',
    'How do I book a darshan slot?',
    'Where is the vehicle parking area?',
    'What is the temple dress code?',
    'How do I cancel my booking?'
  ];

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (questionText = null) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/ask', { question: q });
      if (res.success && res.answer) {
        setMessages((prev) => [...prev, { sender: 'bot', text: res.answer, category: res.category }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Sorry, I could not retrieve information for this query. Please check the Help desk.' }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Temple information server is unreachable right now. Please try again shortly.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Trigger Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: '#b45309',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(180,83,9,0.3)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <MessageSquare size={18} />
          <span>Temple Assistant</span>
        </button>
      )}

      {/* Chat Popup Box */}
      {open && (
        <div
          style={{
            width: '360px',
            height: '490px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#b45309',
              color: '#ffffff',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Temple Information Assistant</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Grounded in live temple rules &amp; timings</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '6px'
                }}
              >
                {m.sender === 'bot' && (
                  <div style={{ background: '#fef3c7', color: '#b45309', padding: '4px', borderRadius: '50%', height: '24px', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    background: m.sender === 'user' ? '#b45309' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : '#0f172a',
                    border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', paddingLeft: '30px' }}>
                Checking temple records...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div style={{ padding: '6px 10px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {quickQuestions.map((qq, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qq)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  fontSize: '0.725rem',
                  color: '#475569',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {qq}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ padding: '8px 10px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px' }}
          >
            <input
              type="text"
              placeholder="Ask a question about your visit..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: '#b45309',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
