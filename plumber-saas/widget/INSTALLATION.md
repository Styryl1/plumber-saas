# 🚀 PlumberWidget Installation Guide
*Complete GPT-5 Powered AI Chatbot Integration*

## 📋 Quick Overview

The PlumberWidget is a production-ready, GPT-5 powered AI chatbot designed specifically for Dutch plumbing businesses. It provides:

- **GPT-5 Intelligence**: Dynamic reasoning levels with emergency detection
- **Dutch-First Design**: Native emergency detection and cultural optimization  
- **Mobile-Optimized**: One-thumb operation for customers with wet hands
- **GDPR Compliant**: Privacy-by-design with Shadow DOM isolation
- **30-Second Conversion**: Panic-to-booking optimization

---

## 🎯 Installation Methods

### **Method 1: Simple Script Tag (Recommended)**
Perfect for most plumber websites - just copy and paste.

### **Method 2: NPM Package**  
For developers who want more control and customization.

### **Method 3: CDN Integration**
For high-performance scenarios with global distribution.

---

## 🔧 Method 1: Simple Script Tag Installation

### **Step 1: Add Script to Your Website**

Add this single line before the closing `</body>` tag on every page where you want the widget:

```html
<script src="https://cdn.plumberagent.nl/widget/v1/plumber-widget.min.js"></script>
```

### **Step 2: Initialize the Widget**

Add this configuration script right after the widget script:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  PlumberWidget.init({
    // === REQUIRED CONFIGURATION ===
    plumberId: 'your-plumber-id-here', // Get this from your dashboard
    apiKey: 'your-api-key-here',       // Get this from your dashboard
    
    // === BASIC SETTINGS ===
    businessName: 'Loodgietersbedrijf Amsterdam',
    serviceArea: 'Amsterdam en omgeving',
    phoneNumber: '+31 20 123 4567',
    
    // === AI PERSONALITY (Choose one) ===
    personality: 'professional', // Options: 'professional', 'friendly', 'expert', 'casual'
    
    // === EMERGENCY SETTINGS ===
    emergencyAvailable: true,    // 24/7 emergency service?
    emergencyPhone: '+31 6 12345678', // Direct emergency number
    
    // === STYLING OPTIONS ===
    position: 'bottom-right',    // Options: 'bottom-right', 'bottom-left'
    primaryColor: '#2563eb',     // Your brand color
    accentColor: '#1d4ed8',      // Darker shade of brand color
    
    // === ADVANCED OPTIONS (Optional) ===
    enableAnalytics: true,       // Track conversations and performance
    enableFeedback: true,        // Collect customer satisfaction
    debugMode: false,            // Set to true during testing
    
    // === DUTCH LOCALIZATION ===
    language: 'nl',              // Language (nl = Dutch, en = English)
    currency: 'EUR',             // Currency for price quotes
    timezone: 'Europe/Amsterdam', // Timezone for availability
  });
});
</script>
```

### **Step 3: Complete Example**

Here's a complete HTML example for your website:

```html
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loodgietersbedrijf Amsterdam - 24/7 Spoedservice</title>
</head>
<body>
  <!-- Your website content -->
  <h1>Welkom bij Loodgietersbedrijf Amsterdam</h1>
  <p>24/7 beschikbaar voor al uw loodgieterswerkzaamheden...</p>
  
  <!-- PlumberWidget Installation -->
  <script src="https://cdn.plumberagent.nl/widget/v1/plumber-widget.min.js"></script>
  <script>
  document.addEventListener('DOMContentLoaded', function() {
    PlumberWidget.init({
      plumberId: 'amsterdam-loodgieter-001',
      apiKey: 'pk_live_abc123def456ghi789',
      businessName: 'Loodgietersbedrijf Amsterdam',
      serviceArea: 'Amsterdam en omgeving',
      phoneNumber: '+31 20 123 4567',
      personality: 'professional',
      emergencyAvailable: true,
      emergencyPhone: '+31 6 12345678',
      position: 'bottom-right',
      primaryColor: '#2563eb',
      language: 'nl',
    });
  });
  </script>
</body>
</html>
```

---

## 📦 Method 2: NPM Package Installation

### **Step 1: Install Package**

```bash
npm install @plumber-agent/widget
# or
yarn add @plumber-agent/widget
```

### **Step 2: Import and Initialize**

```typescript
// TypeScript/ES6 Import
import { PlumberWidget } from '@plumber-agent/widget';
import '@plumber-agent/widget/dist/styles.css';

// Initialize widget
const widget = new PlumberWidget({
  plumberId: 'your-plumber-id',
  apiKey: 'your-api-key',
  businessName: 'Your Business Name',
  serviceArea: 'Your Service Area',
  phoneNumber: '+31 20 123 4567',
  personality: 'professional',
  emergencyAvailable: true,
});

// Render widget
widget.render();
```

### **Step 3: Framework Integration**

#### **React Integration**
```tsx
import React, { useEffect } from 'react';
import { PlumberWidget } from '@plumber-agent/widget';

const PlumberWidgetComponent: React.FC = () => {
  useEffect(() => {
    const widget = new PlumberWidget({
      plumberId: process.env.REACT_APP_PLUMBER_ID!,
      apiKey: process.env.REACT_APP_WIDGET_API_KEY!,
      businessName: 'Loodgietersbedrijf React',
      serviceArea: 'Nederland',
      phoneNumber: '+31 20 123 4567',
      personality: 'friendly',
      emergencyAvailable: true,
    });

    widget.render();

    // Cleanup on unmount
    return () => {
      widget.destroy();
    };
  }, []);

  return null; // Widget renders itself
};

export default PlumberWidgetComponent;
```

#### **Vue Integration**
```vue
<template>
  <div>
    <!-- Your component content -->
  </div>
</template>

<script>
import { PlumberWidget } from '@plumber-agent/widget';

export default {
  name: 'PlumberWidgetComponent',
  mounted() {
    this.widget = new PlumberWidget({
      plumberId: process.env.VUE_APP_PLUMBER_ID,
      apiKey: process.env.VUE_APP_WIDGET_API_KEY,
      businessName: 'Loodgietersbedrijf Vue',
      serviceArea: 'Nederland',
      phoneNumber: '+31 20 123 4567',
      personality: 'expert',
      emergencyAvailable: true,
    });

    this.widget.render();
  },
  beforeDestroy() {
    if (this.widget) {
      this.widget.destroy();
    }
  },
  data() {
    return {
      widget: null,
    };
  },
};
</script>
```

---

## 🌐 Method 3: CDN Integration

### **High-Performance CDN Setup**

```html
<!-- Latest version with SRI hash for security -->
<script 
  src="https://cdn.plumberagent.nl/widget/v1.2.3/plumber-widget.min.js" 
  integrity="sha384-ABC123DEF456GHI789..." 
  crossorigin="anonymous">
</script>

<!-- CSS for styling (optional - widget has inline styles) -->
<link 
  rel="stylesheet" 
  href="https://cdn.plumberagent.nl/widget/v1.2.3/plumber-widget.min.css"
  integrity="sha384-XYZ789ABC123DEF456..." 
  crossorigin="anonymous">

<script>
PlumberWidget.init({
  plumberId: 'your-plumber-id',
  apiKey: 'your-api-key',
  // ... other configuration
});
</script>
```

---

## 🔐 Getting Your Credentials

### **Step 1: Sign Up**
1. Visit [dashboard.plumberagent.nl](https://dashboard.plumberagent.nl)
2. Create your account with business details
3. Verify your email address

### **Step 2: Get Your Plumber ID**
1. Go to **Settings** → **API Configuration**
2. Copy your unique `plumberId` (e.g., `amsterdam-loodgieter-001`)

### **Step 3: Generate API Key**
1. In **Settings** → **API Configuration**
2. Click **Generate New API Key**
3. Copy the key (starts with `pk_live_` for production)
4. **Store securely** - you won't see it again!

### **Step 4: Configure Domain**
1. Go to **Settings** → **Allowed Domains**
2. Add your website domain(s):
   - `yourdomain.nl`
   - `www.yourdomain.nl`
   - `subdomain.yourdomain.nl`

---

## ⚙️ Configuration Options

### **Required Settings**
```javascript
{
  plumberId: 'your-unique-plumber-id',    // From your dashboard
  apiKey: 'your-api-key',                 // From your dashboard
  businessName: 'Your Business Name',     // Your company name
  serviceArea: 'Your Service Area',       // Where you provide service
  phoneNumber: '+31 20 123 4567',         // Your phone number
}
```

### **AI Personality Options**
```javascript
{
  personality: 'professional', // Professional but warm
  // OR
  personality: 'friendly',     // Friendly and approachable  
  // OR
  personality: 'expert',       // Technical expert
  // OR
  personality: 'casual',       // Relaxed and accessible
}
```

### **Emergency Configuration**
```javascript
{
  emergencyAvailable: true,               // 24/7 emergency service?
  emergencyPhone: '+31 6 12345678',       // Direct emergency number
  emergencyUpcharge: 75,                  // Emergency surcharge in EUR
  emergencyResponseTime: 30,              // Response time in minutes
}
```

### **Styling Options**
```javascript
{
  position: 'bottom-right',               // Widget position
  primaryColor: '#2563eb',                // Your brand color
  accentColor: '#1d4ed8',                 // Darker shade
  borderRadius: '12px',                   // Corner rounding
  fontSize: '16px',                       // Base font size
  fontFamily: 'system-ui, sans-serif',    // Font family
}
```

### **Advanced Options**
```javascript
{
  enableAnalytics: true,                  // Track performance
  enableFeedback: true,                   // Customer satisfaction surveys
  debugMode: false,                       // Debug logging (dev only)
  maxConversationLength: 50,              // Max messages per conversation
  typingSpeed: 50,                        // AI typing simulation speed (ms)
  offlineMessage: 'Momenteel offline',    // Offline status message
}
```

---

## 🧪 Testing Your Installation

### **Step 1: Basic Function Test**
1. Load your website
2. Look for the chat widget in bottom-right corner
3. Click to open and verify it loads

### **Step 2: AI Response Test**  
1. Send a simple message: "Hallo, ik heb een lekke kraan"
2. Verify you get an intelligent Dutch response
3. Check response time is under 3 seconds

### **Step 3: Emergency Detection Test**
1. Send: "Help! Water overal in mijn keuken!"
2. Widget should recognize this as emergency (Level 8-9)
3. Should offer immediate callback/booking

### **Step 4: Booking Flow Test**
1. Follow conversation to booking request
2. Fill out contact form
3. Verify booking appears in your dashboard

### **Step 5: Mobile Test**
1. Test on actual mobile device  
2. Verify one-thumb operation
3. Check emergency flows work on mobile

---

## 🔧 Troubleshooting

### **Widget Not Appearing**

**Check 1: Script Loading**
```javascript
// Add to check if widget loaded
console.log('PlumberWidget available:', typeof PlumberWidget !== 'undefined');
```

**Check 2: Console Errors**
Open browser developer tools (F12) and check for JavaScript errors.

**Check 3: Domain Configuration**
Ensure your domain is added in dashboard **Settings** → **Allowed Domains**.

### **AI Not Responding**

**Check 1: API Key**
```javascript
// Verify API key format
console.log('API Key format:', apiKey.startsWith('pk_live_') ? 'Valid' : 'Invalid');
```

**Check 2: Network Requests**
In browser dev tools → Network tab, check if requests to `api.plumberagent.nl` succeed.

**Check 3: Rate Limits**
You have 1000 AI conversations per month on starter plan. Check usage in dashboard.

### **Styling Issues**

**Check 1: CSS Conflicts**
The widget uses Shadow DOM to prevent conflicts, but check for `!important` overrides.

**Check 2: Z-Index Issues**
Widget uses `z-index: 999999`. If hidden, increase this value:

```javascript
PlumberWidget.init({
  // ... other config
  zIndex: 1000000, // Increase if widget hidden
});
```

### **Mobile Issues**

**Check 1: Viewport Meta Tag**
Ensure you have this in your `<head>`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**Check 2: Touch Events**
Widget auto-detects touch devices. Test with browser dev tools device simulation.

---

## 🚀 Performance Optimization

### **Loading Speed**
```html
<!-- Preload widget for faster loading -->
<link rel="preload" href="https://cdn.plumberagent.nl/widget/v1/plumber-widget.min.js" as="script">

<!-- Or async loading -->
<script async src="https://cdn.plumberagent.nl/widget/v1/plumber-widget.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Wait for async script to load
  function initWidget() {
    if (typeof PlumberWidget !== 'undefined') {
      PlumberWidget.init({
        // your config
      });
    } else {
      setTimeout(initWidget, 100);
    }
  }
  initWidget();
});
</script>
```

### **Bundle Size Optimization**
The widget is optimized to <150KB gzipped:
- Core widget: ~85KB
- AI logic: ~45KB  
- Styling: ~20KB
- Total: <150KB gzipped

### **Caching Strategy**
- Widget files cached for 1 year
- API responses cached for 5 minutes
- Emergency responses never cached

---

## 📊 Analytics & Monitoring

### **Built-in Analytics**
The widget automatically tracks:
- Conversation starts and completions
- Emergency detection accuracy
- Booking conversion rates
- Customer satisfaction scores
- Response times and performance

### **Custom Analytics Integration**

**Google Analytics 4**
```javascript
PlumberWidget.init({
  // ... other config
  onConversationStart: function(data) {
    gtag('event', 'widget_conversation_start', {
      'plumber_id': data.plumberId,
      'session_id': data.sessionId,
    });
  },
  onBookingCreated: function(data) {
    gtag('event', 'widget_booking_created', {
      'conversion_value': data.estimatedValue,
      'urgency_level': data.urgencyLevel,
    });
  },
});
```

**Custom Analytics**
```javascript
PlumberWidget.init({
  // ... other config
  onAnalyticsEvent: function(event, data) {
    // Send to your analytics service
    yourAnalytics.track(event, data);
  },
});
```

---

## 🔒 Security & Privacy

### **GDPR Compliance**
The widget is fully GDPR compliant:
- No cookies without consent
- Data minimization by design
- Right to erasure supported
- Privacy policy integration

### **Data Security**
- All communications encrypted (HTTPS/TLS 1.3)
- API keys never exposed to client
- Shadow DOM prevents data leakage
- CSP headers for additional security

### **Content Security Policy**
Add to your CSP header:
```
script-src 'self' https://cdn.plumberagent.nl;
connect-src 'self' https://api.plumberagent.nl wss://ws.plumberagent.nl;
```

---

## 📞 Support & Help

### **Documentation**
- Full API docs: [docs.plumberagent.nl](https://docs.plumberagent.nl)
- Video tutorials: [help.plumberagent.nl](https://help.plumberagent.nl)

### **Support Channels**
- **Email**: support@plumberagent.nl
- **Chat**: Available in your dashboard
- **Phone**: +31 20 123 4567 (business hours)
- **WhatsApp**: +31 6 12345678 (24/7)

### **Community**
- **Discord**: [discord.gg/plumberagent](https://discord.gg/plumberagent)  
- **GitHub**: [github.com/plumber-agent/widget](https://github.com/plumber-agent/widget)

---

## 🚀 Advanced Features

### **Webhooks**
Receive real-time notifications:
```javascript
PlumberWidget.init({
  // ... other config
  webhooks: {
    bookingCreated: 'https://yourdomain.nl/webhook/booking',
    emergencyDetected: 'https://yourdomain.nl/webhook/emergency',
  },
});
```

### **Custom Prompts**
Customize AI behavior:
```javascript
PlumberWidget.init({
  // ... other config
  customPrompts: {
    greeting: 'Hallo! Ik ben de AI-assistent van [BUSINESS_NAME]. Waarmee kan ik u helpen?',
    emergency: 'Ik begrijp dat dit dringend is. Laten we snel een spoedafspraak inplannen.',
    booking: 'Perfect! Ik ga nu een afspraak voor u inplannen.',
  },
});
```

### **Multi-Language Support**
```javascript
PlumberWidget.init({
  // ... other config
  language: 'nl', // Dutch (default)
  fallbackLanguage: 'en', // English fallback
  autoDetectLanguage: true, // Detect from browser
});
```

---

## 🎉 You're All Set!

Your PlumberWidget is now installed and ready to convert stressed customers into happy bookings. The AI will handle emergency detection, provide instant quotes, and guide customers through the booking process - all while you focus on the actual plumbing work.

**What happens next:**
1. ✅ Widget appears on your website
2. ✅ GPT-5 AI handles customer conversations  
3. ✅ Emergency situations detected automatically
4. ✅ Bookings created directly in your calendar
5. ✅ Analytics tracked in your dashboard
6. ✅ More customers, less stress!

**Need help?** Contact our support team - we're here to help your business succeed.

---

*Last updated: January 19, 2025 - Widget v1.2.3*