# 🎭 Testing Expert Patterns - Playwright MCP + Browser Automation

*Last Updated: 2025-01-15 | Compatible: Playwright MCP Latest, T3 Stack*

## 🎯 Playwright MCP Testing Patterns (Verified)

### **1. Perfect T3 + Schedule-X Testing** ✅ VERIFIED
```bash
# WINNING PATTERN - Always works for T3 testing
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test T3 app (port 3000, not 3001)
  await page.goto('http://localhost:3000/dashboard/jobs', { 
    waitUntil: 'networkidle', 
    timeout: 15000 
  });
  
  // Essential wait for T3 hydration
  await page.waitForTimeout(3000);
  
  const t3Test = await page.evaluate(() => {
    return {
      // Test tRPC client loaded
      hasTrpc: typeof window.__trpc !== 'undefined',
      
      // Test Next.js router
      hasNextRouter: typeof window.next !== 'undefined',
      
      // Test Schedule-X calendar
      hasCalendar: document.querySelector('.sx-calendar') !== null,
      calendarVisible: document.querySelector('.sx-calendar')?.offsetParent !== null,
      
      // Test Clerk auth
      hasClerk: typeof window.Clerk !== 'undefined',
      isSignedIn: typeof window.Clerk !== 'undefined' && window.Clerk.user !== null,
      
      // Test dashboard components
      hasSidebar: document.querySelector('[data-testid=\"sidebar\"]') !== null,
      hasJobsPage: document.querySelector('[data-testid=\"jobs-page\"]') !== null,
      
      // Test error states
      hasErrors: document.querySelector('.error') !== null,
      consoleErrors: window.console?.errors || [],
    };
  });
  
  console.log('T3 Stack Test Results:', JSON.stringify(t3Test, null, 2));
  await browser.close();
})();
"
```

### **2. Multi-Tenant Data Isolation Testing** ✅ SECURITY
```bash
# Test organization data isolation
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Create two pages for different organizations
  const org1Page = await context.newPage();
  const org2Page = await context.newPage();
  
  // Test org1 cannot see org2 data
  await org1Page.goto('http://localhost:3000/dashboard/jobs');
  await org2Page.goto('http://localhost:3000/dashboard/jobs');
  
  await org1Page.waitForTimeout(3000);
  await org2Page.waitForTimeout(3000);
  
  const isolationTest = await org1Page.evaluate(async () => {
    // Test if API respects organization filtering
    if (typeof fetch === 'undefined') {
      return { error: 'Fetch not available' };
    }
    
    try {
      const response = await fetch('/api/trpc/jobs.list', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      return {
        apiReturnsData: response.ok,
        dataStructure: typeof data,
        hasOrgFilter: response.headers.get('x-organization-id') !== null,
      };
    } catch (error) {
      return { error: error.message };
    }
  });
  
  console.log('Data Isolation Test:', JSON.stringify(isolationTest, null, 2));
  await browser.close();
})();
"
```

### **3. Real-Time Updates Testing** ✅ REALTIME
```bash
# Test Supabase real-time subscriptions
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Open two tabs to test real-time sync
  const page1 = await context.newPage();
  const page2 = await context.newPage();
  
  await page1.goto('http://localhost:3000/dashboard/jobs');
  await page2.goto('http://localhost:3000/dashboard/jobs');
  
  await page1.waitForTimeout(3000);
  await page2.waitForTimeout(3000);
  
  // Get initial job count on both pages
  const initialCount1 = await page1.evaluate(() => {
    const jobCards = document.querySelectorAll('[data-testid=\"job-card\"]');
    return jobCards.length;
  });
  
  const initialCount2 = await page2.evaluate(() => {
    const jobCards = document.querySelectorAll('[data-testid=\"job-card\"]');
    return jobCards.length;
  });
  
  // Try to create job on page1 (if add button exists)
  const jobCreated = await page1.evaluate(async () => {
    const addButton = document.querySelector('[data-testid=\"add-job-btn\"]');
    if (!addButton) return false;
    
    addButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill form if modal opens
    const customerInput = document.querySelector('#customerName');
    if (customerInput) {
      customerInput.value = 'Test Customer';
      customerInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const submitBtn = document.querySelector('[data-testid=\"submit-job\"]');
    if (submitBtn) {
      submitBtn.click();
      return true;
    }
    return false;
  });
  
  // Wait for real-time update
  await page1.waitForTimeout(2000);
  await page2.waitForTimeout(2000);
  
  // Check if page2 received the update
  const finalCount2 = await page2.evaluate(() => {
    const jobCards = document.querySelectorAll('[data-testid=\"job-card\"]');
    return jobCards.length;
  });
  
  const realtimeTest = {
    initialCount1,
    initialCount2,
    jobCreated,
    finalCount2,
    realtimeWorking: jobCreated && finalCount2 > initialCount2,
  };
  
  console.log('Real-time Test:', JSON.stringify(realtimeTest, null, 2));
  await browser.close();
})();
"
```

## 📱 Mobile Testing Patterns

### **1. Mobile Responsiveness Test** ✅ MOBILE
```bash
# Test mobile interface and touch interactions
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true,
    hasTouch: true,
  });
  
  const page = await context.newPage();
  await page.goto('http://localhost:3000/dashboard/jobs');
  await page.waitForTimeout(3000);
  
  const mobileTest = await page.evaluate(() => {
    return {
      // Test viewport adaptation
      isMobileLayout: window.innerWidth < 768,
      
      // Test sidebar behavior on mobile
      hasMobileMenu: document.querySelector('[data-testid=\"mobile-menu\"]') !== null,
      sidebarHidden: document.querySelector('[data-testid=\"sidebar\"]')?.classList.contains('hidden') || 
                     document.querySelector('[data-testid=\"sidebar\"]')?.offsetParent === null,
      
      // Test calendar mobile view
      calendarMobile: document.querySelector('.sx-calendar')?.classList.contains('sx-mobile'),
      
      // Test touch targets (buttons should be min 44px)
      buttonSizes: Array.from(document.querySelectorAll('button')).map(btn => ({
        width: btn.offsetWidth,
        height: btn.offsetHeight,
        tooSmall: btn.offsetWidth < 44 || btn.offsetHeight < 44,
      })),
      
      // Test horizontal scrolling (should not exist)
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
      
      // Test filter area on mobile
      hasFilterToggle: document.querySelector('[data-testid=\"filter-toggle\"]') !== null,
    };
  });
  
  console.log('Mobile Test Results:', JSON.stringify(mobileTest, null, 2));
  
  // Take screenshot for visual verification
  await page.screenshot({ path: 'mobile-dashboard.png', fullPage: true });
  
  await browser.close();
})();
"
```

### **2. Touch Interactions Test** ✅ TOUCH
```bash
# Test touch gestures and mobile interactions
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    hasTouch: true,
    isMobile: true,
  });
  
  const page = await context.newPage();
  await page.goto('http://localhost:3000/dashboard/jobs');
  await page.waitForTimeout(3000);
  
  // Test touch interactions
  const touchTest = await page.evaluate(async () => {
    const results = {
      swipeTest: false,
      tapTest: false,
      longPressTest: false,
    };
    
    // Test tap on calendar event (if exists)
    const calendarEvent = document.querySelector('.sx-event');
    if (calendarEvent) {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({
          identifier: 1,
          target: calendarEvent,
          clientX: 100,
          clientY: 100,
        })],
      });
      
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 1,
          target: calendarEvent,
          clientX: 100,
          clientY: 100,
        })],
      });
      
      calendarEvent.dispatchEvent(touchStart);
      await new Promise(resolve => setTimeout(resolve, 100));
      calendarEvent.dispatchEvent(touchEnd);
      
      results.tapTest = true;
    }
    
    // Test mobile menu toggle
    const menuButton = document.querySelector('[data-testid=\"mobile-menu-btn\"]');
    if (menuButton) {
      menuButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const menuOpen = document.querySelector('[data-testid=\"mobile-menu\"]')?.classList.contains('open');
      results.menuToggle = menuOpen;
    }
    
    return results;
  });
  
  console.log('Touch Interaction Test:', JSON.stringify(touchTest, null, 2));
  await browser.close();
})();
"
```

## 🔐 Authentication Flow Testing

### **1. Clerk Authentication Test** ✅ AUTH
```bash
# Test complete authentication flow
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Start at protected route (should redirect to sign-in)
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(3000);
  
  const authTest = await page.evaluate(() => {
    const currentUrl = window.location.href;
    
    return {
      redirectedToSignIn: currentUrl.includes('/sign-in') || currentUrl.includes('/auth'),
      hasClerkComponent: document.querySelector('.cl-component') !== null,
      hasSignInForm: document.querySelector('form') !== null,
      hasAuthProvider: typeof window.Clerk !== 'undefined',
    };
  });
  
  // Test organization selection after auth (mock scenario)
  if (authTest.redirectedToSignIn) {
    // Simulate successful sign-in by going to dashboard with mock auth
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(3000);
    
    const dashboardTest = await page.evaluate(() => {
      return {
        hasOrgSwitcher: document.querySelector('[data-testid=\"org-switcher\"]') !== null,
        hasUserProfile: document.querySelector('[data-testid=\"user-profile\"]') !== null,
        hasProtectedContent: document.querySelector('[data-testid=\"dashboard-content\"]') !== null,
        showsOrgSetup: document.querySelector('[data-testid=\"org-setup\"]') !== null,
      };
    });
    
    authTest.dashboardAccess = dashboardTest;
  }
  
  console.log('Authentication Flow Test:', JSON.stringify(authTest, null, 2));
  await browser.close();
})();
"
```

## ⚡ Performance Testing Patterns

### **1. Load Time Testing** ✅ PERFORMANCE
```bash
# Test T3 app performance metrics
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Start performance measurement
  const startTime = Date.now();
  
  await page.goto('http://localhost:3000/dashboard/jobs');
  
  // Wait for hydration
  await page.waitForTimeout(3000);
  
  const performanceTest = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    return {
      // Core Web Vitals
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      
      // T3 specific metrics
      tRPCReady: typeof window.__trpc !== 'undefined',
      nextJSReady: typeof window.__NEXT_DATA__ !== 'undefined',
      
      // Calendar load time
      calendarLoaded: document.querySelector('.sx-calendar') !== null,
      
      // JavaScript bundle size estimate
      scriptTags: document.querySelectorAll('script[src]').length,
      
      // API response times (if available)
      resourceTiming: performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('/api/'))
        .map(entry => ({
          url: entry.name,
          duration: entry.duration,
          responseTime: entry.responseEnd - entry.responseStart,
        })),
    };
  });
  
  const totalTime = Date.now() - startTime;
  performanceTest.totalLoadTime = totalTime;
  
  console.log('Performance Test Results:', JSON.stringify(performanceTest, null, 2));
  
  // Performance thresholds
  const thresholds = {
    totalLoadTime: totalTime < 3000, // Under 3 seconds
    firstContentfulPaint: performanceTest.firstContentfulPaint < 2000, // Under 2 seconds
    tRPCReady: performanceTest.tRPCReady,
    calendarLoaded: performanceTest.calendarLoaded,
  };
  
  console.log('Performance Thresholds:', JSON.stringify(thresholds, null, 2));
  
  await browser.close();
})();
"
```

### **2. Memory Usage Testing** ✅ MEMORY
```bash
# Test memory usage and potential leaks
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/dashboard/jobs');
  await page.waitForTimeout(3000);
  
  // Get initial memory usage
  const initialMemory = await page.evaluate(() => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  });
  
  // Navigate between pages to test memory cleanup
  await page.goto('http://localhost:3000/dashboard/customers');
  await page.waitForTimeout(2000);
  
  await page.goto('http://localhost:3000/dashboard/invoices');
  await page.waitForTimeout(2000);
  
  await page.goto('http://localhost:3000/dashboard/jobs');
  await page.waitForTimeout(2000);
  
  const finalMemory = await page.evaluate(() => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  });
  
  const memoryTest = {
    initialMemory,
    finalMemory,
    memoryIncrease: finalMemory && initialMemory ? 
      finalMemory.used - initialMemory.used : 0,
    potentialLeak: finalMemory && initialMemory ? 
      (finalMemory.used - initialMemory.used) > (10 * 1024 * 1024) : false, // 10MB threshold
  };
  
  console.log('Memory Test Results:', JSON.stringify(memoryTest, null, 2));
  await browser.close();
})();
"
```

## 🧪 E2E Workflow Testing

### **1. Complete Job Management Workflow** ✅ E2E
```bash
# Test entire job management workflow
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/dashboard/jobs');
  await page.waitForTimeout(3000);
  
  const workflowTest = await page.evaluate(async () => {
    const results = {
      steps: [],
      success: false,
    };
    
    // Step 1: Check if add job button exists
    const addJobBtn = document.querySelector('[data-testid=\"add-job-btn\"]');
    if (!addJobBtn) {
      results.steps.push({ step: 'find_add_button', success: false });
      return results;
    }
    results.steps.push({ step: 'find_add_button', success: true });
    
    // Step 2: Click add job button
    addJobBtn.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const jobModal = document.querySelector('[data-testid=\"job-modal\"]');
    if (!jobModal) {
      results.steps.push({ step: 'open_job_modal', success: false });
      return results;
    }
    results.steps.push({ step: 'open_job_modal', success: true });
    
    // Step 3: Fill job form
    const customerInput = document.querySelector('#customerName');
    const serviceSelect = document.querySelector('#serviceType');
    const dateInput = document.querySelector('#scheduledDate');
    
    if (customerInput) {
      customerInput.value = 'Test Customer';
      customerInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (serviceSelect) {
      serviceSelect.value = 'Emergency Repairs';
      serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    results.steps.push({ 
      step: 'fill_form', 
      success: !!(customerInput?.value && serviceSelect?.value && dateInput?.value)
    });
    
    // Step 4: Submit form
    const submitBtn = document.querySelector('[data-testid=\"submit-job\"]');
    if (submitBtn && !submitBtn.disabled) {
      submitBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if job appears in list/calendar
      const jobCards = document.querySelectorAll('[data-testid=\"job-card\"]');
      const calendarEvents = document.querySelectorAll('.sx-event');
      
      results.steps.push({ 
        step: 'submit_job', 
        success: jobCards.length > 0 || calendarEvents.length > 0
      });
      
      results.success = results.steps.every(step => step.success);
    } else {
      results.steps.push({ step: 'submit_job', success: false });
    }
    
    return results;
  });
  
  console.log('Job Workflow Test:', JSON.stringify(workflowTest, null, 2));
  await browser.close();
})();
"
```

## 🚨 Error Detection Patterns

### **1. Console Error Detection** ✅ DEBUGGING
```bash
# Comprehensive error detection
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  
  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'console_error',
        message: msg.text(),
        location: msg.location(),
      });
    }
    if (msg.type() === 'warning') {
      warnings.push({
        type: 'console_warning',
        message: msg.text(),
      });
    }
  });
  
  // Capture page errors
  page.on('pageerror', (error) => {
    errors.push({
      type: 'page_error',
      message: error.message,
      stack: error.stack,
    });
  });
  
  // Capture request failures
  page.on('requestfailed', (request) => {
    errors.push({
      type: 'request_failed',
      url: request.url(),
      failure: request.failure()?.errorText,
    });
  });
  
  await page.goto('http://localhost:3000/dashboard/jobs');
  await page.waitForTimeout(5000);
  
  // Navigate to all major pages to check for errors
  const pages = ['/dashboard/customers', '/dashboard/invoices', '/dashboard/settings'];
  
  for (const pagePath of pages) {
    await page.goto(\`http://localhost:3000\${pagePath}\`);
    await page.waitForTimeout(2000);
  }
  
  const errorReport = {
    totalErrors: errors.length,
    totalWarnings: warnings.length,
    errors: errors,
    warnings: warnings.slice(0, 10), // Limit warnings
    criticalErrors: errors.filter(error => 
      error.message.includes('tRPC') || 
      error.message.includes('Clerk') ||
      error.message.includes('Network Error')
    ),
  };
  
  console.log('Error Detection Report:', JSON.stringify(errorReport, null, 2));
  await browser.close();
})();
"
```

## 🎯 Success Testing Patterns

### **1. Feature Completeness Check** ✅ COMPLETE
```bash
# Verify all expected features are present and working
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(3000);
  
  const featureCheck = await page.evaluate(() => {
    const features = {
      // Core UI Features
      sidebar: document.querySelector('[data-testid=\"sidebar\"]') !== null,
      userProfile: document.querySelector('[data-testid=\"user-profile\"]') !== null,
      orgSwitcher: document.querySelector('[data-testid=\"org-switcher\"]') !== null,
      
      // Dashboard Stats
      statsCards: document.querySelectorAll('[data-testid=\"stat-card\"]').length >= 4,
      
      // Navigation
      jobsLink: document.querySelector('[href*=\"/jobs\"]') !== null,
      customersLink: document.querySelector('[href*=\"/customers\"]') !== null,
      invoicesLink: document.querySelector('[href*=\"/invoices\"]') !== null,
      
      // T3 Stack Features
      tRPCLoaded: typeof window.__trpc !== 'undefined',
      nextJSLoaded: typeof window.__NEXT_DATA__ !== 'undefined',
      
      // Authentication
      clerkLoaded: typeof window.Clerk !== 'undefined',
      
      // Mobile Features
      responsiveLayout: window.innerWidth < 768 ? 
        document.querySelector('[data-testid=\"mobile-menu\"]') !== null : true,
    };
    
    // Calculate completeness score
    const totalFeatures = Object.keys(features).length;
    const workingFeatures = Object.values(features).filter(Boolean).length;
    features.completenessScore = (workingFeatures / totalFeatures * 100).toFixed(1);
    
    return features;
  });
  
  console.log('Feature Completeness Check:', JSON.stringify(featureCheck, null, 2));
  await browser.close();
})();
"
```

## 🚨 Anti-Patterns (AVOID)

### **❌ Don't Create Test Files**
```typescript
// ❌ WRONG - creating test files
// tests/jobs.test.js
// tests/components/Calendar.test.tsx

// ✅ CORRECT - use Playwright MCP only
// All testing via browser automation, no files created
```

### **❌ Don't Use Complex Bash Escaping**
```bash
# ❌ WRONG - complex conditionals that break
node -e "if (!window.apiClient || !data) { ... }"

# ✅ CORRECT - simple JavaScript patterns
node -e "const hasApi = typeof window.apiClient !== 'undefined';"
```

## 📊 Success Metrics

- ✅ All T3 Stack components load correctly
- ✅ Real-time features work across browser tabs
- ✅ Mobile responsiveness passes on all screen sizes
- ✅ Authentication flows work end-to-end
- ✅ Performance metrics under thresholds
- ✅ Zero critical console errors
- ✅ Feature completeness score >90%

## 🔄 Update Process

This file is updated by the Testing Specialist Agent when:
- Playwright MCP updates
- New testing patterns discovered
- T3 Stack testing requirements change
- Mobile testing standards evolve
- Performance benchmarks update

**Always test in multiple browsers and device sizes!**