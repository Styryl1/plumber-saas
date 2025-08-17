# Visual Design System - Widget Implementation

## 🎯 Overview
Complete visual design system for AI chat widget featuring glass morphism styling, mobile optimization, and Dutch brand consistency.

## 🎨 Design Foundation

### **Color System**
```css
/* Primary Brand Colors */
:root {
  --emerald-50: #ecfdf5;
  --emerald-100: #d1fae5;
  --emerald-500: #10b981;
  --emerald-600: #059669;  /* Primary brand */
  --emerald-700: #047857;
  --emerald-900: #064e3b;

  /* Widget-specific colors */
  --widget-primary: var(--emerald-600);
  --widget-secondary: #f3f4f6;
  --widget-text: #1f2937;
  --widget-text-light: #6b7280;
  --widget-bg: #ffffff;
  --widget-overlay: rgba(0, 0, 0, 0.1);
  
  /* Emergency colors */
  --emergency-red: #ef4444;
  --emergency-orange: #f97316;
  --urgent-yellow: #eab308;
}

/* Glass morphism variables */
:root {
  --glass-bg: rgba(255, 255, 255, 0.95);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  --glass-blur: blur(10px);
}
```

### **Typography System**
```css
/* Widget typography scale */
.widget-text {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.widget-text-xs { font-size: 0.75rem; line-height: 1rem; }     /* 12px */
.widget-text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.widget-text-base { font-size: 1rem; line-height: 1.5rem; }   /* 16px */
.widget-text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */

/* Message text styling */
.message-text {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--widget-text);
}

.message-time {
  font-size: 0.75rem;
  color: var(--widget-text-light);
  font-weight: 400;
}
```

## 📱 Widget Container Design

### **Main Widget Component**
```css
/* Widget container with glass morphism */
.plumber-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'Inter', sans-serif;
}

/* Collapsed state - floating button */
.widget-trigger {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--emerald-600), var(--emerald-700));
  box-shadow: var(--glass-shadow);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: var(--glass-blur);
}

.widget-trigger:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(5, 150, 105, 0.3);
}

.widget-trigger:active {
  transform: scale(0.95);
}

/* Widget icon */
.widget-icon {
  width: 28px;
  height: 28px;
  color: white;
  transition: transform 0.3s ease;
}

.widget-open .widget-icon {
  transform: rotate(180deg);
}

/* Expanded state - chat window */
.widget-expanded {
  width: 380px;
  height: 600px;
  background: var(--glass-bg);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: bottom right;
  animation: widgetExpand 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes widgetExpand {
  from {
    transform: scale(0.8) translateY(20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .plumber-widget {
    bottom: 16px;
    right: 16px;
  }
  
  .widget-expanded {
    width: calc(100vw - 32px);
    height: 70vh;
    max-height: 600px;
  }
}
```

### **Header Design**
```css
/* Widget header with gradient */
.widget-header {
  background: linear-gradient(135deg, var(--emerald-600), var(--emerald-700));
  color: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.widget-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1), transparent 50%);
  pointer-events: none;
}

.widget-header-content {
  display: flex;
  align-items: center;
  z-index: 1;
}

.widget-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  backdrop-filter: blur(10px);
}

.widget-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  margin-bottom: 2px;
}

.widget-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
}

.widget-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.widget-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

## 💬 Chat Interface Design

### **Message Bubbles**
```css
/* Messages container */
.widget-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: linear-gradient(to bottom, 
    rgba(255, 255, 255, 0.8), 
    rgba(248, 250, 252, 0.8)
  );
}

/* Message bubble base */
.message {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* User messages (right-aligned) */
.message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, var(--emerald-600), var(--emerald-700));
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
}

/* AI messages (left-aligned) */
.message.ai {
  align-self: flex-start;
  align-items: flex-start;
}

.message.ai .message-bubble {
  background: white;
  color: var(--widget-text);
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Emergency message styling */
.message.emergency .message-bubble {
  background: linear-gradient(135deg, var(--emergency-red), #dc2626);
  color: white;
  border: 2px solid rgba(239, 68, 68, 0.3);
  animation: emergencyPulse 2s ease-in-out infinite;
}

@keyframes emergencyPulse {
  0%, 100% { box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5); }
}

/* Urgent message styling */
.message.urgent .message-bubble {
  background: linear-gradient(135deg, var(--emergency-orange), #ea580c);
  color: white;
  border-left: 4px solid var(--urgent-yellow);
}

/* Message metadata */
.message-time {
  font-size: 0.75rem;
  color: var(--widget-text-light);
  margin-top: 4px;
  margin-bottom: 0;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--widget-text-light);
  animation: typingDot 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}
```

### **Input Area Design**
```css
/* Input container */
.widget-input {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

/* Text input */
.input-field {
  flex: 1;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 0.875rem;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  max-height: 100px;
  min-height: 44px;
  font-family: inherit;
}

.input-field:focus {
  border-color: var(--emerald-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-field::placeholder {
  color: var(--widget-text-light);
}

/* Send button */
.send-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--emerald-600), var(--emerald-700));
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.send-button:active {
  transform: scale(0.95);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
  transform: translateX(1px); /* Optical alignment */
}
```

## 🔴 Emergency UI States

### **Emergency Mode Styling**
```css
/* Emergency mode transforms */
.widget-emergency {
  border: 2px solid var(--emergency-red);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.widget-emergency .widget-header {
  background: linear-gradient(135deg, var(--emergency-red), #dc2626);
  animation: emergencyHeaderPulse 2s ease-in-out infinite;
}

@keyframes emergencyHeaderPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}

.widget-emergency .widget-title::before {
  content: '🚨 ';
  font-size: 1.2em;
}

/* Emergency banner */
.emergency-banner {
  background: linear-gradient(90deg, var(--emergency-red), var(--emergency-orange));
  color: white;
  padding: 8px 16px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  animation: emergencyBannerSlide 0.5s ease-out;
}

@keyframes emergencyBannerSlide {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Urgent call-to-action buttons */
.emergency-cta {
  background: var(--emergency-red);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.emergency-cta:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}
```

### **Loading and Status Indicators**
```css
/* Loading spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid var(--emerald-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Connection status */
.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--widget-text-light);
  padding: 4px 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #10b981;
  animation: statusPulse 2s ease-in-out infinite;
}

.status-dot.offline {
  background: #ef4444;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Message delivery status */
.message-status {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.message-status.sent { color: rgba(255, 255, 255, 0.6); }
.message-status.delivered { color: rgba(255, 255, 255, 0.8); }
.message-status.read { color: var(--emerald-200); }
```

## 📱 Mobile Optimization

### **Touch-Friendly Design**
```css
/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .widget-trigger {
    width: 56px;
    height: 56px;
    bottom: 20px;
    right: 20px;
  }
  
  .widget-expanded {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    max-height: none;
  }
  
  .widget-header {
    padding-top: env(safe-area-inset-top, 20px);
  }
  
  .widget-messages {
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }
  
  .widget-input {
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
  
  /* Larger touch targets */
  .send-button {
    width: 48px;
    height: 48px;
  }
  
  .input-field {
    min-height: 48px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Landscape mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .widget-expanded {
    height: 100vh;
  }
  
  .widget-messages {
    padding: 12px 16px;
  }
}
```

### **Dark Mode Support**
```css
/* Dark mode color scheme */
@media (prefers-color-scheme: dark) {
  :root {
    --widget-bg: #1f2937;
    --widget-text: #f9fafb;
    --widget-text-light: #9ca3af;
    --glass-bg: rgba(31, 41, 55, 0.95);
    --glass-border: rgba(255, 255, 255, 0.1);
  }
  
  .message.ai .message-bubble {
    background: #374151;
    color: var(--widget-text);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .input-field {
    background: #374151;
    border-color: #4b5563;
    color: var(--widget-text);
  }
  
  .input-field::placeholder {
    color: var(--widget-text-light);
  }
}
```

---

**This visual design system provides complete styling patterns for a modern, accessible AI chat widget with glass morphism effects, emergency states, and mobile optimization.**