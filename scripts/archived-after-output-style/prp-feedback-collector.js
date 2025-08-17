#!/usr/bin/env node

/**
 * PRP Feedback Collector - Learn from implementation success/failure
 * 
 * Collects feedback from implementations to improve PRP accuracy and patterns
 */

const fs = require('fs')
const path = require('path')

class PRPFeedbackCollector {
  constructor() {
    this.feedbackDir = path.join(__dirname, '..', 'context', 'feedback')
    this.resultsDir = path.join(__dirname, '..', 'context', 'workflow-results')
    this.learningDir = path.join(__dirname, '..', 'context', 'learning')
    
    this.ensureDirectories()
  }
  
  ensureDirectories() {
    [this.feedbackDir, this.learningDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }
  
  /**
   * Collect feedback from completed implementation
   */
  async collectFeedback(workflowId, success, feedback = {}) {
    console.log(`📊 Collecting Feedback for Workflow: ${workflowId}`)
    
    try {
      // Load workflow results
      const workflow = await this.loadWorkflow(workflowId)
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`)
      }
      
      // Create feedback record
      const feedbackRecord = {
        workflowId,
        timestamp: new Date().toISOString(),
        success: success === 'true' || success === true,
        
        // Original workflow data
        original: {
          userPrompt: workflow.userPrompt,
          complexity: workflow.steps?.prpCreation?.complexity,
          estimatedTime: workflow.steps?.prpCreation?.metadata?.estimatedTime,
          specialists: workflow.steps?.prpCreation?.metadata?.requiredSpecialists
        },
        
        // Implementation feedback
        implementation: {
          actualTime: feedback.actualTime || 'Not provided',
          codeQuality: feedback.codeQuality || 'Not rated',
          prpAccuracy: feedback.prpAccuracy || 'Not rated',
          patternEffectiveness: feedback.patternEffectiveness || 'Not rated',
          overallSuccess: feedback.overallSuccess || success
        },
        
        // Learning insights
        insights: {
          whatWorked: feedback.whatWorked || [],
          whatFailed: feedback.whatFailed || [],
          improvements: feedback.improvements || [],
          surprises: feedback.surprises || []
        },
        
        // Analysis
        analysis: await this.analyzeFeedback(workflow, feedback, success)
      }
      
      // Save feedback
      await this.saveFeedback(feedbackRecord)
      
      // Update learning patterns
      await this.updateLearningPatterns(feedbackRecord)
      
      // Generate improvement suggestions
      const improvements = await this.generateImprovements(feedbackRecord)
      
      console.log('✅ Feedback collected and processed')
      
      return {
        feedbackId: feedbackRecord.workflowId,
        improvements,
        learningUpdates: feedbackRecord.analysis.learningUpdates
      }
      
    } catch (error) {
      console.error(`❌ Feedback collection failed: ${error.message}`)
      throw error
    }
  }
  
  /**
   * Load workflow results
   */
  async loadWorkflow(workflowId) {
    try {
      const workflowFile = path.join(this.resultsDir, `workflow_${workflowId}.json`)
      
      if (fs.existsSync(workflowFile)) {
        const content = fs.readFileSync(workflowFile, 'utf8')
        return JSON.parse(content)
      }
      
      // Try alternative naming
      const files = fs.readdirSync(this.resultsDir)
      const workflowFiles = files.filter(f => f.includes(workflowId))
      
      if (workflowFiles.length > 0) {
        const content = fs.readFileSync(path.join(this.resultsDir, workflowFiles[0]), 'utf8')
        return JSON.parse(content)
      }
      
      return null
    } catch (error) {
      console.warn(`Warning: Could not load workflow ${workflowId}`)
      return null
    }
  }
  
  /**
   * Analyze feedback for learning insights
   */
  async analyzeFeedback(workflow, feedback, success) {
    const analysis = {
      accuracyScore: 0,
      timeAccuracy: 'unknown',
      complexityAccuracy: 'unknown',
      patternSuccess: 'unknown',
      learningUpdates: []
    }
    
    // Analyze time estimation accuracy
    if (feedback.actualTime && workflow.steps?.prpCreation?.metadata?.estimatedTime) {
      analysis.timeAccuracy = this.analyzeTimeAccuracy(
        workflow.steps.prpCreation.metadata.estimatedTime,
        feedback.actualTime
      )
    }
    
    // Analyze complexity classification
    if (feedback.actualComplexity) {
      analysis.complexityAccuracy = feedback.actualComplexity === workflow.steps?.prpCreation?.complexity ? 'correct' : 'incorrect'
    }
    
    // Calculate overall accuracy score
    analysis.accuracyScore = this.calculateAccuracyScore(analysis, feedback, success)
    
    // Identify learning opportunities
    analysis.learningUpdates = this.identifyLearningUpdates(workflow, feedback, analysis)
    
    return analysis
  }
  
  /**
   * Analyze time estimation accuracy
   */
  analyzeTimeAccuracy(estimated, actual) {
    const estimatedMinutes = this.parseTimeToMinutes(estimated)
    const actualMinutes = this.parseTimeToMinutes(actual)
    
    if (!estimatedMinutes || !actualMinutes) {
      return 'unparseable'
    }
    
    const ratio = actualMinutes / estimatedMinutes
    
    if (ratio >= 0.8 && ratio <= 1.2) return 'accurate'
    if (ratio >= 0.6 && ratio <= 1.5) return 'acceptable'
    if (ratio < 0.6) return 'overestimated'
    return 'underestimated'
  }
  
  /**
   * Parse time string to minutes
   */
  parseTimeToMinutes(timeStr) {
    if (!timeStr) return null
    
    const str = timeStr.toLowerCase()
    
    // Parse patterns like "2-3 hours", "30 minutes", "1 hour"
    const hourMatch = str.match(/(\d+)(?:-(\d+))?\s*hours?/)
    const minuteMatch = str.match(/(\d+)\s*minutes?/)
    
    if (hourMatch) {
      const min = parseInt(hourMatch[1])
      const max = hourMatch[2] ? parseInt(hourMatch[2]) : min
      return (min + max) / 2 * 60 // Average in minutes
    }
    
    if (minuteMatch) {
      return parseInt(minuteMatch[1])
    }
    
    return null
  }
  
  /**
   * Calculate overall accuracy score
   */
  calculateAccuracyScore(analysis, feedback, success) {
    let score = 0
    let factors = 0
    
    // Success factor (40% weight)
    if (success === 'true' || success === true) {
      score += 40
    }
    factors += 40
    
    // Time accuracy (20% weight)
    if (analysis.timeAccuracy === 'accurate') score += 20
    else if (analysis.timeAccuracy === 'acceptable') score += 15
    else if (analysis.timeAccuracy !== 'unknown') score += 5
    factors += 20
    
    // Complexity accuracy (20% weight)
    if (analysis.complexityAccuracy === 'correct') score += 20
    else if (analysis.complexityAccuracy !== 'unknown') score += 5
    factors += 20
    
    // Pattern effectiveness (20% weight)
    if (feedback.patternEffectiveness) {
      const rating = this.parseRating(feedback.patternEffectiveness)
      score += rating * 4 // Scale 1-5 to 4-20
    }
    factors += 20
    
    return Math.round(score / factors * 100)
  }
  
  /**
   * Parse rating from feedback
   */
  parseRating(rating) {
    if (typeof rating === 'number') return Math.max(1, Math.min(5, rating))
    
    const str = rating.toString().toLowerCase()
    if (str.includes('excellent') || str.includes('5')) return 5
    if (str.includes('good') || str.includes('4')) return 4
    if (str.includes('average') || str.includes('3')) return 3
    if (str.includes('poor') || str.includes('2')) return 2
    if (str.includes('terrible') || str.includes('1')) return 1
    
    return 3 // Default to average
  }
  
  /**
   * Identify learning updates needed
   */
  identifyLearningUpdates(workflow, feedback, analysis) {
    const updates = []
    
    // Time estimation improvements
    if (analysis.timeAccuracy === 'underestimated') {
      updates.push({
        type: 'time_estimation',
        pattern: workflow.steps?.prpCreation?.complexity,
        adjustment: 'increase_time_estimates',
        reason: 'Actual time exceeded estimates significantly'
      })
    }
    
    if (analysis.timeAccuracy === 'overestimated') {
      updates.push({
        type: 'time_estimation',
        pattern: workflow.steps?.prpCreation?.complexity,
        adjustment: 'decrease_time_estimates',
        reason: 'Actual time was much less than estimated'
      })
    }
    
    // Complexity classification improvements
    if (analysis.complexityAccuracy === 'incorrect') {
      updates.push({
        type: 'complexity_classification',
        original: workflow.steps?.prpCreation?.complexity,
        suggested: feedback.actualComplexity,
        reason: 'Complexity was misclassified during PRP creation'
      })
    }
    
    // Pattern effectiveness improvements
    if (feedback.whatFailed && feedback.whatFailed.length > 0) {
      updates.push({
        type: 'pattern_improvement',
        failedPatterns: feedback.whatFailed,
        reason: 'Some patterns were ineffective during implementation'
      })
    }
    
    // Successful pattern reinforcement
    if (feedback.whatWorked && feedback.whatWorked.length > 0) {
      updates.push({
        type: 'pattern_reinforcement',
        successfulPatterns: feedback.whatWorked,
        reason: 'These patterns worked well and should be emphasized'
      })
    }
    
    return updates
  }
  
  /**
   * Save feedback to file
   */
  async saveFeedback(feedbackRecord) {
    const feedbackFile = path.join(this.feedbackDir, `feedback_${feedbackRecord.workflowId}.json`)
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbackRecord, null, 2))
    
    // Also append to master feedback log
    const masterLog = path.join(this.feedbackDir, 'master_feedback_log.jsonl')
    const logEntry = JSON.stringify(feedbackRecord) + '\n'
    fs.appendFileSync(masterLog, logEntry)
  }
  
  /**
   * Update learning patterns based on feedback
   */
  async updateLearningPatterns(feedbackRecord) {
    const learningFile = path.join(this.learningDir, 'pattern_learning.json')
    
    let learning = { patterns: {}, timeEstimates: {}, complexityClassification: {} }
    
    if (fs.existsSync(learningFile)) {
      try {
        learning = JSON.parse(fs.readFileSync(learningFile, 'utf8'))
      } catch (error) {
        console.warn('Warning: Could not parse existing learning file')
      }
    }
    
    // Update patterns based on feedback
    const complexity = feedbackRecord.original.complexity
    
    if (!learning.patterns[complexity]) {
      learning.patterns[complexity] = { successes: 0, failures: 0, feedbacks: [] }
    }
    
    if (feedbackRecord.success) {
      learning.patterns[complexity].successes++
    } else {
      learning.patterns[complexity].failures++
    }
    
    learning.patterns[complexity].feedbacks.push({
      workflowId: feedbackRecord.workflowId,
      accuracyScore: feedbackRecord.analysis.accuracyScore,
      timestamp: feedbackRecord.timestamp
    })
    
    // Update time estimates
    if (feedbackRecord.analysis.timeAccuracy !== 'unknown') {
      if (!learning.timeEstimates[complexity]) {
        learning.timeEstimates[complexity] = { accurate: 0, overestimated: 0, underestimated: 0 }
      }
      learning.timeEstimates[complexity][feedbackRecord.analysis.timeAccuracy]++
    }
    
    // Update complexity classification
    if (feedbackRecord.analysis.complexityAccuracy !== 'unknown') {
      if (!learning.complexityClassification[complexity]) {
        learning.complexityClassification[complexity] = { correct: 0, incorrect: 0 }
      }
      learning.complexityClassification[complexity][feedbackRecord.analysis.complexityAccuracy]++
    }
    
    // Save updated learning
    fs.writeFileSync(learningFile, JSON.stringify(learning, null, 2))
  }
  
  /**
   * Generate improvement suggestions
   */
  async generateImprovements(feedbackRecord) {
    const improvements = []
    
    // Generate specific improvements based on analysis
    for (const update of feedbackRecord.analysis.learningUpdates) {
      switch (update.type) {
        case 'time_estimation':
          improvements.push({
            type: 'template_update',
            target: `${update.pattern} PRP template`,
            action: update.adjustment,
            reason: update.reason
          })
          break
          
        case 'complexity_classification':
          improvements.push({
            type: 'keyword_mapping',
            action: `Update complexity detection for "${feedbackRecord.original.userPrompt.substring(0, 50)}..." type prompts`,
            reason: update.reason
          })
          break
          
        case 'pattern_improvement':
          improvements.push({
            type: 'pattern_update',
            action: 'Review and improve failing patterns',
            patterns: update.failedPatterns,
            reason: update.reason
          })
          break
      }
    }
    
    // Add overall recommendations
    if (feedbackRecord.analysis.accuracyScore < 70) {
      improvements.push({
        type: 'comprehensive_review',
        action: 'Review entire PRP workflow for this type of task',
        reason: `Low accuracy score: ${feedbackRecord.analysis.accuracyScore}%`
      })
    }
    
    return improvements
  }
  
  /**
   * Generate learning summary
   */
  async generateLearningSummary() {
    const masterLog = path.join(this.feedbackDir, 'master_feedback_log.jsonl')
    
    if (!fs.existsSync(masterLog)) {
      return 'No feedback data available'
    }
    
    const lines = fs.readFileSync(masterLog, 'utf8').trim().split('\n')
    const feedbacks = lines.map(line => JSON.parse(line))
    
    const summary = {
      totalFeedbacks: feedbacks.length,
      successRate: Math.round(feedbacks.filter(f => f.success).length / feedbacks.length * 100),
      averageAccuracy: Math.round(feedbacks.reduce((sum, f) => sum + f.analysis.accuracyScore, 0) / feedbacks.length),
      
      byComplexity: {},
      timeAccuracy: { accurate: 0, acceptable: 0, off: 0 },
      topPatterns: this.getTopPatterns(feedbacks),
      recentTrends: this.getRecentTrends(feedbacks.slice(-10))
    }
    
    // Analyze by complexity
    for (const feedback of feedbacks) {
      const complexity = feedback.original.complexity
      if (!summary.byComplexity[complexity]) {
        summary.byComplexity[complexity] = { count: 0, successes: 0, avgAccuracy: 0 }
      }
      
      summary.byComplexity[complexity].count++
      if (feedback.success) summary.byComplexity[complexity].successes++
      summary.byComplexity[complexity].avgAccuracy += feedback.analysis.accuracyScore
    }
    
    // Calculate averages
    for (const complexity of Object.keys(summary.byComplexity)) {
      const data = summary.byComplexity[complexity]
      data.successRate = Math.round(data.successes / data.count * 100)
      data.avgAccuracy = Math.round(data.avgAccuracy / data.count)
    }
    
    return summary
  }
  
  getTopPatterns(feedbacks) {
    // Analyze which patterns are most successful
    const patterns = {}
    
    for (const feedback of feedbacks) {
      if (feedback.insights.whatWorked) {
        for (const pattern of feedback.insights.whatWorked) {
          if (!patterns[pattern]) patterns[pattern] = 0
          patterns[pattern]++
        }
      }
    }
    
    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }))
  }
  
  getRecentTrends(recentFeedbacks) {
    if (recentFeedbacks.length === 0) return 'No recent data'
    
    const recentSuccess = recentFeedbacks.filter(f => f.success).length / recentFeedbacks.length * 100
    const recentAccuracy = recentFeedbacks.reduce((sum, f) => sum + f.analysis.accuracyScore, 0) / recentFeedbacks.length
    
    return {
      recentSuccessRate: Math.round(recentSuccess),
      recentAccuracy: Math.round(recentAccuracy),
      trend: 'improving' // Could be calculated based on historical comparison
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📊 PRP Feedback Collector - Learn from implementation results

Usage:
  node prp-feedback-collector.js [workflowId] [success] [options]

Arguments:
  workflowId    ID of the workflow to collect feedback for
  success       true/false - was the implementation successful?

Options:
  --actual-time "2 hours"     Actual implementation time
  --code-quality "4"          Code quality rating (1-5)
  --prp-accuracy "good"       How accurate was the PRP?
  --summary                   Generate learning summary
  --help, -h                  Show this help message

Examples:
  node prp-feedback-collector.js workflow_123 true --actual-time "3 hours"
  node prp-feedback-collector.js workflow_456 false --code-quality "2"
  node prp-feedback-collector.js --summary
`)
    return
  }
  
  const collector = new PRPFeedbackCollector()
  
  if (args.includes('--summary')) {
    console.log('📊 Generating Learning Summary...')
    const summary = await collector.generateLearningSummary()
    console.log(JSON.stringify(summary, null, 2))
    return
  }
  
  const workflowId = args[0]
  const success = args[1]
  
  if (!workflowId || !success) {
    console.error('❌ Please provide workflowId and success status')
    process.exit(1)
  }
  
  // Parse additional feedback
  const feedback = {}
  
  const actualTimeIndex = args.indexOf('--actual-time')
  if (actualTimeIndex !== -1 && args[actualTimeIndex + 1]) {
    feedback.actualTime = args[actualTimeIndex + 1]
  }
  
  const codeQualityIndex = args.indexOf('--code-quality')
  if (codeQualityIndex !== -1 && args[codeQualityIndex + 1]) {
    feedback.codeQuality = args[codeQualityIndex + 1]
  }
  
  const prpAccuracyIndex = args.indexOf('--prp-accuracy')
  if (prpAccuracyIndex !== -1 && args[prpAccuracyIndex + 1]) {
    feedback.prpAccuracy = args[prpAccuracyIndex + 1]
  }
  
  try {
    const result = await collector.collectFeedback(workflowId, success, feedback)
    
    console.log('✅ Feedback collected successfully!')
    console.log(`📋 Feedback ID: ${result.feedbackId}`)
    console.log(`🔧 Improvements identified: ${result.improvements.length}`)
    
    if (result.improvements.length > 0) {
      console.log('\n💡 Suggested Improvements:')
      result.improvements.forEach((improvement, i) => {
        console.log(`   ${i + 1}. ${improvement.action}`)
      })
    }
    
  } catch (error) {
    console.error(`❌ Feedback collection failed: ${error.message}`)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = PRPFeedbackCollector