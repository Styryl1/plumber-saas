#!/usr/bin/env node

/**
 * Context Loading Hook - Auto-load relevant context based on user prompt
 * 
 * This script analyzes the user's prompt and loads relevant specialist patterns
 * to provide Claude with up-to-date context for implementation.
 */

const fs = require('fs')
const path = require('path')

// Get user prompt from command line
const prompt = process.argv[2] || ''

// Context mapping - keywords to specialist files
const CONTEXT_MAP = {
  // T3 Stack related
  't3': ['T3_BEST_PRACTICES.md'],
  'next': ['T3_BEST_PRACTICES.md', 'UI_PATTERNS.md'], 
  'nextjs': ['T3_BEST_PRACTICES.md', 'UI_PATTERNS.md'],
  'trpc': ['T3_BEST_PRACTICES.md'],
  'typescript': ['T3_BEST_PRACTICES.md'],
  'prisma': ['DATABASE_PATTERNS.md'],
  
  // UI related
  'schedule-x': ['UI_PATTERNS.md', 'T3_BEST_PRACTICES.md'],
  'calendar': ['UI_PATTERNS.md', 'DATABASE_PATTERNS.md'],
  'shadcn': ['UI_PATTERNS.md'],
  'tailwind': ['UI_PATTERNS.md'],
  'mobile': ['UI_PATTERNS.md', 'TESTING_PATTERNS.md'],
  'responsive': ['UI_PATTERNS.md'],
  
  // Database related
  'database': ['DATABASE_PATTERNS.md', 'AUTH_PATTERNS.md'],
  'supabase': ['DATABASE_PATTERNS.md', 'AUTH_PATTERNS.md'],
  'postgresql': ['DATABASE_PATTERNS.md'],
  'sql': ['DATABASE_PATTERNS.md'],
  'rls': ['DATABASE_PATTERNS.md', 'AUTH_PATTERNS.md'],
  'realtime': ['DATABASE_PATTERNS.md'],
  
  // Authentication related
  'auth': ['AUTH_PATTERNS.md', 'T3_BEST_PRACTICES.md'],
  'clerk': ['AUTH_PATTERNS.md'],
  'organization': ['AUTH_PATTERNS.md'],
  'permission': ['AUTH_PATTERNS.md'],
  'user': ['AUTH_PATTERNS.md'],
  
  // Payment related
  'payment': ['PAYMENT_PATTERNS.md', 'TESTING_PATTERNS.md'],
  'mollie': ['PAYMENT_PATTERNS.md'],
  'ideal': ['PAYMENT_PATTERNS.md'],
  'invoice': ['PAYMENT_PATTERNS.md', 'DATABASE_PATTERNS.md'],
  'btw': ['PAYMENT_PATTERNS.md'],
  
  // Testing related
  'test': ['TESTING_PATTERNS.md'],
  'playwright': ['TESTING_PATTERNS.md'],
  'browser': ['TESTING_PATTERNS.md'],
  'e2e': ['TESTING_PATTERNS.md'],
  
  // Job management (domain specific)
  'job': ['DATABASE_PATTERNS.md', 'UI_PATTERNS.md', 'AUTH_PATTERNS.md'],
  'customer': ['DATABASE_PATTERNS.md', 'AUTH_PATTERNS.md'],
  'plumber': ['DATABASE_PATTERNS.md', 'AUTH_PATTERNS.md'],
  'scheduling': ['UI_PATTERNS.md', 'DATABASE_PATTERNS.md'],
}

// Priority keywords (if found, these patterns are essential)
const PRIORITY_KEYWORDS = {
  'schedule-x': ['UI_PATTERNS.md'],
  'mollie': ['PAYMENT_PATTERNS.md'],
  'clerk': ['AUTH_PATTERNS.md'],
  'supabase': ['DATABASE_PATTERNS.md'],
  'trpc': ['T3_BEST_PRACTICES.md'],
}

function analyzePrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase()
  const contextFiles = new Set()
  
  // Check priority keywords first
  for (const [keyword, files] of Object.entries(PRIORITY_KEYWORDS)) {
    if (lowerPrompt.includes(keyword)) {
      files.forEach(file => contextFiles.add(file))
      console.log(`🎯 Priority context detected: ${keyword} → ${files.join(', ')}`)
    }
  }
  
  // Check regular keywords
  for (const [keyword, files] of Object.entries(CONTEXT_MAP)) {
    if (lowerPrompt.includes(keyword)) {
      files.forEach(file => contextFiles.add(file))
    }
  }
  
  return Array.from(contextFiles)
}

function loadContextFiles(files) {
  const contextDir = path.join(__dirname, '..', 'context', 'specialists')
  const loadedFiles = []
  
  for (const file of files) {
    const filePath = path.join(contextDir, file)
    
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const stats = fs.statSync(filePath)
        const daysSinceUpdate = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24)
        
        loadedFiles.push({
          file,
          path: filePath,
          size: content.length,
          lastUpdated: stats.mtime.toISOString().split('T')[0],
          daysSinceUpdate: Math.floor(daysSinceUpdate),
          fresh: daysSinceUpdate < 7, // Consider fresh if updated in last 7 days
        })
        
        console.log(`📖 Loaded: ${file} (${Math.floor(content.length / 1024)}KB, ${Math.floor(daysSinceUpdate)}d old)`)
        
        if (daysSinceUpdate > 7) {
          console.log(`⚠️  Warning: ${file} is ${Math.floor(daysSinceUpdate)} days old - consider updating`)
        }
        
      } catch (error) {
        console.error(`❌ Failed to load ${file}: ${error.message}`)
      }
    } else {
      console.log(`❌ Context file not found: ${file}`)
    }
  }
  
  return loadedFiles
}

function getSpecialistForFile(fileName) {
  const fileToSpecialist = {
    'T3_BEST_PRACTICES.md': 't3-specialist-agent',
    'UI_PATTERNS.md': 'ui-specialist-agent',
    'DATABASE_PATTERNS.md': 'database-specialist-agent',
    'AUTH_PATTERNS.md': 'auth-specialist-agent',
    'PAYMENT_PATTERNS.md': 'payment-specialist-agent',
    'TESTING_PATTERNS.md': 'testing-specialist-agent'
  }
  return fileToSpecialist[fileName] || 'general-purpose'
}

function updateContextMetadata(loadedFiles) {
  const metaPath = path.join(__dirname, '..', 'context', 'meta', 'last_loaded.json')
  const metadata = {
    timestamp: new Date().toISOString(),
    prompt: prompt.substring(0, 200), // First 200 chars
    loadedFiles: loadedFiles.map(f => ({
      file: f.file,
      lastUpdated: f.lastUpdated,
      fresh: f.fresh,
    })),
    totalFiles: loadedFiles.length,
    staleFiles: loadedFiles.filter(f => !f.fresh).map(f => f.file),
  }
  
  try {
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.error(`❌ Failed to update metadata: ${error.message}`)
  }
}

// Main execution
function main() {
  console.log('🚀 Context Loading Hook Activated')
  console.log(`📝 Analyzing prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`)
  
  const relevantFiles = analyzePrompt(prompt)
  
  if (relevantFiles.length === 0) {
    console.log('ℹ️  No specific context patterns detected - using general knowledge')
    return
  }
  
  console.log(`🎯 Identified ${relevantFiles.length} relevant context files:`)
  relevantFiles.forEach(file => console.log(`   • ${file}`))
  
  const loadedFiles = loadContextFiles(relevantFiles)
  updateContextMetadata(loadedFiles)
  
  // Summary
  const totalSize = loadedFiles.reduce((sum, f) => sum + f.size, 0)
  const freshFiles = loadedFiles.filter(f => f.fresh).length
  const staleFiles = loadedFiles.length - freshFiles
  
  console.log('\n📊 Context Loading Summary:')
  console.log(`   • Files loaded: ${loadedFiles.length}`)
  console.log(`   • Total size: ${Math.floor(totalSize / 1024)}KB`)
  console.log(`   • Fresh files: ${freshFiles}`)
  console.log(`   • Stale files: ${staleFiles}`)
  
  if (staleFiles > 0) {
    console.log(`\n💡 MCP Update Recommendations:`)
    const staleFileList = loadedFiles.filter(f => !f.fresh)
    staleFileList.forEach(file => {
      const specialist = getSpecialistForFile(file.fileName)
      console.log(`   • ${file.fileName} (${file.daysSinceUpdate}d old): claude task "Update with Context7+Firecrawl MCP" --agent=${specialist}`)
    })
    console.log(`   • Or run all: node scripts/update-specialists.js`)
  }
  
  console.log('✅ Context loading complete - Claude now has relevant expert patterns!')
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { analyzePrompt, loadContextFiles, updateContextMetadata }