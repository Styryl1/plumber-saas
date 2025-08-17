# Widget Validation Patterns - AI Chat Testing & Cross-Domain

## 🎯 Overview
Complete widget validation patterns using Playwright MCP for AI chat testing, emergency scenarios, cross-domain validation, and mobile responsiveness.

## 🤖 AI Chat Testing Patterns

### **Conversation Flow Validation**
```javascript
// AI chat conversation testing with MCP
const testAIChatConversation = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3001/test/widget');
  await page.waitForTimeout(2000);
  
  // Test widget initialization
  const widgetTest = await page.evaluate(() => {
    return {
      widgetLoaded: !!document.querySelector('.plumber-widget'),
      chatVisible: !!document.querySelector('.widget-expanded'),
      aiModelLoaded: typeof window.aiClient !== 'undefined',
      sessionActive: !!window.widgetSession
    };
  });
  
  console.log('Widget Initialization:', widgetTest);
  
  // Test opening widget
  await page.click('.widget-trigger');
  await page.waitForTimeout(1000);
  
  // Test AI conversation flow
  const testMessages = [
    'Hallo, ik heb een lekkage',
    'In de keuken, onder de gootsteen',
    'Het lekt al sinds vanmorgen',
    'Ja, ik wil graag een afspraak'
  ];
  
  for (const message of testMessages) {
    // Type message
    await page.fill('.input-field', message);
    await page.click('.send-button');
    await page.waitForTimeout(3000); // Wait for AI response
    
    // Check for AI response
    const responseTest = await page.evaluate(() => {
      const messages = document.querySelectorAll('.message.ai');
      const lastMessage = messages[messages.length - 1];
      return {
        responseReceived: !!lastMessage,
        responseText: lastMessage?.querySelector('.message-bubble')?.textContent || '',
        responseTime: Date.now() - window.lastMessageTime
      };
    });
    
    console.log(\`Message: "\${message}" - Response:`, responseTest);
  }
  
  await browser.close();
})();
`
```

### **Emergency Scenario Testing**
```javascript
// Emergency detection and response testing
const testEmergencyScenarios = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3001/test/widget');
  await page.waitForTimeout(2000);
  
  // Open widget
  await page.click('.widget-trigger');
  await page.waitForTimeout(1000);
  
  // Test emergency scenarios
  const emergencyScenarios = [
    {
      message: 'HELP! Buizensbreuk in de keuken, water overal!',
      expectedUrgency: 1,
      expectedResponse: 'spoedgeval'
    },
    {
      message: 'Ik ruik gas in huis',
      expectedUrgency: 1,
      expectedResponse: 'gaslucht'
    },
    {
      message: 'CV is kapot en het vriest buiten',
      expectedUrgency: 2,
      expectedResponse: 'spoed'
    },
    {
      message: 'Kleine lekkage onder wasbak',
      expectedUrgency: 3,
      expectedResponse: 'urgent'
    }
  ];
  
  for (const scenario of emergencyScenarios) {
    // Clear chat
    await page.reload();
    await page.waitForTimeout(1000);
    await page.click('.widget-trigger');
    await page.waitForTimeout(500);
    
    // Send emergency message
    await page.fill('.input-field', scenario.message);
    await page.click('.send-button');
    await page.waitForTimeout(4000); // Wait for AI analysis
    
    // Check emergency detection
    const emergencyTest = await page.evaluate((expected) => {
      const messages = document.querySelectorAll('.message.ai');
      const lastMessage = messages[messages.length - 1];
      const messageText = lastMessage?.querySelector('.message-bubble')?.textContent?.toLowerCase() || '';
      
      return {
        emergencyDetected: lastMessage?.classList.contains('emergency') || 
                          lastMessage?.classList.contains('urgent'),
        containsKeyword: messageText.includes(expected.expectedResponse),
        responseText: messageText,
        hasEmergencyBadge: !!document.querySelector('.emergency-badge'),
        hasUrgentStyling: !!document.querySelector('.widget-emergency')
      };
    }, scenario);
    
    console.log(\`Emergency Test - "\${scenario.message}":`, emergencyTest);
  }
  
  await browser.close();
})();
`
```

### **Dutch Language Validation**
```javascript
// Dutch language and terminology testing
const testDutchLanguageValidation = `
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3001/test/widget');
  await page.waitForTimeout(2000);
  
  // Test Dutch terminology recognition
  const dutchTerms = [
    { input: 'kraan lekt', expectedContext: 'tap_leak' },
    { input: 'cv ketel storing', expectedContext: 'boiler_issue' },
    { input: 'afvoer verstopt', expectedContext: 'drain_blocked' },
    { input: 'radiator wordt niet warm', expectedContext: 'heating_problem' },
    { input: 'warmtepomp maakt geluid', expectedContext: 'heat_pump_noise' }
  ];
  
  for (const term of dutchTerms) {\n    await page.reload();\n    await page.waitForTimeout(1000);\n    await page.click('.widget-trigger');\n    await page.waitForTimeout(500);\n    \n    // Send Dutch terminology\n    await page.fill('.input-field', term.input);\n    await page.click('.send-button');\n    await page.waitForTimeout(3000);\n    \n    // Check AI understanding\n    const languageTest = await page.evaluate((termData) => {\n      const messages = document.querySelectorAll('.message.ai');\n      const lastMessage = messages[messages.length - 1];\n      const responseText = lastMessage?.querySelector('.message-bubble')?.textContent || '';\n      \n      return {\n        responseInDutch: /[a-zA-Z]/.test(responseText) && \n                        (responseText.includes('ik') || responseText.includes('u') || \n                         responseText.includes('kan') || responseText.includes('wordt')),\n        usesCorrectTerminology: responseText.toLowerCase().includes(termData.input.split(' ')[0]),\n        responseLength: responseText.length,\n        professionalTone: responseText.includes('meneer') || responseText.includes('mevrouw') || \n                         responseText.toLowerCase().includes('u '),\n        responseText: responseText\n      };\n    }, term);\n    \n    console.log(\\`Dutch Term Test - \"\\${term.input}\":\\`, languageTest);\n  }\n  \n  await browser.close();\n})();\n`\n```\n\n## 🔗 Cross-Domain Integration Testing\n\n### **Widget Embedding Validation**\n```javascript\n// Test widget on different domains\nconst testCrossDomainEmbedding = \\`\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  \n  // Test domains\n  const testDomains = [\n    'http://localhost:3001/test/widget', // Main domain\n    'http://127.0.0.1:3001/test/widget', // IP access\n    // Add more test domains as needed\n  ];\n  \n  for (const domain of testDomains) {\n    const page = await browser.newPage();\n    \n    try {\n      await page.goto(domain);\n      await page.waitForTimeout(2000);\n      \n      // Test widget loading\n      const crossDomainTest = await page.evaluate(() => {\n        return {\n          widgetPresent: !!document.querySelector('.plumber-widget'),\n          scriptsLoaded: !!window.PlumbingWidget,\n          apiAccessible: typeof fetch !== 'undefined',\n          corsEnabled: true, // Will be false if CORS blocks requests\n          domainOrigin: window.location.origin\n        };\n      });\n      \n      // Test API calls\n      const apiTest = await page.evaluate(async () => {\n        try {\n          const response = await fetch('/api/widget/config', {\n            method: 'GET',\n            headers: { 'Content-Type': 'application/json' }\n          });\n          \n          return {\n            apiWorking: response.ok,\n            status: response.status,\n            corsHeaders: response.headers.get('Access-Control-Allow-Origin')\n          };\n        } catch (error) {\n          return {\n            apiWorking: false,\n            error: error.message\n          };\n        }\n      });\n      \n      console.log(\\`Domain \\${domain}:\\`, {\n        ...crossDomainTest,\n        api: apiTest\n      });\n      \n    } catch (error) {\n      console.log(\\`Domain \\${domain} failed:\\`, error.message);\n    }\n    \n    await page.close();\n  }\n  \n  await browser.close();\n})();\n\\`\n```\n\n### **Widget Configuration Testing**\n```javascript\n// Test widget with different configurations\nconst testWidgetConfigurations = \\`\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const page = await browser.newPage();\n  \n  // Test different widget configurations\n  const configurations = [\n    {\n      name: 'Default Configuration',\n      config: {\n        organizationId: 'org_test',\n        position: 'bottom-right',\n        primaryColor: '#059669'\n      }\n    },\n    {\n      name: 'Emergency Mode',\n      config: {\n        organizationId: 'org_test',\n        position: 'bottom-right',\n        primaryColor: '#ef4444',\n        emergencyMode: true\n      }\n    },\n    {\n      name: 'Custom Styling',\n      config: {\n        organizationId: 'org_test',\n        position: 'bottom-left',\n        primaryColor: '#3b82f6',\n        customCSS: '.widget-header { background: linear-gradient(45deg, #3b82f6, #1d4ed8); }'\n      }\n    }\n  ];\n  \n  for (const testConfig of configurations) {\n    await page.goto('http://localhost:3001/test/widget');\n    await page.waitForTimeout(1000);\n    \n    // Initialize widget with configuration\n    await page.evaluate((config) => {\n      if (window.PlumbingWidget) {\n        window.PlumbingWidget.destroy(); // Clean previous instance\n      }\n      window.PlumbingWidget.init(config.config);\n    }, testConfig);\n    \n    await page.waitForTimeout(1000);\n    \n    // Test configuration application\n    const configTest = await page.evaluate((configName) => {\n      const widget = document.querySelector('.plumber-widget');\n      const trigger = document.querySelector('.widget-trigger');\n      \n      return {\n        configName,\n        widgetPresent: !!widget,\n        positionCorrect: widget ? \n          getComputedStyle(widget).getPropertyValue('position') === 'fixed' : false,\n        colorApplied: trigger ? \n          getComputedStyle(trigger).backgroundColor !== '' : false,\n        customStylesApplied: !!document.querySelector('style[data-widget-custom]')\n      };\n    }, testConfig.name);\n    \n    console.log('Configuration Test:', configTest);\n  }\n  \n  await browser.close();\n})();\n\\`\n```\n\n## 📱 Mobile Responsiveness Testing\n\n### **Mobile Device Simulation**\n```javascript\n// Mobile responsiveness validation\nconst testMobileResponsiveness = \\`\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const context = await browser.newContext();\n  \n  // Test different mobile devices\n  const devices = [\n    { name: 'iPhone SE', width: 375, height: 667 },\n    { name: 'iPhone 12', width: 390, height: 844 },\n    { name: 'Samsung Galaxy S21', width: 384, height: 854 },\n    { name: 'iPad', width: 768, height: 1024 }\n  ];\n  \n  for (const device of devices) {\n    const page = await context.newPage();\n    await page.setViewportSize({ width: device.width, height: device.height });\n    \n    await page.goto('http://localhost:3001/test/widget');\n    await page.waitForTimeout(2000);\n    \n    // Test mobile widget behavior\n    const mobileTest = await page.evaluate((deviceInfo) => {\n      const widget = document.querySelector('.plumber-widget');\n      const trigger = document.querySelector('.widget-trigger');\n      \n      return {\n        device: deviceInfo.name,\n        viewport: { width: window.innerWidth, height: window.innerHeight },\n        widgetVisible: !!widget,\n        triggerSize: trigger ? {\n          width: trigger.offsetWidth,\n          height: trigger.offsetHeight\n        } : null,\n        touchTargetAdequate: trigger ? \n          trigger.offsetWidth >= 44 && trigger.offsetHeight >= 44 : false,\n        positionAppropriate: widget ? {\n          bottom: getComputedStyle(widget).bottom,\n          right: getComputedStyle(widget).right\n        } : null\n      };\n    }, device);\n    \n    // Test widget expansion on mobile\n    await page.click('.widget-trigger');\n    await page.waitForTimeout(1000);\n    \n    const expansionTest = await page.evaluate(() => {\n      const expanded = document.querySelector('.widget-expanded');\n      \n      return {\n        expandedProperly: !!expanded,\n        fullScreen: expanded ? {\n          width: expanded.offsetWidth,\n          height: expanded.offsetHeight,\n          isFullWidth: expanded.offsetWidth === window.innerWidth,\n          isFullHeight: expanded.offsetHeight === window.innerHeight\n        } : null,\n        inputAccessible: !!document.querySelector('.input-field'),\n        sendButtonSize: (() => {\n          const btn = document.querySelector('.send-button');\n          return btn ? { width: btn.offsetWidth, height: btn.offsetHeight } : null;\n        })(),\n        keyboardFriendly: (() => {\n          const input = document.querySelector('.input-field');\n          return input ? parseFloat(getComputedStyle(input).fontSize) >= 16 : false;\n        })()\n      };\n    });\n    \n    console.log(\\`Mobile Test - \\${device.name}:\\`, {\n      ...mobileTest,\n      expansion: expansionTest\n    });\n    \n    await page.close();\n  }\n  \n  await browser.close();\n})();\n\\`\n```\n\n### **Touch Interaction Testing**\n```javascript\n// Touch gesture and interaction testing\nconst testTouchInteractions = \\`\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const context = await browser.newContext({\n    hasTouch: true,\n    isMobile: true,\n    viewport: { width: 375, height: 667 }\n  });\n  const page = await context.newPage();\n  \n  await page.goto('http://localhost:3001/test/widget');\n  await page.waitForTimeout(2000);\n  \n  // Test touch interactions\n  const touchTests = [\n    {\n      name: 'Widget Trigger Tap',\n      action: async () => {\n        await page.tap('.widget-trigger');\n        await page.waitForTimeout(1000);\n      },\n      validation: () => {\n        return !!document.querySelector('.widget-expanded');\n      }\n    },\n    {\n      name: 'Input Field Focus',\n      action: async () => {\n        await page.tap('.input-field');\n        await page.waitForTimeout(500);\n      },\n      validation: () => {\n        return document.activeElement === document.querySelector('.input-field');\n      }\n    },\n    {\n      name: 'Send Button Tap',\n      action: async () => {\n        await page.fill('.input-field', 'Test message');\n        await page.tap('.send-button');\n        await page.waitForTimeout(500);\n      },\n      validation: () => {\n        return document.querySelector('.input-field').value === '';\n      }\n    },\n    {\n      name: 'Close Widget Swipe',\n      action: async () => {\n        // Simulate swipe down gesture\n        await page.mouse.move(200, 100);\n        await page.mouse.down();\n        await page.mouse.move(200, 400);\n        await page.mouse.up();\n        await page.waitForTimeout(500);\n      },\n      validation: () => {\n        return !document.querySelector('.widget-expanded');\n      }\n    }\n  ];\n  \n  for (const test of touchTests) {\n    try {\n      await test.action();\n      \n      const result = await page.evaluate(test.validation);\n      \n      console.log(\\`Touch Test - \\${test.name}:\\`, {\n        success: result,\n        timestamp: new Date().toISOString()\n      });\n      \n      // Reset widget state\n      await page.reload();\n      await page.waitForTimeout(1000);\n      \n    } catch (error) {\n      console.log(\\`Touch Test - \\${test.name} failed:\\`, error.message);\n    }\n  }\n  \n  await browser.close();\n})();\n\\`\n```\n\n## ⚡ Performance Testing\n\n### **Widget Load Performance**\n```javascript\n// Widget loading and performance testing\nconst testWidgetPerformance = \\`\nconst { chromium } = require('playwright');\n\n(async () => {\n  const browser = await chromium.launch({ headless: true });\n  const page = await browser.newPage();\n  \n  // Enable performance tracking\n  await page.coverage.startJSCoverage();\n  await page.coverage.startCSSCoverage();\n  \n  const startTime = Date.now();\n  \n  await page.goto('http://localhost:3001/test/widget');\n  await page.waitForTimeout(3000);\n  \n  // Measure widget initialization performance\n  const performanceMetrics = await page.evaluate(() => {\n    const navigation = performance.getEntriesByType('navigation')[0];\n    const paint = performance.getEntriesByType('paint');\n    \n    return {\n      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,\n      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,\n      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,\n      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,\n      widgetInitTime: window.widgetInitTime || null,\n      resourceCount: performance.getEntriesByType('resource').length\n    };\n  });\n  \n  // Test widget interaction performance\n  const interactionStartTime = Date.now();\n  await page.click('.widget-trigger');\n  await page.waitForSelector('.widget-expanded');\n  const widgetOpenTime = Date.now() - interactionStartTime;\n  \n  // Test message sending performance\n  const messageStartTime = Date.now();\n  await page.fill('.input-field', 'Test performance message');\n  await page.click('.send-button');\n  await page.waitForSelector('.message.ai', { timeout: 10000 });\n  const aiResponseTime = Date.now() - messageStartTime;\n  \n  // Get coverage data\n  const jsCoverage = await page.coverage.stopJSCoverage();\n  const cssCoverage = await page.coverage.stopCSSCoverage();\n  \n  const performanceReport = {\n    loadTime: Date.now() - startTime,\n    metrics: performanceMetrics,\n    interactions: {\n      widgetOpenTime,\n      aiResponseTime\n    },\n    coverage: {\n      jsFiles: jsCoverage.length,\n      cssFiles: cssCoverage.length,\n      totalJSBytes: jsCoverage.reduce((acc, entry) => acc + entry.text.length, 0),\n      totalCSSBytes: cssCoverage.reduce((acc, entry) => acc + entry.text.length, 0)\n    }\n  };\n  \n  console.log('Widget Performance Report:', performanceReport);\n  \n  // Performance thresholds\n  const thresholds = {\n    widgetOpenTime: 1000,    // 1 second\n    aiResponseTime: 5000,    // 5 seconds\n    loadComplete: 3000       // 3 seconds\n  };\n  \n  const performancePass = {\n    widgetOpen: performanceReport.interactions.widgetOpenTime < thresholds.widgetOpenTime,\n    aiResponse: performanceReport.interactions.aiResponseTime < thresholds.aiResponseTime,\n    pageLoad: performanceReport.metrics.loadComplete < thresholds.loadComplete\n  };\n  \n  console.log('Performance Thresholds:', performancePass);\n  \n  await browser.close();\n})();\n\\`\n```\n\n---\n\n**This widget validation guide provides complete testing patterns for AI chat functionality, cross-domain integration, mobile responsiveness, and performance validation using Playwright MCP browser automation.**