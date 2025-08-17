import { chromium } from 'playwright';

console.log('🧪 Testing T3 Stack Setup via Playwright MCP...');

const browser = await chromium.launch({ 
  headless: true,
  timeout: 30000 
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  locale: 'nl-NL',
  timezoneId: 'Europe/Amsterdam'
});

const page = await context.newPage();

try {
  // Test if T3 app is running on localhost:3000
  console.log('📡 Testing localhost:3000 (T3 app)...');
  const response = await page.goto('http://localhost:3000', { timeout: 10000 });
  
  if (response && response.ok()) {
    console.log('✅ T3 App is running on localhost:3000');
    
    // Test for T3 Stack indicators
    await page.waitForTimeout(3000); // Wait for hydration
    
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasNextData: !!window.__NEXT_DATA__,
        hasTRPC: !!window.__NEXT_DATA__?.props?.pageProps?.trpcState,
        hasClerk: !!window.Clerk || !!document.querySelector('[data-clerk-hydrated]'),
        bodyText: document.body.innerText.substring(0, 200),
        url: window.location.href,
        reactVersion: window.React?.version || 'Unknown'
      };
    });
    
    console.log('📊 T3 App Analysis:');
    console.log(`  Title: ${pageContent.title}`);
    console.log(`  Next.js Data: ${pageContent.hasNextData ? '✅' : '❌'}`);
    console.log(`  tRPC State: ${pageContent.hasTRPC ? '✅' : '❌'}`);
    console.log(`  Clerk Auth: ${pageContent.hasClerk ? '✅' : '❌'}`);
    console.log(`  React Version: ${pageContent.reactVersion}`);
    console.log(`  URL: ${pageContent.url}`);
    console.log(`  Content Preview: ${pageContent.bodyText}...`);
    
    // Test tRPC endpoint
    try {
      const apiResponse = await page.request.get('http://localhost:3000/api/trpc/example.hello?input={}');
      console.log(`  tRPC API: ${apiResponse.ok() ? '✅' : '❌'} (Status: ${apiResponse.status()})`);
    } catch (apiError) {
      console.log(`  tRPC API: ❌ (${apiError.message})`);
    }
    
  } else {
    console.log('❌ T3 App not running on localhost:3000');
    console.log('Status:', response ? response.status() : 'No response');
    console.log('💡 Start the T3 app with: npm run dev');
  }
  
} catch (error) {
  console.log('❌ Cannot connect to localhost:3000');
  console.log('Error:', error.message);
  console.log('💡 Make sure to run: npm run dev in the plumber-saas directory');
}

// Test modern browser features for our SaaS
try {
  console.log('🌐 Testing modern browser features...');
  
  const features = await page.evaluate(() => {
    return {
      webSockets: !!window.WebSocket,
      geolocation: !!navigator.geolocation,
      mediaDevices: !!navigator.mediaDevices,
      serviceWorker: !!navigator.serviceWorker,
      indexedDB: !!window.indexedDB,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      fetch: !!window.fetch,
      intersectionObserver: !!window.IntersectionObserver,
      resizeObserver: !!window.ResizeObserver
    };
  });
  
  console.log('📱 Browser Features for SaaS:');
  Object.entries(features).forEach(([feature, supported]) => {
    console.log(`  ${feature}: ${supported ? '✅' : '❌'}`);
  });
  
} catch (error) {
  console.log('❌ Error testing browser features:', error.message);
}

// Test mobile viewport simulation (Schedule-X calendar testing)
try {
  console.log('📱 Testing mobile viewport simulation...');
  
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
  await page.goto('http://localhost:3000', { timeout: 10000 });
  
  const mobileTest = await page.evaluate(() => {
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      isMobile: window.innerWidth < 768,
      touchEvents: 'ontouchstart' in window,
      orientation: screen.orientation?.type || 'unknown'
    };
  });
  
  console.log('📱 Mobile Testing:');
  console.log(`  Viewport: ${mobileTest.viewport.width}x${mobileTest.viewport.height}`);
  console.log(`  Mobile Mode: ${mobileTest.isMobile ? '✅' : '❌'}`);
  console.log(`  Touch Events: ${mobileTest.touchEvents ? '✅' : '❌'}`);
  console.log(`  Orientation: ${mobileTest.orientation}`);
  
} catch (error) {
  console.log('❌ Error testing mobile simulation:', error.message);
}

await browser.close();
console.log('🏁 T3 Stack testing completed');
console.log();
console.log('📋 Next Steps:');
console.log('1. Start T3 app: npm run dev');
console.log('2. Check database: npm run db:studio');
console.log('3. Run tests again to verify full functionality');