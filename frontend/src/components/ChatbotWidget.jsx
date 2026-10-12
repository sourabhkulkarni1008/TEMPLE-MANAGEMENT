import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client';
import { audioService } from '../utils/audioService';
import { useDevice } from '../utils/useDevice';
import { MessageSquare, X, Send, Bot, User, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';

const getSmartTempleReply = (query) => {
  const q = query.toLowerCase().trim();
  if (
    q === 'hello' || q === 'hi' || q === 'hey' || q === 'hlo' || q === 'hy' || 
    q.includes('hello') || q.startsWith('hi ') || q === 'namaste' || q.includes('namaskar') || 
    q.includes('pranam') || q.includes('jai ganesh') || q.includes('ganpati') || q.includes('morya') ||
    q.includes('good morning') || q.includes('good evening') || q.includes('good afternoon')
  ) {
    return "🙏 Namaste & Ganpati Bappa Morya! Welcome to Shree Siddhivinayak Temple Virtual Seva. I can assist you with live queue status, digital QR darshan passes, sacred pooja schedules, maha prasad, or temple guidelines. How may I serve your holy pilgrimage today?";
  }
  if (q.includes('how are you') || q.includes('kasa ahes') || q.includes('kaise ho')) {
    return "🙏 I am blessed by Lord Siddhivinayak! Ready 24/7 to guide all devotees on their sacred visit. What information can I help you find?";
  }
  if (q.includes('who are you') || q.includes('what is your name')) {
    return "I am Vinayak Seva AI, the official virtual assistant for Shree Siddhivinayak Temple management system in Prabhadevi, Mumbai.";
  }
  if (q.includes('thank') || q.includes('dhanyawad') || q.includes('shukriya') || q.includes('thanks')) {
    return "🙏 May Lord Siddhivinayak remove all your obstacles (Vighnaharta) and bestow peace, health, and prosperity upon you and your family!";
  }
  if (q.includes('aarti') || q.includes('puja') || q.includes('pooja') || q.includes('time') || q.includes('timing') || q.includes('open') || q.includes('close')) {
    return "🪔 Daily Aarti Timings:\n• 05:00 AM: Suprabhata Seva & Gate Opening\n• 06:00 AM: Morning Kakad Aarti & General Darshan\n• 12:30 PM: Madhyahna Bhog Aarti\n• 07:00 PM: Maha Deeparadhana Evening Aarti\n• 10:30 PM: Shej Aarti & Night Gate Closure";
  }
  if (q.includes('book') || q.includes('pass') || q.includes('ticket') || q.includes('token') || q.includes('cost') || q.includes('price') || q.includes('free') || q.includes('vip')) {
    return "🎟️ Darshan Passes:\n• General Darshan: 100% Free with verified online digital pass.\n• Special VIP Darshan: ₹300 per person (includes fast-track priority entry at Gate 2 & consecrated Modak box).\n• Senior Citizens & Divyangjan: Free priority lane with zero waiting.";
  }
  if (q.includes('crowd') || q.includes('rush') || q.includes('wait') || q.includes('waiting') || q.includes('cctv') || q.includes('density') || q.includes('queue')) {
    return "👥 Live Crowd Status: Currently ~730 pilgrims inside (Low Density / Smooth Flow). Average waiting time is ~12-15 minutes. Least rush window today: 02:00 PM - 04:00 PM.";
  }
  if (q.includes('prasad') || q.includes('prasadam') || q.includes('modak') || q.includes('ladoo') || q.includes('food') || q.includes('annadanam')) {
    return "🥮 Sacred Prasadam:\n• Maha Modak Box (4 Pcs): ₹50\n• Kaju Modak Deluxe (6 Pcs): ₹120\n• Free Annadanam Meals: Served daily at 11:30 AM & 07:30 PM in East Hall.";
  }
  if (q.includes('dress') || q.includes('cloth') || q.includes('wear') || q.includes('rule') || q.includes('guideline') || q.includes('photo')) {
    return "👔 Dress Code: Traditional attire recommended (Dhoti/Kurta for men; Saree/Salwar Kameez for women). Shorts, ripped jeans, and photography inside Garbhagriha are prohibited. Free shoe storage is available at Gate 1 & 2.";
  }
  if (q.includes('wheelchair') || q.includes('senior') || q.includes('elderly') || q.includes('disabled') || q.includes('buggy')) {
    return "♿ Pilgrim Assistance: Free battery-operated buggy shuttles from parking, complimentary wheelchairs at Gate 2, and 24/7 First-Aid medical unit near Exit Arcade.";
  }
  if (q.includes('park') || q.includes('parking') || q.includes('car') || q.includes('bike') || q.includes('metro') || q.includes('station')) {
    return "🚗 Parking & Transit: North & South parking for 300+ cars & 500+ two-wheelers. Nearest station: Dadar (~1.5 km). Nearest Metro: Siddhivinayak Metro Station (Aqua Line 3).";
  }
  return "I can provide details on Darshan Booking, Daily Aarti Schedule, Live Crowd Wait Times, Modak Prasad, Dress Code, Parking, and Senior Citizen assistance. What would you like to know?";
};

const ChatbotWidget = () => {
  const { isMobile } = useDevice();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am Vinayak Seva AI. How may I assist your holy pilgrimage today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    '🪔 Aarti Timings',
    '🎟️ Book Darshan',
    '👥 Live Crowd',
    '🥮 Modak Prasad',
    '👔 Dress Code',
    '🚗 Parking Area'
  ];

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (questionText = null) => {
    const rawQuestion = questionText || input;
    // Strip leading emoji if from chip
    const cleanQ = rawQuestion.replace(/^[^\w\s]+/, '').trim();
    const q = cleanQ || rawQuestion.trim();
    if (!q || loading) return;

    // Fluent resonant bell chime when interacting
    audioService.playTempleBell(1.15, true);
    setMessages((prev) => [...prev, { sender: 'user', text: rawQuestion.trim() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/ask', { question: q });
      if (res.success && res.answer) {
        setMessages((prev) => [...prev, { sender: 'bot', text: res.answer, category: res.category }]);
        audioService.playTempleBell(1.05, false);
      } else {
        const localReply = getSmartTempleReply(q);
        setMessages((prev) => [...prev, { sender: 'bot', text: localReply }]);
        audioService.playTempleBell(1.05, false);
      }
    } catch (err) {
      const localReply = getSmartTempleReply(q);
      setMessages((prev) => [...prev, { sender: 'bot', text: localReply }]);
      audioService.playTempleBell(1.05, false);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: 'Namaste! I am Vinayak Seva AI. How may I assist your holy pilgrimage today?'
      }
    ]);
    audioService.playTempleBell(1.2, true);
  };

  return (
    <div 
      className="vinayak-seva-floating-widget"
      style={{ 
        position: 'fixed', 
        bottom: isMobile ? '76px' : '26px', 
        right: isMobile ? '14px' : '26px', 
        zIndex: 95,
        transition: 'bottom 0.25s ease'
      }}
    >
      {/* Floating Trigger Button */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            audioService.playTempleBell(1.0, true);
          }}
          aria-label="Open Vinayak Seva AI Chat"
          style={{
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #78350f 100%)',
            color: '#ffffff',
            border: '2px solid rgba(254, 240, 138, 0.65)',
            borderRadius: '9999px',
            padding: isMobile ? '8px 14px' : '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(180, 83, 9, 0.4), 0 2px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontSize: isMobile ? '0.8rem' : '0.875rem',
            fontWeight: 700,
            animation: 'floatGentle 3s ease-in-out infinite',
            touchAction: 'manipulation'
          }}
        >
          <div style={{ 
            width: isMobile ? '26px' : '30px', 
            height: isMobile ? '26px' : '30px', 
            borderRadius: '50%', 
            background: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            flexShrink: 0
          }}>
            <img 
              src="/assets/images/siddhivinayak_logo.svg" 
              alt="Ganesha Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Vinayak Seva AI</span>
              <Sparkles size={12} color="#fde047" />
            </div>
            <div style={{ fontSize: '0.625rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span>Tap to Chat</span>
            </div>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Box */}
      {open && (
        <div
          style={{
            position: isMobile ? 'fixed' : 'relative',
            bottom: isMobile ? '74px' : 'auto',
            right: isMobile ? '12px' : 'auto',
            left: isMobile ? '12px' : 'auto',
            width: isMobile ? 'auto' : '380px',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '380px',
            height: isMobile ? 'calc(100vh - 160px)' : '530px',
            maxHeight: isMobile ? '560px' : '530px',
            background: '#ffffff',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #451a03 100%)',
              color: '#ffffff',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '34px', height: '34px', background: '#ffffff', borderRadius: '50%', padding: '2px', boxShadow: '0 0 10px rgba(245,158,11,0.4)', flexShrink: 0 }}>
                <img src="/assets/images/siddhivinayak_logo.svg" alt="Siddhivinayak Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', border: '1.5px solid #0f172a' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Vinayak Seva AI</span>
                  <span style={{ fontSize: '0.6rem', background: 'rgba(245,158,11,0.25)', color: '#fde047', border: '1px solid rgba(245,158,11,0.5)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>24/7 LIVE</span>
                </div>
                <div style={{ fontSize: '0.675rem', color: '#94a3b8' }}>Official Temple Darshan &amp; Flow Assistant</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ffffff', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '8px'
                }}
              >
                {m.sender === 'bot' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ffffff', border: '1px solid #f59e0b', padding: '2px', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                    <img src="/assets/images/siddhivinayak_logo.svg" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-line',
                    background: m.sender === 'user' ? '#b45309' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : '#0f172a',
                    border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '34px', fontSize: '0.775rem', color: '#b45309' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>Consulting holy shrine records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div style={{ padding: '6px 10px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {quickQuestions.map((qq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qq)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 0.15s ease'
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
            style={{ padding: '8px 10px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <input
              type="text"
              placeholder="Ask about pooja, pass, crowd, or rules..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '16px', // Prevents iOS mobile auto-zoom
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send query"
              style={{
                background: '#b45309',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 14px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.6 : 1,
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
