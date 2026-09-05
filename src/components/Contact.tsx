import React, { useState, useEffect, useRef } from 'react';
import { Mail, MessageSquare, User, Send } from 'lucide-react';
import emailjs from "emailjs-com";

// Prop type for TypeScript
interface ContactProps {
  theme: string;
}

// LocalStorage key jaha last successful submit ka time save hoga
const LAST_SUBMIT_KEY = "contact_last_submit_time";
// Cooldown duration: 5 minutes (seconds mein)
const COOLDOWN_SECONDS = 5 * 60;

const Contact = ({ theme }: ContactProps) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false); // button ko turant disable karne ke liye
  const [cooldownLeft, setCooldownLeft] = useState(0); // seconds baaki hain agle message tak
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDark = theme === 'dark';

  // Helper: cooldown timer start/refresh karo based on last submit time
  const startCooldownFromStorage = () => {
    const lastSubmit = Number(localStorage.getItem(LAST_SUBMIT_KEY) || 0);
    if (!lastSubmit) return;

    const elapsedSeconds = Math.floor((Date.now() - lastSubmit) / 1000);
    const remaining = COOLDOWN_SECONDS - elapsedSeconds;

    if (remaining > 0) {
      setCooldownLeft(remaining);
    } else {
      setCooldownLeft(0);
    }
  };

  // Page load hote hi check karo ki pehle se cooldown chal raha hai kya (refresh ke baad bhi kaam kare)
  useEffect(() => {
    startCooldownFromStorage();
  }, []);

  // Cooldown ka countdown chalate raho jab tak 0 na ho jaye
  useEffect(() => {
    if (cooldownLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldownLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Agar already submit ho raha hai, ya cooldown chal raha hai -> kuch mat karo
    // Ye hi wo fix hai jo double/triple click aur bar-bar mail jaane ko rokta hai
    if (isSubmitting || cooldownLeft > 0) {
      return;
    }

    setIsSubmitting(true);

    emailjs.send(
      "service_lnmupbk",   // Service ID
      "template_7t4lekc",  // Template ID
      formData,
      "nLKRj0tdmquxSwETl"    // Public Key
    )
    .then(() => {
      alert(`✅ Thank you ${formData.name}! Message sent successfully.`);
      setFormData({ name: "", email: "", message: "" });

      // Success ke baad hi 5-min cooldown start karo, taaki user turant dubara bhej na sake
      localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
      setCooldownLeft(COOLDOWN_SECONDS);
    })
    .catch((error) => {
      alert("❌ Failed to send message");
      console.log(error);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  };

  // Seconds ko "M:SS" format mein dikhane ke liye
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isButtonDisabled = isSubmitting || cooldownLeft > 0;

  let buttonLabel = 'Send Message';
  if (isSubmitting) buttonLabel = 'Sending...';
  else if (cooldownLeft > 0) buttonLabel = `Wait ${formatTime(cooldownLeft)}`;

  // --- DYNAMIC INPUT STYLE ---
  const dynamicInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '10px',
    // Dark mode mein transparent border, Light mode mein grey border
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #CBD5E1',
    // Dark mode mein dark navy background, Light mode mein pure white
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
    color: isDark ? 'white' : '#1E293B',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: isDark ? "#0B1F3A" : "#F8FAFC", 
      minHeight: "100vh", 
      color: isDark ? "#FFFFFF" : "#1E293B",
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      transition: 'all 0.3s ease'
    }}>
      
      {/* Header Area */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196F3' }}>Contact Us</h2>
        <p style={{ color: isDark ? '#A0AEC0' : '#64748B', marginTop: '10px' }}>Have a question? We'd love to hear from you.</p>
      </div>

      {/* Contact Form Card */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF",
        borderRadius: "20px",
        padding: "25px",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
        boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 20px rgba(0,0,0,0.05)",
        transition: 'all 0.3s ease'
      }}>
        
        {/* Name Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2196F3', fontSize: '14px', fontWeight: '600' }}>
            <User size={16} /> Full Name
          </label>
          <input 
            type="text" 
            placeholder="Enter your name"
            required
            style={dynamicInputStyle}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2196F3', fontSize: '14px', fontWeight: '600' }}>
            <Mail size={16} /> Email Address
          </label>
          <input 
            type="email" 
            placeholder="example@mail.com"
            required
            style={dynamicInputStyle}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        {/* Message Input */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2196F3', fontSize: '14px', fontWeight: '600' }}>
            <MessageSquare size={16} /> Message
          </label>
          <textarea 
            placeholder="How can we help you?"
            rows={4}
            required
            style={{...dynamicInputStyle, height: 'auto', resize: 'none'}}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isButtonDisabled}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: isButtonDisabled ? '#90B8D9' : '#2196F3',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)',
            opacity: isButtonDisabled ? 0.85 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {buttonLabel} <Send size={18} />
        </button>

        {/* Cooldown info - user ko clearly dikhega ki kitni der wait karni hai */}
        {cooldownLeft > 0 && !isSubmitting && (
          <p style={{
            textAlign: 'center',
            marginTop: '12px',
            marginBottom: 0,
            fontSize: '13px',
            color: isDark ? '#A0AEC0' : '#64748B'
          }}>
            You will be able to send the next message in {formatTime(cooldownLeft)} minute.
          </p>
        )}

      </form>

      {/* Extra Info */}
      <div style={{ marginTop: '30px', textAlign: 'center', color: isDark ? '#A0AEC0' : '#64748B', fontSize: '14px' }}>
        <p>Support available: Mon-Fri (9AM - 6PM)</p>
      </div>

      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default Contact;