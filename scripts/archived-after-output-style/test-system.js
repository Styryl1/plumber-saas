#!/usr/bin/env node

/**
 * System Test - Comprehensive validation of the optimized context engineering system
 * 
 * Tests all components: MCP clients, Archon coordination, auto-updater, and hook integration
 */

const ArchonClient = require('./archon-client')
const AutoUpdater = require('./auto-updater')
const Context7Client = require('./mcp-clients/context7')
const FirecrawlClient = require('./mcp-clients/firecrawl')
const fs = require('fs')
const path = require('path')

class SystemTester {
  constructor() {
    this.archon = new ArchonClient()
    this.autoUpdater = new AutoUpdater()
    this.context7 = new Context7Client()
    this.firecrawl = new FirecrawlClient()
    
    this.testResults = {
      passed: [],
      failed: [],
      warnings: [],
      summary: {}
    }
  }
  
  async runAllTests() {
    console.log('🧪 Context Engineering System - Comprehensive Test Suite')
    console.log('=' .repeat(60))
    
    const startTime = Date.now()
    
    try {
      // Phase 1: Component Tests
      await this.testMCPClients()
      await this.testArchonClient()
      await this.testAutoUpdater()
      
      // Phase 2: Integration Tests
      await this.testWorkflowIntegration()
      await this.testHookSystem()
      
      // Phase 3: End-to-End Tests
      await this.testCompleteWorkflow()
      
      // Generate final report
      const totalTime = Date.now() - startTime
      this.generateTestReport(totalTime)
      
    } catch (error) {
      console.error(`❌ Test suite failed: ${error.message}`)
      this.testResults.failed.push({
        test: 'Test Suite Execution',
        error: error.message
      })
    }
    
    return this.testResults
  }
  
  async testMCPClients() {
    console.log('\n📡 Testing MCP Clients...')
    
    // Test Context7 Client
    try {
      console.log('  🔍 Testing Context7 client...')
      const context7Result = await this.context7.queryDocumentation('Next.js 15 latest features')
      
      if (context7Result && context7Result.sources) {
        this.pass('Context7 Client', 'Successfully queried documentation')
      } else {
        this.fail('Context7 Client', 'No sources returned from query')
      }
    } catch (error) {
      this.fail('Context7 Client', error.message)
    }
    
    // Test Firecrawl Client
    try {
      console.log('  🕷️  Testing Firecrawl client...')
      const firecrawlResult = await this.firecrawl.scrapeUrl('https://schedule-x.dev/')
      
      if (firecrawlResult && firecrawlResult.codeBlocks) {
        this.pass('Firecrawl Client', 'Successfully scraped URL and found code blocks')
      } else {
        this.fail('Firecrawl Client', 'No code blocks found in scraped content')
      }
    } catch (error) {
      this.fail('Firecrawl Client', error.message)
    }
    
    // Test MCP Caching
    try {
      console.log('  📦 Testing MCP caching...')
      const cacheDir = path.join(__dirname, '..', 'context', 'cache')
      
      if (fs.existsSync(cacheDir)) {
        const cacheFiles = fs.readdirSync(cacheDir)
        if (cacheFiles.length > 0) {
          this.pass('MCP Caching', `Found ${cacheFiles.length} cache files`)
        } else {
          this.warn('MCP Caching', 'No cache files found - caching may not be working')
        }
      } else {
        this.fail('MCP Caching', 'Cache directory not found')
      }
    } catch (error) {
      this.fail('MCP Caching', error.message)
    }
  }
  
  async testArchonClient() {
    console.log('\n🧠 Testing Archon Client...')
    
    // Test Task Creation
    try {
      console.log('  📋 Testing task creation...')
      const task = await this.archon.createTask({
        title: 'Test Task - Schedule-X Integration',
        description: 'Test task for validating Archon functionality',
        complexity: 'low',
        specialists: ['ui-specialist-agent', 't3-specialist-agent']
      })
      
      if (task && task.id) {
        this.pass('Archon Task Creation', `Created task: ${task.id}`)
        
        // Test Context Loading
        console.log('  🧠 Testing context loading...')
        const context = await this.archon.getConsolidatedContext(task.id)
        
        if (context && context.patterns) {
          this.pass('Archon Context Loading', `Loaded ${Object.keys(context.patterns).length} patterns`)
        } else {
          this.fail('Archon Context Loading', 'No patterns loaded')
        }
        
        // Test Task Completion
        await this.archon.completeTask(task.id, { status: 'test_completed' })
        this.pass('Archon Task Completion', 'Successfully completed test task')
        
      } else {
        this.fail('Archon Task Creation', 'Failed to create task')
      }
    } catch (error) {
      this.fail('Archon Task Creation', error.message)
    }
    
    // Test Knowledge Base
    try {
      console.log('  📚 Testing knowledge base...')
      const metaDir = path.join(__dirname, '..', 'context', 'meta')
      const kbMeta = path.join(metaDir, 'knowledge_base_meta.json')
      
      if (fs.existsSync(kbMeta)) {
        const meta = JSON.parse(fs.readFileSync(kbMeta, 'utf8'))
        this.pass('Archon Knowledge Base', `Initialized with ${Object.keys(meta.specialists).length} specialists`)
      } else {
        this.fail('Archon Knowledge Base', 'Knowledge base metadata not found')
      }
    } catch (error) {
      this.fail('Archon Knowledge Base', error.message)
    }
  }
  
  async testAutoUpdater() {
    console.log('\n🔄 Testing Auto-Updater...')
    
    // Test Pattern Analysis
    try {
      console.log('  📊 Testing pattern analysis...')
      const patterns = ['UI_PATTERNS.md', 'T3_BEST_PRACTICES.md']
      const freshness = await this.archon.checkPatternFreshness(patterns)
      
      if (freshness && Object.keys(freshness).length === patterns.length) {
        this.pass('Auto-Updater Analysis', `Analyzed ${patterns.length} patterns`)
      } else {
        this.fail('Auto-Updater Analysis', 'Pattern analysis failed')
      }
    } catch (error) {
      this.fail('Auto-Updater Analysis', error.message)
    }
    
    // Test Prompt Analysis
    try {
      console.log('  🎯 Testing prompt analysis...')
      const requiredPatterns = this.autoUpdater.analyzePromptForPatterns(
        'Add Schedule-X calendar with tRPC integration'
      )
      
      if (requiredPatterns.includes('UI_PATTERNS.md') && requiredPatterns.includes('T3_BEST_PRACTICES.md')) {
        this.pass('Auto-Updater Prompt Analysis', `Identified ${requiredPatterns.length} required patterns`)
      } else {
        this.fail('Auto-Updater Prompt Analysis', 'Failed to identify correct patterns')
      }
    } catch (error) {
      this.fail('Auto-Updater Prompt Analysis', error.message)
    }
  }
  
  async testWorkflowIntegration() {
    console.log('\n🔗 Testing Workflow Integration...')
    
    // Test Specialist Coordination
    try {
      console.log('  🤖 Testing specialist coordination...')
      
      // Create a test task that requires multiple specialists
      const task = await this.archon.createTask({
        title: 'Integration Test - Multi-Specialist Task',
        description: 'Test task requiring UI, T3, and Database specialists',
        complexity: 'medium',
        specialists: ['ui-specialist-agent', 't3-specialist-agent', 'database-specialist-agent']
      })
      
      // Check if all required patterns are identified
      if (task.knowledge.patternsLoaded.length >= 3) {
        this.pass('Specialist Coordination', 'Multiple specialists correctly identified')
      } else {
        this.fail('Specialist Coordination', 'Failed to identify all required specialists')
      }
      
    } catch (error) {
      this.fail('Specialist Coordination', error.message)
    }
    
    // Test Pattern Updates
    try {
      console.log('  📝 Testing pattern updates...')
      
      // Simulate a pattern update by temporarily modifying a file timestamp
      const testPattern = path.join(__dirname, '..', 'context', 'specialists', 'UI_PATTERNS.md')
      
      if (fs.existsSync(testPattern)) {
        const originalTime = fs.statSync(testPattern).mtime
        
        // The pattern should be detected as fresh since we just created it
        const freshness = await this.archon.checkPatternFreshness(['UI_PATTERNS.md'])
        
        if (freshness['UI_PATTERNS.md']) {
          this.pass('Pattern Updates', 'Pattern freshness detection working')
        } else {
          this.fail('Pattern Updates', 'Pattern freshness detection failed')
        }
      } else {
        this.warn('Pattern Updates', 'Test pattern file not found')
      }
      
    } catch (error) {
      this.fail('Pattern Updates', error.message)
    }
  }
  
  async testHookSystem() {
    console.log('\n🪝 Testing Hook System...')
    
    // Test Hook Configuration
    try {
      console.log('  ⚙️  Testing hook configuration...')
      const hooksFile = path.join(__dirname, '..', '.claude', 'hooks.json')
      
      if (fs.existsSync(hooksFile)) {
        const hooks = JSON.parse(fs.readFileSync(hooksFile, 'utf8'))
        
        const requiredHooks = [
          'user-prompt-submit-hook',
          'post-update-context-hook',
          'tool-call-hook',
          'context-update-hook'
        ]
        
        const configuredHooks = Object.keys(hooks)
        const missingHooks = requiredHooks.filter(h => !configuredHooks.includes(h))
        
        if (missingHooks.length === 0) {
          this.pass('Hook Configuration', `All ${requiredHooks.length} hooks configured`)
        } else {
          this.fail('Hook Configuration', `Missing hooks: ${missingHooks.join(', ')}`)
        }
      } else {
        this.fail('Hook Configuration', 'hooks.json file not found')
      }
    } catch (error) {
      this.fail('Hook Configuration', error.message)
    }
    
    // Test Hook Scripts
    try {
      console.log('  📜 Testing hook scripts...')
      const requiredScripts = [
        'scripts/auto-updater.js',
        'scripts/load-context.js',
        'scripts/mcp-coordinator.js',
        'scripts/tool-call-handler.js'
      ]
      
      const missingScripts = requiredScripts.filter(script => {
        return !fs.existsSync(path.join(__dirname, '..', script))
      })
      
      if (missingScripts.length === 0) {
        this.pass('Hook Scripts', `All ${requiredScripts.length} scripts present`)
      } else {
        this.fail('Hook Scripts', `Missing scripts: ${missingScripts.join(', ')}`)
      }
    } catch (error) {
      this.fail('Hook Scripts', error.message)
    }
  }
  
  async testCompleteWorkflow() {
    console.log('\n🚀 Testing Complete Workflow...')
    
    try {
      console.log('  🎭 Simulating complete user workflow...')
      
      // Step 1: User submits prompt (simulating hook trigger)
      const userPrompt = 'Implement Schedule-X calendar with drag-drop job scheduling'
      
      // Step 2: Auto-updater checks and updates patterns
      const updateResults = await this.autoUpdater.updateBeforeTask(userPrompt, { 
        criticalOnly: true // Only critical updates for test speed
      })
      
      // Step 3: Create task in Archon
      const task = await this.archon.createTask({
        title: 'Complete Workflow Test',
        description: userPrompt,
        complexity: 'medium',
        specialists: ['ui-specialist-agent', 't3-specialist-agent']
      })
      
      // Step 4: Load consolidated context
      const context = await this.archon.getConsolidatedContext(task.id, {
        maxTokens: 4000
      })
      
      // Step 5: Validate workflow results
      const workflowValid = (
        updateResults && 
        task && task.id &&
        context && context.patterns &&
        Object.keys(context.patterns).length > 0
      )
      
      if (workflowValid) {
        this.pass('Complete Workflow', 'End-to-end workflow executed successfully')
        console.log(`    ✓ Patterns updated: ${updateResults.updated?.length || 0}`)
        console.log(`    ✓ Task created: ${task.id}`)
        console.log(`    ✓ Context loaded: ${Object.keys(context.patterns).length} patterns`)
        console.log(`    ✓ Token count: ${context.tokenCount}`)
        console.log(`    ✓ Confidence: ${Math.round(context.confidence * 100)}%`)
      } else {
        this.fail('Complete Workflow', 'End-to-end workflow failed')
      }
      
      // Step 6: Complete task
      await this.archon.completeTask(task.id, {
        workflow_test: true,
        patterns_loaded: Object.keys(context.patterns),
        total_tokens: context.tokenCount
      })
      
    } catch (error) {
      this.fail('Complete Workflow', error.message)
    }
  }
  
  pass(test, message) {
    console.log(`    ✅ ${test}: ${message}`)
    this.testResults.passed.push({ test, message })
  }
  
  fail(test, message) {
    console.log(`    ❌ ${test}: ${message}`)
    this.testResults.failed.push({ test, message })
  }
  
  warn(test, message) {
    console.log(`    ⚠️  ${test}: ${message}`)
    this.testResults.warnings.push({ test, message })
  }
  
  generateTestReport(totalTime) {
    const { passed, failed, warnings } = this.testResults
    
    console.log('\n' + '=' .repeat(60))
    console.log('📊 TEST REPORT')
    console.log('=' .repeat(60))
    
    console.log(`⏱️  Total time: ${Math.round(totalTime / 1000)}s`)
    console.log(`✅ Passed: ${passed.length}`)
    console.log(`❌ Failed: ${failed.length}`)
    console.log(`⚠️  Warnings: ${warnings.length}`)
    
    const successRate = Math.round((passed.length / (passed.length + failed.length)) * 100)
    console.log(`📈 Success rate: ${successRate}%`)
    
    if (failed.length > 0) {
      console.log('\n❌ FAILED TESTS:')
      failed.forEach(({ test, message }) => {
        console.log(`   • ${test}: ${message}`)
      })
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:')
      warnings.forEach(({ test, message }) => {
        console.log(`   • ${test}: ${message}`)
      })
    }
    
    // System Status Assessment
    console.log('\n🎯 SYSTEM STATUS:')
    
    if (failed.length === 0) {
      console.log('🟢 EXCELLENT - All systems operational')
      console.log('   ✓ Context engineering system fully optimized')
      console.log('   ✓ Ready for production use')
    } else if (failed.length <= 2) {
      console.log('🟡 GOOD - Minor issues detected')
      console.log('   ✓ Core functionality working')
      console.log('   ⚠️  Some optimizations needed')
    } else {
      console.log('🔴 NEEDS ATTENTION - Multiple issues detected')
      console.log('   ❌ Core functionality may be impaired')
      console.log('   🔧 Requires debugging and fixes')
    }
    
    console.log('\n🚀 NEXT STEPS:')
    if (failed.length === 0) {
      console.log('   • System is ready for production use!')
      console.log('   • Monitor performance and pattern freshness')
      console.log('   • Consider Phase 4 optimizations (caching, routing)')
    } else {
      console.log('   • Address failed tests before production use')
      console.log('   • Check MCP configurations and credentials')
      console.log('   • Verify all required files are present')
    }
    
    this.testResults.summary = {
      totalTime: Math.round(totalTime / 1000),
      passed: passed.length,
      failed: failed.length,
      warnings: warnings.length,
      successRate,
      status: failed.length === 0 ? 'excellent' : failed.length <= 2 ? 'good' : 'needs-attention'
    }
  }
}

// CLI interface
async function main() {
  const tester = new SystemTester()
  
  console.log('🧪 Starting Context Engineering System Test Suite...')
  console.log('This will validate all MCP integrations and workflow automation.\n')
  
  try {
    const results = await tester.runAllTests()
    
    // Exit with appropriate code
    if (results.failed.length === 0) {
      process.exit(0) // All tests passed
    } else if (results.failed.length <= 2) {
      process.exit(1) // Minor issues
    } else {
      process.exit(2) // Major issues
    }
    
  } catch (error) {
    console.error(`💥 Test suite crashed: ${error.message}`)
    process.exit(3)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = SystemTester