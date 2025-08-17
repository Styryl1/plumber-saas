#!/usr/bin/env node

/**
 * Auto-Updater - Automatic pattern freshness checking and updates
 * 
 * This script ensures patterns are always fresh before task execution
 * Integrates with Archon MCP for intelligent update coordination
 */

const ArchonClient = require('./archon-client')
const path = require('path')

class AutoUpdater {
  constructor() {
    this.archon = new ArchonClient()
    this.maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    this.forceUpdateAge = 14 * 24 * 60 * 60 * 1000 // 14 days for force update
  }
  
  async checkAndUpdatePatterns(requiredPatterns = null, options = {}) {
    console.log('🔄 Auto-Updater: Checking pattern freshness...')
    
    // If no specific patterns requested, check all
    const patterns = requiredPatterns || [
      'T3_BEST_PRACTICES.md',
      'UI_PATTERNS.md', 
      'DATABASE_PATTERNS.md',
      'AUTH_PATTERNS.md',
      'PAYMENT_PATTERNS.md',
      'TESTING_PATTERNS.md'
    ]
    
    // Check freshness of all patterns
    const freshnessCheck = await this.archon.checkPatternFreshness(patterns)
    
    // Categorize patterns by update urgency
    const analysis = this.analyzeUpdateNeeds(freshnessCheck)
    
    if (analysis.critical.length === 0 && analysis.stale.length === 0) {
      console.log('✅ All patterns are fresh, no updates needed')
      return {
        updated: [],
        skipped: patterns,
        fresh: patterns.length,
        totalTime: 0
      }
    }
    
    // Display update plan
    this.displayUpdatePlan(analysis)
    
    // Execute updates based on urgency and options
    const updateResults = await this.executeUpdates(analysis, options)
    
    return updateResults
  }
  
  analyzeUpdateNeeds(freshnessCheck) {
    const analysis = {
      critical: [],    // Missing files or > 14 days old
      stale: [],       // > 7 days old
      fresh: [],       // <= 7 days old
      summary: {}
    }
    
    Object.entries(freshnessCheck).forEach(([pattern, freshness]) => {
      if (!freshness.exists) {
        analysis.critical.push({
          pattern,
          reason: 'Missing file',
          urgency: 'critical',
          ...freshness
        })
      } else if (freshness.daysSinceUpdate > 14) {
        analysis.critical.push({
          pattern,
          reason: `${freshness.daysSinceUpdate} days old (critical)`,
          urgency: 'critical',
          ...freshness
        })
      } else if (freshness.needsUpdate) {
        analysis.stale.push({
          pattern,
          reason: `${freshness.daysSinceUpdate} days old (stale)`,
          urgency: 'medium',
          ...freshness
        })
      } else {
        analysis.fresh.push({
          pattern,
          reason: `${freshness.daysSinceUpdate} days old (fresh)`,
          urgency: 'none',
          ...freshness
        })
      }
    })
    
    analysis.summary = {
      total: Object.keys(freshnessCheck).length,
      critical: analysis.critical.length,
      stale: analysis.stale.length,
      fresh: analysis.fresh.length,
      needsUpdate: analysis.critical.length + analysis.stale.length
    }
    
    return analysis
  }
  
  displayUpdatePlan(analysis) {
    const { summary, critical, stale, fresh } = analysis
    
    console.log('\n📊 Pattern Freshness Analysis:')
    console.log(`   • Total patterns: ${summary.total}`)
    console.log(`   • Critical updates: ${summary.critical}`)
    console.log(`   • Stale updates: ${summary.stale}`)
    console.log(`   • Fresh patterns: ${summary.fresh}`)
    
    if (critical.length > 0) {
      console.log('\n🚨 Critical Updates Required:')
      critical.forEach(item => {
        console.log(`   • ${item.pattern}: ${item.reason}`)
      })
    }
    
    if (stale.length > 0) {
      console.log('\n⚠️  Stale Updates Recommended:')
      stale.forEach(item => {
        console.log(`   • ${item.pattern}: ${item.reason}`)
      })
    }
    
    if (fresh.length > 0) {
      console.log('\n✅ Fresh Patterns (No Update Needed):')
      fresh.forEach(item => {
        console.log(`   • ${item.pattern}: ${item.reason}`)
      })
    }
  }
  
  async executeUpdates(analysis, options = {}) {
    const startTime = Date.now()
    const results = {
      updated: [],
      failed: [],
      skipped: [],
      fresh: analysis.fresh.map(f => f.pattern),
      totalTime: 0,
      summary: {}
    }
    
    // Determine which patterns to update
    let toUpdate = []
    
    if (options.force) {
      // Force update all patterns
      toUpdate = [...analysis.critical, ...analysis.stale, ...analysis.fresh]
      console.log('🔄 Force update mode: Updating ALL patterns')
    } else if (options.criticalOnly) {
      // Only update critical patterns
      toUpdate = analysis.critical
      results.skipped = [...analysis.stale, ...analysis.fresh].map(f => f.pattern)
      console.log('🚨 Critical only mode: Updating critical patterns only')
    } else {
      // Default: Update critical and stale patterns
      toUpdate = [...analysis.critical, ...analysis.stale]
      results.skipped = analysis.fresh.map(f => f.pattern)
      console.log('🔄 Standard mode: Updating critical and stale patterns')
    }
    
    if (toUpdate.length === 0) {
      console.log('✅ No patterns need updating')
      results.totalTime = Date.now() - startTime
      return results
    }
    
    console.log(`\n🚀 Starting updates for ${toUpdate.length} patterns...`)
    
    // Create a temporary task for the update process
    const updateTask = await this.archon.createTask({
      title: 'Auto-Update Pattern Refresh',
      description: `Updating ${toUpdate.length} patterns: ${toUpdate.map(p => p.pattern).join(', ')}`,
      complexity: 'low',
      specialists: this.getRequiredSpecialists(toUpdate.map(p => p.pattern)),
      automated: true
    })
    
    // Execute specialist updates through Archon
    const updateResults = await this.archon.triggerSpecialistUpdates(updateTask)
    
    // Process results
    results.updated = updateResults.updated.map(u => u.pattern)
    results.failed = updateResults.failed.map(f => f.pattern)
    results.totalTime = Date.now() - startTime
    
    // Generate summary
    results.summary = {
      total: toUpdate.length,
      successful: results.updated.length,
      failed: results.failed.length,
      successRate: Math.round((results.updated.length / toUpdate.length) * 100),
      timeTaken: `${Math.round(results.totalTime / 1000)}s`
    }
    
    // Complete the update task
    await this.archon.completeTask(updateTask.id, results)
    
    this.displayUpdateResults(results)
    
    return results
  }
  
  getRequiredSpecialists(patterns) {
    const specialists = []
    const mapping = {
      'T3_BEST_PRACTICES.md': 't3-specialist-agent',
      'UI_PATTERNS.md': 'ui-specialist-agent',
      'DATABASE_PATTERNS.md': 'database-specialist-agent',
      'AUTH_PATTERNS.md': 'auth-specialist-agent',
      'PAYMENT_PATTERNS.md': 'payment-specialist-agent',
      'TESTING_PATTERNS.md': 'testing-specialist-agent'
    }
    
    patterns.forEach(pattern => {
      const specialist = mapping[pattern]
      if (specialist && !specialists.includes(specialist)) {
        specialists.push(specialist)
      }
    })
    
    return specialists
  }
  
  displayUpdateResults(results) {
    const { summary, updated, failed, skipped } = results
    
    console.log('\n📊 Auto-Update Results:')
    console.log(`   • Total processed: ${summary.total}`)
    console.log(`   • Successfully updated: ${summary.successful}`)
    console.log(`   • Failed: ${summary.failed}`)
    console.log(`   • Success rate: ${summary.successRate}%`)
    console.log(`   • Time taken: ${summary.timeTaken}`)
    
    if (updated.length > 0) {
      console.log('\n✅ Successfully Updated:')
      updated.forEach(pattern => {
        console.log(`   • ${pattern}`)
      })
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Updates:')
      failed.forEach(pattern => {
        console.log(`   • ${pattern}`)
      })
    }
    
    if (skipped.length > 0) {
      console.log('\n⏭️  Skipped (Fresh):')
      skipped.forEach(pattern => {
        console.log(`   • ${pattern}`)
      })
    }
    
    // Recommendation for next steps
    if (summary.successRate === 100) {
      console.log('\n🎉 All patterns successfully updated!')
    } else if (summary.successRate >= 80) {
      console.log('\n👍 Most patterns updated successfully')
    } else {
      console.log('\n⚠️  Some patterns failed to update - check logs and try again')
    }
  }
  
  async updateBeforeTask(userPrompt, options = {}) {
    console.log('🎯 Auto-Updater: Pre-task pattern check...')
    console.log(`📝 Task: "${userPrompt.substring(0, 100)}..."`)
    
    // Analyze prompt to determine required patterns
    const requiredPatterns = this.analyzePromptForPatterns(userPrompt)
    
    if (requiredPatterns.length === 0) {
      console.log('ℹ️  No specific patterns required for this task')
      return { updated: [], fresh: [], totalTime: 0 }
    }
    
    console.log(`🎯 Required patterns: ${requiredPatterns.join(', ')}`)
    
    // Check and update only required patterns
    const results = await this.checkAndUpdatePatterns(requiredPatterns, {
      ...options,
      optimized: true // Only update what's needed
    })
    
    if (results.updated.length > 0) {
      console.log(`✅ Patterns updated - ready for task execution`)
    } else {
      console.log(`✅ All required patterns fresh - ready for task execution`)
    }
    
    return results
  }
  
  analyzePromptForPatterns(prompt) {
    const patterns = []
    const promptLower = prompt.toLowerCase()
    
    const keywordMappings = {
      't3': ['T3_BEST_PRACTICES.md'],
      'next': ['T3_BEST_PRACTICES.md'],
      'trpc': ['T3_BEST_PRACTICES.md'],
      'typescript': ['T3_BEST_PRACTICES.md'],
      
      'calendar': ['UI_PATTERNS.md', 'T3_BEST_PRACTICES.md'],
      'schedule-x': ['UI_PATTERNS.md'],
      'shadcn': ['UI_PATTERNS.md'],
      'tailwind': ['UI_PATTERNS.md'],
      'mobile': ['UI_PATTERNS.md'],
      'responsive': ['UI_PATTERNS.md'],
      
      'database': ['DATABASE_PATTERNS.md'],
      'supabase': ['DATABASE_PATTERNS.md', 'AUTH_PATTERNS.md'],
      'prisma': ['DATABASE_PATTERNS.md'],
      'sql': ['DATABASE_PATTERNS.md'],
      'rls': ['DATABASE_PATTERNS.md'],
      
      'auth': ['AUTH_PATTERNS.md'],
      'clerk': ['AUTH_PATTERNS.md'],
      'organization': ['AUTH_PATTERNS.md'],
      'permission': ['AUTH_PATTERNS.md'],
      'login': ['AUTH_PATTERNS.md'],
      
      'payment': ['PAYMENT_PATTERNS.md'],
      'mollie': ['PAYMENT_PATTERNS.md'],
      'ideal': ['PAYMENT_PATTERNS.md'],
      'invoice': ['PAYMENT_PATTERNS.md'],
      'btw': ['PAYMENT_PATTERNS.md'],
      
      'test': ['TESTING_PATTERNS.md'],
      'playwright': ['TESTING_PATTERNS.md'],
      'browser': ['TESTING_PATTERNS.md'],
      'e2e': ['TESTING_PATTERNS.md']
    }
    
    Object.entries(keywordMappings).forEach(([keyword, patternList]) => {
      if (promptLower.includes(keyword)) {
        patternList.forEach(pattern => {
          if (!patterns.includes(pattern)) {
            patterns.push(pattern)
          }
        })
      }
    })
    
    return patterns
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const autoUpdater = new AutoUpdater()
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔄 Auto-Updater - Automatic Pattern Freshness Management

Usage:
  node auto-updater.js [options] [prompt]

Options:
  --force           Force update all patterns regardless of age
  --critical-only   Only update critical patterns (missing or >14 days)
  --before-task     Update patterns before task execution (use with prompt)
  --patterns        Comma-separated list of specific patterns to check
  --help, -h        Show this help message

Examples:
  node auto-updater.js
  node auto-updater.js --force
  node auto-updater.js --before-task "Add Schedule-X calendar"
  node auto-updater.js --patterns "UI_PATTERNS.md,T3_BEST_PRACTICES.md"
`)
    return
  }
  
  const options = {
    force: args.includes('--force'),
    criticalOnly: args.includes('--critical-only'),
    beforeTask: args.includes('--before-task')
  }
  
  const patternsArg = args.find(arg => arg.startsWith('--patterns='))
  const specificPatterns = patternsArg ? 
    patternsArg.split('=')[1].split(',').map(p => p.trim()) : null
  
  const prompt = args.find(arg => !arg.startsWith('--'))
  
  try {
    let results
    
    if (options.beforeTask && prompt) {
      results = await autoUpdater.updateBeforeTask(prompt, options)
    } else {
      results = await autoUpdater.checkAndUpdatePatterns(specificPatterns, options)
    }
    
    // Exit with appropriate code for CI/CD
    if (results.failed.length > 0) {
      process.exit(1) // Some updates failed
    } else {
      process.exit(0) // All good
    }
    
  } catch (error) {
    console.error(`❌ Auto-updater failed: ${error.message}`)
    process.exit(2)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = AutoUpdater