#!/usr/bin/env node

/**
 * PRP Workflow Engine - Complete Automation System
 * 
 * Orchestrates: Plan Mode → PRP Creation → Agent Patterns → Implementation → Feedback Loop
 */

const fs = require('fs')
const path = require('path')
// const ArchonClient = require('./archon-client') // Removed - simplified workflow
const AutoUpdater = require('./auto-updater')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.mcp') })

class PRPWorkflowEngine {
  constructor() {
    // this.archon = new ArchonClient() // Removed - simplified workflow
    this.autoUpdater = new AutoUpdater()
    
    this.prpDir = path.join(__dirname, '..', 'context', 'prp-active')
    this.templatesDir = path.join(__dirname, '..', 'context', 'prp-system')
    this.resultsDir = path.join(__dirname, '..', 'context', 'workflow-results')
    
    this.ensureDirectories()
  }
  
  ensureDirectories() {
    [this.prpDir, this.resultsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }
  
  /**
   * Main workflow orchestration
   * Called from plan mode completion or user request
   */
  async executeWorkflow(userPrompt, planModeOutput = null) {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log(`🚀 Starting PRP Workflow: ${workflowId}`)
    console.log(`📝 User Prompt: "${userPrompt.substring(0, 100)}..."`)
    
    const workflow = {
      id: workflowId,
      startTime: Date.now(),
      userPrompt,
      planModeOutput,
      steps: {},
      success: false,
      learnings: []
    }
    
    try {
      // Step 1: Auto-detect complexity and create PRP
      workflow.steps.prpCreation = await this.createPRP(userPrompt, planModeOutput)
      
      // Step 2: Create simplified task tracking (no Archon dependency)
      workflow.steps.taskTracking = await this.createTaskTracking(workflow.steps.prpCreation)
      
      // Step 3: Get agent pattern suggestions
      workflow.steps.agentPatterns = await this.getAgentPatternSuggestions(workflow.steps.prpCreation)
      
      // Step 4: Create implementation context
      workflow.steps.implementationContext = await this.createImplementationContext(workflow.steps)
      
      // Step 5: Record workflow for feedback
      workflow.steps.workflowRecording = await this.recordWorkflowForFeedback(workflow)
      
      workflow.success = true
      workflow.endTime = Date.now()
      workflow.totalTime = workflow.endTime - workflow.startTime
      
      console.log(`✅ PRP Workflow Complete: ${workflow.totalTime}ms`)
      return workflow
      
    } catch (error) {
      workflow.error = error.message
      workflow.success = false
      workflow.endTime = Date.now()
      
      console.error(`❌ PRP Workflow Failed: ${error.message}`)
      
      // Record failure for learning
      await this.recordFailure(workflow, error)
      
      throw error
    } finally {
      // Always save workflow results
      await this.saveWorkflowResults(workflow)
    }
  }
  
  /**
   * Step 1: Auto-detect complexity and create appropriate PRP
   */
  async createPRP(userPrompt, planModeOutput) {
    console.log('📋 Step 1: Creating PRP...')
    
    const complexity = this.detectComplexity(userPrompt, planModeOutput)
    const template = await this.selectPRPTemplate(complexity)
    const prp = await this.generatePRPFromTemplate(template, userPrompt, planModeOutput, complexity)
    
    // Save PRP to active directory
    const prpPath = path.join(this.prpDir, `${prp.id}.md`)
    fs.writeFileSync(prpPath, prp.content)
    
    console.log(`   ✅ Created ${complexity} PRP: ${prp.id}`)
    
    return {
      id: prp.id,
      complexity,
      template: template.name,
      path: prpPath,
      content: prp.content,
      metadata: prp.metadata
    }
  }
  
  /**
   * Detect feature complexity from user input
   */
  detectComplexity(userPrompt, planModeOutput) {
    const prompt = (userPrompt + ' ' + (planModeOutput || '')).toLowerCase()
    
    // Complex system keywords
    const complexKeywords = [
      'emergency', 'payment', 'ai', 'voice', 'diagnostic', 'real-time',
      'calendar', 'schedule-x', 'authentication', 'database', 'integration',
      'mollie', 'webhook', 'marketplace', 'dispatch', 'classification'
    ]
    
    // Medium feature keywords  
    const mediumKeywords = [
      'customer', 'invoice', 'job', 'search', 'filter', 'management',
      'crud', 'form', 'dashboard', 'analytics', 'reporting', 'history'
    ]
    
    // Simple UI keywords
    const simpleKeywords = [
      'color', 'style', 'button', 'header', 'layout', 'mobile',
      'responsive', 'css', 'ui', 'ux', 'visual', 'design'
    ]
    
    const complexScore = complexKeywords.filter(k => prompt.includes(k)).length
    const mediumScore = mediumKeywords.filter(k => prompt.includes(k)).length
    const simpleScore = simpleKeywords.filter(k => prompt.includes(k)).length
    
    if (complexScore > 0) return 'complex'
    if (mediumScore > 0) return 'medium' 
    if (simpleScore > 0) return 'simple'
    
    // Default to medium if unclear
    return 'medium'
  }
  
  /**
   * Select appropriate PRP template based on complexity
   */
  async selectPRPTemplate(complexity) {
    const templates = {
      simple: {
        name: 'Simple UI/UX PRP',
        sections: ['business_context', 'technical_context', 'implementation', 'validation', 'evolution_basic']
      },
      medium: {
        name: 'Medium Feature PRP', 
        sections: ['business_context', 'technical_context', 'implementation', 'data_collection', 'validation', 'evolution_2phase']
      },
      complex: {
        name: 'Complex System PRP',
        sections: ['business_context_full', 'competitive_moat', 'technical_context', 'implementation', 'data_collection', 'validation', 'evolution_4phase', 'learning_strategy']
      }
    }
    
    return templates[complexity] || templates.medium
  }
  
  /**
   * Generate PRP content from template
   */
  async generatePRPFromTemplate(template, userPrompt, planModeOutput, complexity) {
    const prpId = `prp_${Date.now()}_${complexity}`
    
    // Load business context from existing documents
    const businessContext = await this.loadBusinessContext()
    
    // Create PRP content based on template
    const metadata = {
      id: prpId,
      complexity,
      template: template.name,
      created: new Date().toISOString(),
      userPrompt,
      planModeOutput: planModeOutput ? 'included' : 'none',
      estimatedTime: this.estimateImplementationTime(complexity),
      requiredSpecialists: this.identifyRequiredSpecialists(userPrompt)
    }
    
    const content = this.buildPRPContent(template, metadata, userPrompt, planModeOutput, businessContext)
    
    return {
      id: prpId,
      content,
      metadata
    }
  }
  
  /**
   * Build PRP content based on template structure
   */
  buildPRPContent(template, metadata, userPrompt, planModeOutput, businessContext) {
    let content = `# ${metadata.id.toUpperCase().replace(/_/g, ' ')}\n`
    content += `*Category: ${metadata.complexity} | Estimated Time: ${metadata.estimatedTime} | Created: ${metadata.created}*\n\n`
    
    content += `## 🎯 **Business Context**\n`
    content += `**Goal**: ${this.extractGoalFromPrompt(userPrompt)}\n`
    content += `**Retention Impact**: ${this.assessRetentionImpact(userPrompt, metadata.complexity)}\n`
    content += `**Competitive Advantage**: ${this.assessCompetitiveAdvantage(userPrompt, businessContext)}\n\n`
    
    if (metadata.complexity === 'complex') {
      content += `## 🏆 **Competitive Moat Strategy**\n`
      content += `**Data Velocity**: ${this.assessDataVelocity(userPrompt)}\n`
      content += `**Dutch Market DNA**: ${this.assessDutchMarketImpact(userPrompt)}\n`
      content += `**Learning Loops**: ${this.identifyLearningLoops(userPrompt)}\n\n`
    }
    
    content += `## ⚙️ **Technical Context**\n`
    content += `**Files**: ${this.identifyAffectedFiles(userPrompt)}\n`
    content += `**Dependencies**: ${this.identifyDependencies(userPrompt)}\n`
    content += `**Patterns**: ${this.identifyRequiredPatterns(userPrompt)}\n`
    content += `**Integration**: ${this.identifyIntegrationRequirements(userPrompt)}\n\n`
    
    content += `## 📁 **Implementation Context**\n`
    if (planModeOutput) {
      content += `**Plan Mode Output**:\n\`\`\`\n${planModeOutput}\n\`\`\`\n\n`
    }
    content += `**Approach**: ${this.suggestImplementationApproach(userPrompt, metadata.complexity)}\n`
    content += `**Gotchas**: ${this.identifyPotentialGotchas(userPrompt, metadata.complexity)}\n\n`
    
    if (['medium', 'complex'].includes(metadata.complexity)) {
      content += `## 📊 **Data Collection Integration**\n`
      content += `**Learning Opportunities**: ${this.identifyLearningOpportunities(userPrompt)}\n`
      content += `**Feedback Loops**: ${this.designFeedbackLoops(userPrompt)}\n\n`
    }
    
    content += `## ✅ **Validation Context**\n`
    content += `**Testing Requirements**: ${this.defineTestingRequirements(userPrompt, metadata.complexity)}\n`
    content += `**Success Criteria**: ${this.defineSuccessCriteria(userPrompt)}\n\n`
    
    content += `## 🔄 **Evolution Context**\n`
    if (metadata.complexity === 'complex') {
      content += `**4-Phase Roadmap**: ${this.create4PhaseEvolution(userPrompt)}\n`
    } else if (metadata.complexity === 'medium') {
      content += `**2-Phase Evolution**: ${this.create2PhaseEvolution(userPrompt)}\n`
    } else {
      content += `**Next Phase**: ${this.createBasicEvolution(userPrompt)}\n`
    }
    
    if (metadata.complexity === 'complex') {
      content += `\n## 🧠 **Learning Strategy**\n`
      content += `**Competitive Moat Building**: ${this.designMoatBuilding(userPrompt)}\n`
      content += `**Knowledge Accumulation**: ${this.designKnowledgeAccumulation(userPrompt)}\n`
    }
    
    return content
  }
  
  /**
   * Step 2: Create simplified task tracking (no external dependencies)
   */
  async createTaskTracking(prpData) {
    console.log('📋 Step 2: Creating Task Tracking...')
    
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const task = {
      id: taskId,
      title: `Implement: ${this.extractTitleFromPRP(prpData.content)}`,
      description: `Implementation task for ${prpData.id}`,
      complexity: prpData.complexity,
      specialists: prpData.metadata.requiredSpecialists,
      prpReference: prpData.id,
      estimatedTime: prpData.metadata.estimatedTime,
      status: 'ready_for_implementation',
      created: new Date().toISOString()
    }
    
    console.log(`   ✅ Created Task: ${task.id}`)
    
    return {
      taskId: task.id,
      specialists: prpData.metadata.requiredSpecialists,
      estimatedTime: prpData.metadata.estimatedTime
    }
  }
  
  /**
   * Step 3: Get agent pattern suggestions
   */
  async getAgentPatternSuggestions(prpData) {
    console.log('🎯 Step 3: Getting Agent Pattern Suggestions...')
    
    const suggestions = {
      requiredPatterns: [],
      recommendedApproaches: [],
      exampleCode: [],
      warnings: []
    }
    
    // Get patterns from specialist agents based on PRP content
    for (const specialist of prpData.metadata.requiredSpecialists) {
      const patterns = await this.getSpecialistPatterns(specialist, prpData.content)
      suggestions.requiredPatterns.push(...patterns)
    }
    
    // Get implementation recommendations
    suggestions.recommendedApproaches = await this.getImplementationRecommendations(prpData)
    
    // Get example code from similar implementations
    suggestions.exampleCode = await this.getExampleCode(prpData)
    
    // Get warnings from previous similar implementations
    suggestions.warnings = await this.getImplementationWarnings(prpData)
    
    console.log(`   ✅ Generated ${suggestions.requiredPatterns.length} pattern suggestions`)
    
    return suggestions
  }
  
  /**
   * Step 4: Create comprehensive implementation context
   */
  async createImplementationContext(steps) {
    console.log('🛠️ Step 4: Creating Implementation Context...')
    
    const context = {
      prp: steps.prpCreation,
      taskTracking: steps.taskTracking,
      patterns: steps.agentPatterns,
      readyForImplementation: true,
      contextSummary: this.generateContextSummary(steps),
      nextActions: this.generateNextActions(steps)
    }
    
    console.log(`   ✅ Implementation context ready`)
    
    return context
  }
  
  /**
   * Step 5: Record workflow for future feedback and learning
   */
  async recordWorkflowForFeedback(workflow) {
    console.log('📊 Step 5: Recording Workflow for Feedback...')
    
    const recording = {
      workflowId: workflow.id,
      prpId: workflow.steps.prpCreation.id,
      complexity: workflow.steps.prpCreation.complexity,
      estimatedTime: workflow.steps.prpCreation.metadata.estimatedTime,
      specialists: workflow.steps.prpCreation.metadata.requiredSpecialists,
      feedbackRequired: {
        implementationTime: 'Track actual vs estimated time',
        codeQuality: 'Rate final implementation quality',
        prpAccuracy: 'Rate how accurate PRP predictions were',
        patternEffectiveness: 'Rate how useful agent patterns were',
        overallSuccess: 'Rate overall workflow success'
      },
      learningOpportunities: this.identifyLearningOpportunities(workflow.userPrompt)
    }
    
    // Save recording for post-implementation feedback
    const recordingPath = path.join(this.resultsDir, `recording_${workflow.id}.json`)
    fs.writeFileSync(recordingPath, JSON.stringify(recording, null, 2))
    
    console.log(`   ✅ Workflow recorded for feedback`)
    
    return recording
  }
  
  /**
   * Helper methods for PRP content generation
   */
  
  extractGoalFromPrompt(prompt) {
    // Extract business goal from user prompt
    return `Implement: ${prompt.substring(0, 100)}...`
  }
  
  assessRetentionImpact(prompt, complexity) {
    if (complexity === 'complex') {
      return 'High - Core system improvements directly impact €149/month retention'
    } else if (complexity === 'medium') {
      return 'Medium - Feature improvements support overall platform value'
    } else {
      return 'Low - UI improvements support professional appearance'
    }
  }
  
  assessCompetitiveAdvantage(prompt, businessContext) {
    const prompt_lower = prompt.toLowerCase()
    
    if (prompt_lower.includes('emergency')) {
      return 'Emergency response excellence - build Uber-level emergency intelligence'
    } else if (prompt_lower.includes('voice') || prompt_lower.includes('ai')) {
      return 'AI conversation learning - build human-indistinguishable voice interface'
    } else if (prompt_lower.includes('dutch') || prompt_lower.includes('btw')) {
      return 'Dutch market specialization - embed local intelligence competitors cannot replicate'
    } else {
      return 'Platform improvement - enhance overall service quality and user experience'
    }
  }
  
  assessDataVelocity(prompt) {
    return 'Every user interaction with this feature will improve AI accuracy and competitive positioning'
  }
  
  assessDutchMarketImpact(prompt) {
    return 'Consider BTW tax implications, KvK integration requirements, and Amsterdam-specific routing'
  }
  
  identifyLearningLoops(prompt) {
    return 'Customer usage → Plumber feedback → AI improvement → Better customer experience'
  }
  
  identifyAffectedFiles(prompt) {
    // Smart file identification based on prompt content
    const files = []
    const prompt_lower = prompt.toLowerCase()
    
    if (prompt_lower.includes('dashboard')) files.push('/dashboard/pages/')
    if (prompt_lower.includes('calendar') || prompt_lower.includes('schedule')) files.push('/js/components/calendar.js')
    if (prompt_lower.includes('customer')) files.push('/js/pages/customers.js')
    if (prompt_lower.includes('invoice')) files.push('/js/pages/invoices.js')
    if (prompt_lower.includes('job')) files.push('/js/pages/jobs.js')
    if (prompt_lower.includes('payment')) files.push('/js/components/payment.js')
    
    return files.length > 0 ? files.join(', ') : 'To be determined based on implementation approach'
  }
  
  identifyDependencies(prompt) {
    const deps = []
    const prompt_lower = prompt.toLowerCase()
    
    if (prompt_lower.includes('schedule-x')) deps.push('@schedule-x/calendar')
    if (prompt_lower.includes('payment') || prompt_lower.includes('mollie')) deps.push('mollie-api-node')
    if (prompt_lower.includes('voice')) deps.push('speech recognition API')
    if (prompt_lower.includes('photo') || prompt_lower.includes('image')) deps.push('image processing library')
    
    return deps.length > 0 ? deps.join(', ') : 'Standard project dependencies'
  }
  
  identifyRequiredSpecialists(prompt) {
    const specialists = []
    const prompt_lower = prompt.toLowerCase()
    
    if (prompt_lower.includes('ui') || prompt_lower.includes('calendar') || prompt_lower.includes('schedule')) {
      specialists.push('ui-specialist-agent')
    }
    if (prompt_lower.includes('trpc') || prompt_lower.includes('api') || prompt_lower.includes('typescript')) {
      specialists.push('t3-specialist-agent')  
    }
    if (prompt_lower.includes('database') || prompt_lower.includes('supabase')) {
      specialists.push('database-specialist-agent')
    }
    if (prompt_lower.includes('auth') || prompt_lower.includes('user') || prompt_lower.includes('login')) {
      specialists.push('auth-specialist-agent')
    }
    if (prompt_lower.includes('payment') || prompt_lower.includes('mollie') || prompt_lower.includes('invoice')) {
      specialists.push('payment-specialist-agent')
    }
    if (prompt_lower.includes('test') || prompt_lower.includes('playwright')) {
      specialists.push('testing-specialist-agent')
    }
    
    return specialists.length > 0 ? specialists : ['general-purpose']
  }
  
  identifyRequiredPatterns(prompt) {
    const patterns = []
    const prompt_lower = prompt.toLowerCase()
    
    if (prompt_lower.includes('calendar') || prompt_lower.includes('schedule')) {
      patterns.push('Schedule-X integration patterns')
    }
    if (prompt_lower.includes('drag') || prompt_lower.includes('drop')) {
      patterns.push('Drag-drop functionality patterns')
    }
    if (prompt_lower.includes('job') || prompt_lower.includes('dashboard')) {
      patterns.push('Dashboard component patterns')
    }
    if (prompt_lower.includes('shared') || prompt_lower.includes('component')) {
      patterns.push('Shared component integration')
    }
    
    return patterns.length > 0 ? patterns.join(', ') : 'Use existing project patterns and shared components'
  }
  
  identifyIntegrationRequirements(prompt) {
    const integrations = []
    const prompt_lower = prompt.toLowerCase()
    
    if (prompt_lower.includes('calendar') || prompt_lower.includes('schedule')) {
      integrations.push('tRPC API integration', 'Job data binding', 'Event management')
    }
    if (prompt_lower.includes('payment')) {
      integrations.push('Mollie API', 'iDEAL payments', 'Webhook handling')
    }
    if (prompt_lower.includes('database')) {
      integrations.push('Supabase connection', 'Real-time subscriptions')
    }
    if (prompt_lower.includes('auth')) {
      integrations.push('Clerk authentication', 'Organization routing')
    }
    
    return integrations.length > 0 ? integrations.join(', ') : 'Standard project integrations'
  }
  
  estimateImplementationTime(complexity) {
    const times = {
      simple: '30 minutes - 1 hour',
      medium: '4-6 hours',
      complex: '2-3 days'
    }
    return times[complexity] || times.medium
  }
  
  // Additional helper methods...
  suggestImplementationApproach(prompt, complexity) {
    if (complexity === 'complex') {
      return 'Multi-phase implementation with learning loops and comprehensive testing'
    } else if (complexity === 'medium') {
      return 'Feature-complete implementation with integration testing'
    } else {
      return 'Direct implementation with visual/functional validation'
    }
  }
  
  identifyPotentialGotchas(prompt, complexity) {
    const gotchas = ['Mobile responsiveness', 'Shared component integration']
    
    if (prompt.toLowerCase().includes('dutch')) {
      gotchas.push('BTW tax calculations', 'Dutch timezone handling')
    }
    if (prompt.toLowerCase().includes('real-time')) {
      gotchas.push('WebSocket connection management', 'State synchronization')
    }
    if (complexity === 'complex') {
      gotchas.push('System integration complexity', 'Performance optimization needs')
    }
    
    return gotchas.join(', ')
  }
  
  defineTestingRequirements(prompt, complexity) {
    const tests = ['Playwright browser testing with winning patterns']
    
    if (complexity === 'medium') {
      tests.push('Integration testing', 'Mobile responsiveness verification')
    }
    if (complexity === 'complex') {
      tests.push('End-to-end workflow testing', 'Performance testing', 'Load testing')
    }
    
    return tests.join(', ')
  }
  
  defineSuccessCriteria(prompt) {
    return 'Feature works correctly on mobile and desktop, integrates with shared components, follows project patterns'
  }
  
  create4PhaseEvolution(prompt) {
    return `
Phase 1: Core implementation with basic functionality
Phase 2: Marketplace integration and advanced features  
Phase 3: AI-powered optimization and automation
Phase 4: Global scaling and AR/advanced capabilities`
  }
  
  create2PhaseEvolution(prompt) {
    return `
Phase 1: Current implementation with core functionality
Phase 2: Advanced features and marketplace integration`
  }
  
  createBasicEvolution(prompt) {
    return 'Future enhancement possibilities based on user feedback and usage patterns'
  }
  
  designMoatBuilding(prompt) {
    return 'Collect user interaction data, track performance metrics, build learning loops for competitive advantage'
  }
  
  designKnowledgeAccumulation(prompt) {
    return 'Document successful patterns, capture edge cases, build reusable intelligence for future implementations'
  }
  
  // Workflow support methods
  async loadBusinessContext() {
    try {
      const visionPath = path.join(__dirname, '..', 'PLUMBING_AGENT_VISION.md')
      const executionPath = path.join(__dirname, '..', 'SNOWBALL_EXECUTION_PLAN.md')
      
      return {
        vision: fs.existsSync(visionPath) ? fs.readFileSync(visionPath, 'utf8').substring(0, 1000) : '',
        execution: fs.existsSync(executionPath) ? fs.readFileSync(executionPath, 'utf8').substring(0, 1000) : ''
      }
    } catch (error) {
      return { vision: '', execution: '' }
    }
  }
  
  async getSpecialistPatterns(specialist, prpContent) {
    // Get patterns from specialist agent files
    const specialistPath = path.join(__dirname, '..', '.claude', 'agents', `${specialist}.md`)
    
    if (fs.existsSync(specialistPath)) {
      const content = fs.readFileSync(specialistPath, 'utf8')
      return [`Pattern from ${specialist}: Use established patterns and best practices`]
    }
    
    return [`${specialist}: Use domain-specific best practices`]
  }
  
  async getImplementationRecommendations(prpData) {
    return [
      'Follow existing project architecture patterns',
      'Use shared components from /js/components/',
      'Ensure mobile responsiveness',
      'Integrate with existing API structure'
    ]
  }
  
  async getExampleCode(prpData) {
    return [
      'Reference existing dashboard implementations',
      'Follow component structure patterns',
      'Use established API integration methods'
    ]
  }
  
  async getImplementationWarnings(prpData) {
    return [
      'Test thoroughly on mobile devices',
      'Verify shared component compatibility',
      'Check Railway deployment compatibility'
    ]
  }
  
  extractTitleFromPRP(prpContent) {
    const lines = prpContent.split('\n')
    const titleLine = lines.find(line => line.startsWith('# '))
    return titleLine ? titleLine.replace('# ', '') : 'Implementation Task'
  }
  
  generateContextSummary(steps) {
    return `PRP created with ${steps.prpCreation.complexity} complexity, ${steps.taskTracking.specialists.length} specialists assigned, ${steps.agentPatterns.requiredPatterns.length} patterns identified`
  }
  
  generateNextActions(steps) {
    return [
      'Review PRP for accuracy and completeness',
      'Begin implementation following suggested patterns',
      'Track actual time vs estimated time',
      'Provide feedback for PRP improvement'
    ]
  }
  
  identifyLearningOpportunities(prompt) {
    return [
      'User interaction patterns with this feature',
      'Performance metrics and optimization opportunities',
      'Feedback from real usage for future improvements'
    ]
  }
  
  designFeedbackLoops(prompt) {
    return [
      'Track implementation success vs PRP predictions',
      'Monitor user satisfaction with feature',
      'Collect plumber feedback on usefulness'
    ]
  }
  
  async recordFailure(workflow, error) {
    const failure = {
      workflowId: workflow.id,
      error: error.message,
      stack: error.stack,
      step: this.identifyFailedStep(workflow),
      timestamp: new Date().toISOString(),
      learnings: [
        'Analyze failure cause',
        'Improve error handling',
        'Update PRP templates based on failure'
      ]
    }
    
    const failurePath = path.join(this.resultsDir, `failure_${workflow.id}.json`)
    fs.writeFileSync(failurePath, JSON.stringify(failure, null, 2))
  }
  
  identifyFailedStep(workflow) {
    const completedSteps = Object.keys(workflow.steps)
    const allSteps = ['prpCreation', 'archonTasks', 'agentPatterns', 'implementationContext', 'workflowRecording']
    
    for (const step of allSteps) {
      if (!completedSteps.includes(step)) {
        return step
      }
    }
    
    return 'unknown'
  }
  
  async saveWorkflowResults(workflow) {
    const resultsPath = path.join(this.resultsDir, `workflow_${workflow.id}.json`)
    fs.writeFileSync(resultsPath, JSON.stringify(workflow, null, 2))
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 PRP Workflow Engine - Complete Automation System

Usage:
  node prp-workflow-engine.js [options] "user prompt"

Options:
  --plan-mode    Include plan mode output from previous step
  --test         Run workflow test with sample data
  --help, -h     Show this help message

Examples:
  node prp-workflow-engine.js "Add Schedule-X calendar to jobs page"
  node prp-workflow-engine.js --plan-mode "Add customer management system"
  node prp-workflow-engine.js --test
`)
    return
  }
  
  const engine = new PRPWorkflowEngine()
  
  if (args.includes('--test')) {
    console.log('🧪 Running PRP Workflow Test...')
    
    const testPrompt = "Add Schedule-X calendar integration to jobs page with drag-drop functionality"
    const testPlanMode = `
# Implementation Plan
1. Install Schedule-X dependencies
2. Create calendar component
3. Integrate with job data via tRPC
4. Add drag-drop functionality
5. Test mobile responsiveness
`
    
    try {
      const result = await engine.executeWorkflow(testPrompt, testPlanMode)
      console.log('✅ Test completed successfully!')
      console.log(`📊 Workflow ID: ${result.id}`)
      console.log(`⏱️ Total time: ${result.totalTime}ms`)
      console.log(`📋 PRP: ${result.steps.prpCreation.id}`)
      
    } catch (error) {
      console.error('❌ Test failed:', error.message)
    }
    
    return
  }
  
  const userPrompt = args.find(arg => !arg.startsWith('--'))
  if (!userPrompt) {
    console.error('❌ Please provide a user prompt')
    process.exit(1)
  }
  
  const planModeOutput = args.includes('--plan-mode') ? 'Plan mode output included' : null
  
  try {
    const result = await engine.executeWorkflow(userPrompt, planModeOutput)
    
    console.log('\n🎉 PRP Workflow Complete!')
    console.log(`📋 PRP Created: ${result.steps.prpCreation.id}`)
    console.log(`🧠 Archon Task: ${result.steps.archonTasks.taskId}`)
    console.log(`🎯 Patterns: ${result.steps.agentPatterns.requiredPatterns.length} suggestions`)
    console.log(`⏱️ Total Time: ${result.totalTime}ms`)
    console.log(`\n📁 Next Steps:`)
    result.steps.implementationContext.nextActions.forEach((action, i) => {
      console.log(`   ${i + 1}. ${action}`)
    })
    
  } catch (error) {
    console.error(`❌ Workflow failed: ${error.message}`)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = PRPWorkflowEngine