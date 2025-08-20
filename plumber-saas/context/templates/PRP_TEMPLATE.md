# Product Requirements Prompt (PRP) Template
*Context Engineering for Plumbing Agent Development*

## 🎯 Business Context Layer
### Goal
What specific business problem are we solving?
- **Customer Pain**: Describe the "oh fuck" moment
- **Revenue Impact**: How does this affect €149/month retention?
- **Market Position**: How does this compete with ServiceM8/Jobber?

### Success Metrics
- **Technical KPI**: (e.g., page load < 2s, mobile responsive)
- **Business KPI**: (e.g., 40% reduction in missed calls)  
- **User KPI**: (e.g., 3-click job scheduling)

## 🏗️ Technical Context Layer
### Architecture Context
```
Current System:
- Frontend: Express.js serving static files + language routing
- Backend: Node.js on Railway (port 5000)
- Database: [Specify current state]
- Integrations: Google Maps, WhatsApp, Mollie payments

This Feature Affects:
- [ ] Frontend UI/UX
- [ ] Backend API
- [ ] Database schema  
- [ ] Third-party integrations
- [ ] Mobile responsiveness
```

### Existing Patterns
Reference existing implementations that should be followed:
```javascript
// Example pattern from codebase:
import { Sidebar } from '../components/sidebar.js'
import { APIClient } from '../core/api-client.js'
```

## 📁 Implementation Context Layer
### Required Files
```
Primary Files:
- /dashboard/pages/[page].html
- /js/components/[component].js  
- /js/pages/[page-logic].js
- /css/components.css

Dependencies:
- Library: @schedule-x/calendar@2.1.0
- API: Google Maps (traffic data for Netherlands)
- Integration: WhatsApp Business API

Examples:
- /examples/calendar-dutch-business.js
- /examples/whatsapp-customer-updates.js
```

### Known Gotchas
Critical implementation details that commonly cause issues:
- **Dutch Timezone**: Europe/Amsterdam DST handling
- **BTW Tax Periods**: 21% standard, 9% reduced rate
- **Mobile Touch**: Minimum 44px touch targets
- **Railway Deployment**: Environment variable configuration

## ✅ Validation Context Layer
### Tests Required
```javascript
// Playwright tests (using winning pattern):
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/dashboard/jobs.html');
  
  // Test specific functionality
  const result = await page.evaluate(() => {
    return {
      calendarLoaded: document.querySelector('.schedule-x-calendar') !== null,
      dragDropWorking: typeof window.schedulex !== 'undefined'
    };
  });
  
  console.log('Test Results:', JSON.stringify(result, null, 2));
  await browser.close();
})();
"
```

### Manual Validation Checklist
- [ ] Mobile responsive (iPhone 12 Pro, Samsung Galaxy)
- [ ] Dutch timezone handling (test with DST transition)
- [ ] WhatsApp integration sends customer updates
- [ ] Loading states under 2 seconds
- [ ] Error handling for offline scenarios

## 🔄 Evolution Context Layer
### Current Implementation Scope
What are we building RIGHT NOW in this iteration?

### Future Considerations  
How will this feature evolve?
- **Phase 2**: Marketplace integration with overflow routing
- **Phase 3**: AI-optimized scheduling with traffic prediction
- **Phase 4**: Predictive emergency dispatch patterns

### Technical Debt Notes
What shortcuts are we taking that need future cleanup?

---

## 🚀 AI Agent Instructions
*This section provides specific guidance for AI implementation*

### Code Style Requirements
- Use shared components from `/js/components/`
- Follow mobile-first responsive design
- NO inline JavaScript in HTML files
- Dutch terminology mapping for voice/chat processing

### Testing Requirements  
- NEVER create test files manually
- Use Playwright MCP for browser automation testing
- Follow the 7 success rules for node -e testing patterns

### Deployment Requirements
- Railway auto-deploy via git push
- NEVER restart servers (ask user to restart)
- Test on both localhost:3001 and production domain

### Success Definition
Task is complete when:
1. Feature works on mobile and desktop
2. Passes Playwright automated tests  
3. Integrates with existing shared components
4. Follows Dutch business requirements (BTW, timezone, etc.)
5. User can perform core workflow in under 3 clicks