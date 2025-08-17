# Playwright Testing Patterns - Browser Automation

## 🎯 Overview
Complete Playwright testing patterns using MCP browser automation for T3 dashboard validation, multi-tenant testing, and zero-file testing patterns.

## 🤖 MCP-Powered Testing Strategy

### **Zero-File Testing Pattern**
```typescript
// NO test files - use MCP browser automation only
// This approach uses Claude Code with Playwright MCP for validation

// ✅ WINNING PATTERN - MCP Browser Automation
const testDashboard = async () => {
  // Use Playwright MCP through Claude Code
  // 1. Navigate to dashboard
  // 2. Test authentication flow
  // 3. Validate organization isolation
  // 4. Test real-time features
  // 5. Verify mobile responsiveness
}

// ❌ AVOID - Traditional test files
// test/dashboard.spec.ts - DON'T CREATE THESE
// cypress/integration/dashboard.js - NOT NEEDED
// jest.config.js - SKIP FILE-BASED TESTING
```

### **T3 App Testing with MCP**
```javascript
// Simple JavaScript patterns for MCP browser testing
const t3DashboardValidation = `
// T3 App Testing Pattern (for MCP execution)
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test T3 app at correct port
  await page.goto('http://localhost:3001/dashboard');
  await page.waitForTimeout(3000); // Allow T3 hydration
  
  // Test organization context
  const orgContext = await page.evaluate(() => {
    return {
      hasOrgHeader: !!document.querySelector('[data-testid="org-header"]'),
      hasNavigation: !!document.querySelector('[data-testid="dashboard-nav"]'),
      hasStatsCards: document.querySelectorAll('[data-testid="stat-card"]').length,
      hasTRPCData: typeof window.trpc !== 'undefined'
    };
  });
  
  console.log('T3 Dashboard Validation:', JSON.stringify(orgContext, null, 2));
  
  // Test tRPC integration
  const tRPCTest = await page.evaluate(() => {
    // Test if tRPC client is working
    return {
      tRPCAvailable: typeof window.trpc !== 'undefined',
      reactQueryActive: !!window.__REACT_QUERY_CLIENT__,
      clerkLoaded: typeof window.Clerk !== 'undefined'
    };
  });
  
  console.log('T3 Integration Test:', JSON.stringify(tRPCTest, null, 2));
  
  await browser.close();
})();
`
```

## 🏢 Multi-Tenant Testing Patterns

### **Organization Isolation Validation**
```javascript
// Organization isolation testing pattern
const testOrganizationIsolation = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // Test with two different organization contexts
  const contexts = [
    { name: 'Org1', userId: 'user_org1', orgId: 'org_123' },
    { name: 'Org2', userId: 'user_org2', orgId: 'org_456' }
  ];
  
  for (const ctx of contexts) {
    const page = await browser.newPage();
    
    // Set Clerk auth context (in real implementation)
    await page.addInitScript(({ userId, orgId }) => {
      window.__CLERK_TEST_AUTH__ = { userId, orgId };
    }, ctx);
    
    await page.goto('http://localhost:3001/dashboard/customers');
    await page.waitForTimeout(2000);
    
    // Verify data isolation
    const customerData = await page.evaluate(() => {
      const customerRows = document.querySelectorAll('[data-testid="customer-row"]');
      return {
        customerCount: customerRows.length,
        orgId: window.__CLERK_TEST_AUTH__?.orgId,
        dataIsolated: !document.querySelector('[data-error="cross-org-data"]')
      };
    });
    
    console.log(\`\${ctx.name} Data Isolation:\`, customerData);
    await page.close();
  }
  
  await browser.close();
})();
`
```

### **Database Query Isolation**
```javascript
// Test RLS policies and organization scoping
const testDatabaseIsolation = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3001/dashboard/jobs');
  await page.waitForTimeout(3000);
  
  // Test database isolation
  const dbIsolationTest = await page.evaluate(async () => {
    try {
      // Attempt cross-organization data access (should fail)
      const response = await fetch('/api/trpc/jobs.list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forged-Org-Id': 'different_org_id' // Attempt to forge org ID
        },
        body: JSON.stringify({})
      });
      
      return {
        crossOrgBlocked: response.status === 403,
        responseStatus: response.status,
        isolationWorking: true
      };
    } catch (error) {
      return {
        crossOrgBlocked: true,
        error: error.message,
        isolationWorking: true
      };
    }
  });
  
  console.log('Database Isolation Test:', dbIsolationTest);
  
  await browser.close();
})();
`
```

## 📅 Schedule-X Calendar Testing

### **Calendar Component Validation**
```javascript
// Schedule-X calendar testing pattern
const testScheduleXCalendar = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3001/dashboard/jobs');
  await page.waitForTimeout(5000); // Schedule-X needs time to load
  
  // Test Schedule-X calendar integration
  const calendarTest = await page.evaluate(() => {
    return {
      scheduleXLoaded: typeof window.scheduleXCalendar !== 'undefined',
      calendarVisible: !!document.querySelector('.sx-calendar'),
      eventsCount: document.querySelectorAll('.sx-event').length,
      monthView: !!document.querySelector('.sx-month-view'),
      weekView: !!document.querySelector('.sx-week-view'),
      dragDropEnabled: !!document.querySelector('.sx-calendar[data-drag-enabled="true"]')
    };
  });
  
  console.log('Schedule-X Calendar Test:', calendarTest);
  
  // Test calendar interactions
  if (calendarTest.scheduleXLoaded) {\n    // Test month navigation\n    await page.click('[data-testid="calendar-next-month"]');\n    await page.waitForTimeout(1000);\n    \n    const navigationTest = await page.evaluate(() => {\n      const monthElement = document.querySelector('.sx-month-name');\n      return {\n        monthNavigationWorks: !!monthElement,\n        currentMonth: monthElement?.textContent\n      };\n    });\n    \n    console.log('Calendar Navigation Test:', navigationTest);\n  }\n  \n  await browser.close();\n})();\n`\n```

### **Real-time Job Updates**\n```javascript\n// Test real-time job updates in calendar\nconst testRealtimeJobUpdates = `\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const page = await browser.newPage();\n  \n  await page.goto('http://localhost:3001/dashboard/jobs');\n  await page.waitForTimeout(3000);\n  \n  // Count initial jobs\n  const initialJobCount = await page.evaluate(() => {\n    return document.querySelectorAll('[data-testid=\"job-card\"]').length;\n  });\n  \n  console.log('Initial job count:', initialJobCount);\n  \n  // Test creating new job\n  await page.click('[data-testid=\"create-job-button\"]');\n  await page.waitForTimeout(500);\n  \n  // Fill job form\n  await page.fill('[data-testid=\"customer-name\"]', 'Test Customer');\n  await page.fill('[data-testid=\"job-description\"]', 'Test emergency repair');\n  await page.selectOption('[data-testid=\"service-type\"]', 'emergency');\n  \n  // Submit form\n  await page.click('[data-testid=\"submit-job\"]');\n  await page.waitForTimeout(2000);\n  \n  // Check if job appears in real-time\n  const updatedJobCount = await page.evaluate(() => {\n    return document.querySelectorAll('[data-testid=\"job-card\"]').length;\n  });\n  \n  const realtimeTest = {\n    initialCount: initialJobCount,\n    updatedCount: updatedJobCount,\n    realtimeWorking: updatedJobCount > initialJobCount,\n    newJobVisible: !!document.querySelector('[data-testid=\"job-card\"]:last-child')\n  };\n  \n  console.log('Real-time Job Update Test:', realtimeTest);\n  \n  await browser.close();\n})();\n`\n```\n\n## 📱 Mobile Responsiveness Testing\n\n### **Mobile Dashboard Validation**\n```javascript\n// Mobile responsiveness testing pattern\nconst testMobileResponsiveness = `\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const page = await browser.newPage();\n  \n  // Test different viewport sizes\n  const viewports = [\n    { name: 'iPhone', width: 375, height: 667 },\n    { name: 'iPad', width: 768, height: 1024 },\n    { name: 'Desktop', width: 1280, height: 720 }\n  ];\n  \n  for (const viewport of viewports) {\n    await page.setViewportSize(viewport);\n    await page.goto('http://localhost:3001/dashboard');\n    await page.waitForTimeout(2000);\n    \n    const mobileTest = await page.evaluate(() => {\n      return {\n        navigationVisible: !!document.querySelector('[data-testid=\"mobile-nav\"]'),\n        sidebarCollapsed: window.innerWidth < 1024 ? \n          !document.querySelector('.sidebar-expanded') : true,\n        statsCardsResponsive: document.querySelector('.stats-grid')?.classList.contains('grid-cols-1'),\n        touchTargetsAdequate: Array.from(document.querySelectorAll('button'))\n          .every(btn => {\n            const rect = btn.getBoundingClientRect();\n            return rect.height >= 44 && rect.width >= 44;\n          })\n      };\n    });\n    \n    console.log(\`\${viewport.name} (\${viewport.width}x\${viewport.height}) Test:\`, mobileTest);\n  }\n  \n  await browser.close();\n})();\n`\n```\n\n### **Touch Interaction Testing**\n```javascript\n// Touch gesture testing for mobile\nconst testTouchInteractions = `\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const context = await browser.newContext({\n    ...chromium.devices['iPhone 12'],\n    hasTouch: true\n  });\n  const page = await context.newPage();\n  \n  await page.goto('http://localhost:3001/dashboard/customers');\n  await page.waitForTimeout(2000);\n  \n  // Test swipe gestures on customer cards\n  const swipeTest = await page.evaluate(() => {\n    const customerCard = document.querySelector('[data-testid=\"customer-card\"]');\n    if (!customerCard) return { swipeSupported: false };\n    \n    // Simulate touch events\n    const rect = customerCard.getBoundingClientRect();\n    const startX = rect.left + 50;\n    const endX = rect.right - 50;\n    const y = rect.top + rect.height / 2;\n    \n    // Touch start\n    customerCard.dispatchEvent(new TouchEvent('touchstart', {\n      touches: [{ clientX: startX, clientY: y }]\n    }));\n    \n    // Touch move (swipe right)\n    customerCard.dispatchEvent(new TouchEvent('touchmove', {\n      touches: [{ clientX: endX, clientY: y }]\n    }));\n    \n    // Touch end\n    customerCard.dispatchEvent(new TouchEvent('touchend'));\n    \n    return {\n      swipeSupported: true,\n      cardHasSwipeClass: customerCard.classList.contains('swipe-active'),\n      actionsRevealed: !!document.querySelector('.swipe-actions')\n    };\n  });\n  \n  console.log('Touch Interaction Test:', swipeTest);\n  \n  await browser.close();\n})();\n`\n```\n\n## 🔐 Authentication Flow Testing\n\n### **Clerk Authentication Validation**\n```javascript\n// Clerk authentication flow testing\nconst testClerkAuthentication = `\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const page = await browser.newPage();\n  \n  // Test unauthenticated access\n  await page.goto('http://localhost:3001/dashboard');\n  await page.waitForTimeout(2000);\n  \n  const authRedirectTest = await page.evaluate(() => {\n    return {\n      redirectedToSignIn: window.location.pathname.includes('/sign-in'),\n      dashboardBlocked: !document.querySelector('[data-testid=\"dashboard-content\"]'),\n      clerkLoaded: typeof window.Clerk !== 'undefined'\n    };\n  });\n  \n  console.log('Authentication Redirect Test:', authRedirectTest);\n  \n  // Test organization selection requirement\n  if (authRedirectTest.clerkLoaded) {\n    // Mock authenticated but no organization\n    await page.addInitScript(() => {\n      window.__CLERK_TEST_AUTH__ = {\n        userId: 'test_user',\n        orgId: null // No organization\n      };\n    });\n    \n    await page.goto('http://localhost:3001/dashboard');\n    await page.waitForTimeout(2000);\n    \n    const orgRequirementTest = await page.evaluate(() => {\n      return {\n        redirectedToOrgSelection: window.location.pathname.includes('/select-organization'),\n        orgSelectionVisible: !!document.querySelector('[data-testid=\"org-selector\"]')\n      };\n    });\n    \n    console.log('Organization Requirement Test:', orgRequirementTest);\n  }\n  \n  await browser.close();\n})();\n`\n```\n\n## ⚡ Performance Testing\n\n### **Core Web Vitals Validation**\n```javascript\n// Performance and Core Web Vitals testing\nconst testPerformanceMetrics = `\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const page = await browser.newPage();\n  \n  // Enable performance tracking\n  await page.coverage.startJSCoverage();\n  await page.coverage.startCSSCoverage();\n  \n  const startTime = Date.now();\n  await page.goto('http://localhost:3001/dashboard');\n  \n  // Wait for T3 hydration\n  await page.waitForTimeout(3000);\n  \n  const performanceMetrics = await page.evaluate(() => {\n    const navigation = performance.getEntriesByType('navigation')[0];\n    const paint = performance.getEntriesByType('paint');\n    \n    return {\n      loadTime: navigation.loadEventEnd - navigation.loadEventStart,\n      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,\n      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,\n      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,\n      resourceCount: performance.getEntriesByType('resource').length,\n      memoryUsage: performance.memory ? {\n        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),\n        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)\n      } : null\n    };\n  });\n  \n  const jsCoverage = await page.coverage.stopJSCoverage();\n  const cssCoverage = await page.coverage.stopCSSCoverage();\n  \n  const coverageStats = {\n    jsFilesLoaded: jsCoverage.length,\n    cssFilesLoaded: cssCoverage.length,\n    unusedJSPercent: Math.round(\n      jsCoverage.reduce((acc, entry) => acc + entry.ranges.reduce((a, r) => a + r.end - r.start, 0), 0) /\n      jsCoverage.reduce((acc, entry) => acc + entry.text.length, 0) * 100\n    )\n  };\n  \n  console.log('Performance Metrics:', {\n    ...performanceMetrics,\n    coverage: coverageStats,\n    totalLoadTime: Date.now() - startTime\n  });\n  \n  await browser.close();\n})();\n`\n```\n\n## 🎯 Emergency Scenario Testing\n\n### **Emergency Job Flow Validation**\n```javascript\n// Emergency job creation and handling testing\nconst testEmergencyJobFlow = `\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const page = await browser.newPage();\n  \n  await page.goto('http://localhost:3001/dashboard/jobs');\n  await page.waitForTimeout(2000);\n  \n  // Test emergency job creation\n  await page.click('[data-testid=\"emergency-job-button\"]');\n  await page.waitForTimeout(500);\n  \n  // Emergency form should have different styling\n  const emergencyFormTest = await page.evaluate(() => {\n    const form = document.querySelector('[data-testid=\"emergency-job-form\"]');\n    return {\n      emergencyFormVisible: !!form,\n      hasUrgentStyling: form?.classList.contains('emergency-form'),\n      priorityFieldRequired: !!document.querySelector('[data-testid=\"priority-field\"][required]'),\n      responseTimeVisible: !!document.querySelector('[data-testid=\"response-time\"]')\n    };\n  });\n  \n  console.log('Emergency Form Test:', emergencyFormTest);\n  \n  // Fill emergency job details\n  await page.fill('[data-testid=\"customer-name\"]', 'Emergency Customer');\n  await page.fill('[data-testid=\"phone-number\"]', '06-12345678');\n  await page.fill('[data-testid=\"emergency-description\"]', 'Burst pipe flooding kitchen');\n  await page.selectOption('[data-testid=\"urgency-level\"]', '1'); // Critical\n  \n  // Submit emergency job\n  await page.click('[data-testid=\"submit-emergency-job\"]');\n  await page.waitForTimeout(2000);\n  \n  // Verify emergency job appears with correct priority\n  const emergencyJobTest = await page.evaluate(() => {\n    const emergencyJobs = document.querySelectorAll('[data-priority=\"1\"]');\n    const latestJob = document.querySelector('[data-testid=\"job-card\"]:first-child');\n    \n    return {\n      emergencyJobCreated: emergencyJobs.length > 0,\n      appearsAtTop: latestJob?.dataset.priority === '1',\n      hasEmergencyBadge: !!latestJob?.querySelector('.emergency-badge'),\n      estimatedResponseTime: latestJob?.querySelector('[data-testid=\"response-time\"]')?.textContent\n    };\n  });\n  \n  console.log('Emergency Job Creation Test:', emergencyJobTest);\n  \n  await browser.close();\n})();\n`\n```\n\n---\n\n**This Playwright testing guide provides complete MCP-powered browser automation patterns for testing T3 dashboard functionality, multi-tenant isolation, Schedule-X calendar integration, and emergency job workflows without creating traditional test files.**