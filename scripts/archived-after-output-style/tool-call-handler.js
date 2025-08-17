#!/usr/bin/env node

/**
 * Tool Call Handler Hook - Trigger specialist updates based on tool usage
 * 
 * This script monitors tool calls and triggers appropriate specialist agent
 * updates when tools indicate that patterns may need refreshing.
 */

const fs = require('fs')
const path = require('path')

// Get tool and args from command line
const tool = process.argv[2] || ''
const args = process.argv[3] || '{}'

// Tool to specialist mapping - simplified for MCP system
const TOOL_SPECIALIST_MAP = {
  // Development tools that trigger auto-updater
  'Task': 'auto-update-check',
  'Edit': 'pattern-freshness-check',
  'Write': 'pattern-freshness-check',
  'MultiEdit': 'pattern-freshness-check'
}

// Specialist agent trigger conditions
const SPECIALIST_TRIGGERS = {
  'ui-specialist-agent': [
    'schedule-x', 'calendar', 'shadcn', 'tailwind', 'mobile', 'responsive'
  ],
  't3-specialist-agent': [
    't3', 'next', 'trpc', 'typescript', 'app router'
  ],
  'database-specialist-agent': [
    'supabase', 'prisma', 'database', 'sql', 'rls', 'realtime'
  ],
  'auth-specialist-agent': [
    'clerk', 'auth', 'organization', 'permission', 'user', 'middleware'
  ],
  'payment-specialist-agent': [
    'mollie', 'ideal', 'payment', 'invoice', 'btw', 'dutch'
  ],
  'testing-specialist-agent': [
    'playwright', 'test', 'browser', 'e2e', 'mobile testing'
  ],
}

function parseToolArgs(argsString) {
  try {
    return JSON.parse(argsString)
  } catch (error) {
    return {}
  }
}

function shouldTriggerSpecialist(tool, args, specialist) {
  const triggers = SPECIALIST_TRIGGERS[specialist]
  if (!triggers) return false
  
  // Check if tool directly maps to specialist
  if (TOOL_SPECIALIST_MAP[tool]?.[specialist]) {
    return true
  }
  
  // Check if args contain trigger keywords
  const argsString = JSON.stringify(args).toLowerCase()
  return triggers.some(trigger => argsString.includes(trigger))
}

function checkPatternFreshness(patternFiles) {
  const contextDir = path.join(__dirname, '..', 'context', 'specialists')
  const staleFiles = []
  
  for (const file of patternFiles) {
    const filePath = path.join(contextDir, file)
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      const daysSinceUpdate = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24)
      
      // Consider stale if older than 7 days
      if (daysSinceUpdate > 7) {
        staleFiles.push({
          file,
          daysSinceUpdate: Math.floor(daysSinceUpdate),
        })
      }
    }
  }
  
  return staleFiles
}

function logToolCall(tool, args, specialists) {
  const logPath = path.join(__dirname, '..', 'context', 'meta', 'tool_calls.json')
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    tool,
    args: typeof args === 'string' ? args.substring(0, 200) : JSON.stringify(args).substring(0, 200),
    triggeredSpecialists: specialists,
  }
  
  let logs = []
  if (fs.existsSync(logPath)) {
    try {
      const content = fs.readFileSync(logPath, 'utf8')
      logs = JSON.parse(content)
    } catch (error) {
      console.warn('Could not read existing tool call logs')
    }
  }
  
  logs.push(logEntry)
  
  // Keep only last 100 entries
  if (logs.length > 100) {
    logs = logs.slice(-100)
  }
  
  try {
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2))
  } catch (error) {
    console.error(`❌ Failed to log tool call: ${error.message}`)
  }
}

function suggestUpdates(toolActivity, stalePatterns) {
  if (!toolActivity && stalePatterns.length === 0) {
    return
  }
  
  console.log('\n💡 MCP-Powered Update Suggestions:')
  
  if (toolActivity === 'auto-update-check') {
    console.log('\n🔄 Tool usage suggests pattern freshness check')
    console.log('   • Run: node scripts/auto-updater.js --before-task "your task"')
  }
  
  if (stalePatterns.length > 0) {
    console.log('\n⏰ Based on pattern age:')
    stalePatterns.forEach(pattern => {
      console.log(`   • ${pattern.file} is ${pattern.daysSinceUpdate} days old`)
    })
    console.log('\n🚀 Auto-update with MCP:')
    console.log('   • node scripts/auto-updater.js --force')
  }
}

// Main execution
function main() {
  console.log('🔧 Tool Call Handler Hook Activated')
  console.log(`🛠️  Tool: ${tool}`)
  
  const parsedArgs = parseToolArgs(args)
  
  // Determine which specialists might need updates
  const triggeredSpecialists = []
  
  for (const [specialist, triggers] of Object.entries(SPECIALIST_TRIGGERS)) {
    if (shouldTriggerSpecialist(tool, parsedArgs, specialist)) {
      triggeredSpecialists.push(specialist)
    }
  }
  
  // Check for stale patterns
  const allPatternFiles = [
    'T3_BEST_PRACTICES.md',
    'DATABASE_PATTERNS.md', 
    'UI_PATTERNS.md',
    'AUTH_PATTERNS.md',
    'PAYMENT_PATTERNS.md',
    'TESTING_PATTERNS.md'
  ]
  
  const stalePatterns = checkPatternFreshness(allPatternFiles)
  
  // Log the tool call
  logToolCall(tool, parsedArgs, triggeredSpecialists)
  
  if (triggeredSpecialists.length > 0) {
    console.log(`🎯 Tool usage suggests these specialists might need updates:`)
    triggeredSpecialists.forEach(specialist => {
      console.log(`   • ${specialist}`)
    })
  }
  
  if (stalePatterns.length > 0) {
    console.log(`⚠️  Found ${stalePatterns.length} stale pattern files:`)
    stalePatterns.forEach(pattern => {
      console.log(`   • ${pattern.file} (${pattern.daysSinceUpdate} days old)`)
    })
  }
  
  // Provide suggestions
  suggestSpecialistUpdates(triggeredSpecialists, stalePatterns)
  
  if (triggeredSpecialists.length === 0 && stalePatterns.length === 0) {
    console.log('✅ All patterns appear current for this tool usage')
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { shouldTriggerSpecialist, checkPatternFreshness, logToolCall }