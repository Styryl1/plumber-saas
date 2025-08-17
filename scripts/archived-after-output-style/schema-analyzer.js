#!/usr/bin/env node

/**
 * Prisma Schema Analyzer - Multi-tenant Optimization
 * 
 * Analyzes current schema and provides specific optimization recommendations
 */

const fs = require('fs')
const path = require('path')

class SchemaAnalyzer {
  constructor() {
    this.schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma')
    this.schemaContent = ''
    this.models = []
    this.relationships = []
    this.indexes = []
  }

  analyze() {
    console.log('🔍 Analyzing Prisma schema for multi-tenant optimizations...')
    
    this.schemaContent = fs.readFileSync(this.schemaPath, 'utf8')
    this.extractModels()
    this.extractRelationships()
    this.extractIndexes()
    
    const analysis = {
      currentSchema: this.summarizeCurrentSchema(),
      optimizationOpportunities: this.identifyOptimizations(),
      securityGaps: this.identifySecurityGaps(),
      performanceImprovements: this.identifyPerformanceImprovements(),
      dutchComplianceGaps: this.identifyDutchComplianceGaps()
    }
    
    this.generateReport(analysis)
    return analysis
  }

  extractModels() {
    const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g
    let match
    
    while ((match = modelRegex.exec(this.schemaContent)) !== null) {
      const modelName = match[1]
      const modelContent = match[2]
      
      this.models.push({
        name: modelName,
        fields: this.extractFields(modelContent),
        indexes: this.extractModelIndexes(modelContent),
        hasOrganizationId: modelContent.includes('organizationId'),
        hasCascadeDelete: modelContent.includes('onDelete: Cascade')
      })
    }
  }

  extractFields(modelContent) {
    const fieldRegex = /(\w+)\s+([\w\[\]?@\(\)=\s\-\>"'._:]+)/g
    const fields = []
    let match
    
    while ((match = fieldRegex.exec(modelContent)) !== null) {
      const fieldName = match[1]
      const fieldDef = match[2].trim()
      
      // Skip relation fields and map annotations
      if (fieldName === 'organization' || fieldName === 'plumber' || 
          fieldName === 'customer' || fieldDef.includes('@@')) {
        continue
      }
      
      fields.push({
        name: fieldName,
        definition: fieldDef,
        isOptional: fieldDef.includes('?'),
        hasDefault: fieldDef.includes('@default'),
        isUnique: fieldDef.includes('@unique'),
        isArray: fieldDef.includes('[]')
      })
    }
    
    return fields
  }

  extractModelIndexes(modelContent) {
    const indexRegex = /@@index\([^)]+\)/g
    return [...modelContent.matchAll(indexRegex)].map(m => m[0])
  }

  extractRelationships() {
    const relationRegex = /(\w+)\s+(\w+)(?:\[\])?\s+@relation\([^)]+\)/g
    let match
    
    while ((match = relationRegex.exec(this.schemaContent)) !== null) {
      this.relationships.push({
        field: match[1],
        type: match[2],
        definition: match[0]
      })
    }
  }

  extractIndexes() {
    this.indexes = this.models.reduce((acc, model) => {
      return [...acc, ...model.indexes.map(idx => ({ model: model.name, index: idx }))]
    }, [])
  }

  summarizeCurrentSchema() {
    return {
      totalModels: this.models.length,
      modelsWithOrgId: this.models.filter(m => m.hasOrganizationId).length,
      totalIndexes: this.indexes.length,
      totalRelationships: this.relationships.length,
      models: this.models.map(m => ({
        name: m.name,
        fieldCount: m.fields.length,
        hasOrgId: m.hasOrganizationId,
        indexCount: m.indexes.length
      }))
    }
  }

  identifyOptimizations() {
    const opportunities = []

    // Check for missing organizationId in main tables
    const mainTables = ['Job', 'Customer', 'Invoice', 'ChatLog', 'Booking', 'Feedback']
    const missingOrgId = this.models
      .filter(m => mainTables.includes(m.name) && !m.hasOrganizationId)
      .map(m => m.name)
    
    if (missingOrgId.length > 0) {
      opportunities.push({
        type: 'CRITICAL',
        category: 'Multi-tenant Security',
        issue: `Missing organizationId in: ${missingOrgId.join(', ')}`,
        impact: 'Data isolation vulnerability',
        fix: 'Add organizationId field to all tenant-specific tables'
      })
    }

    // Check for ID field optimization
    const modelsWithCuid = this.models.filter(m => 
      m.fields.some(f => f.name === 'id' && f.definition.includes('cuid()'))
    )
    
    if (modelsWithCuid.length > 0) {
      opportunities.push({
        type: 'PERFORMANCE',
        category: 'ID Generation',
        issue: `Using cuid() instead of UUID: ${modelsWithCuid.map(m => m.name).join(', ')}`,
        impact: 'Slower ID generation, larger storage',
        fix: 'Switch to @default(dbgenerated("gen_random_uuid()")) @db.Uuid for better performance'
      })
    }

    // Check for missing composite indexes
    const missingCompositeIndexes = []
    
    this.models.forEach(model => {
      if (model.hasOrganizationId && model.name === 'Job') {
        const hasOrgScheduledIndex = model.indexes.some(idx => 
          idx.includes('organizationId') && idx.includes('scheduledAt')
        )
        if (!hasOrgScheduledIndex) {
          missingCompositeIndexes.push('jobs(organizationId, scheduledAt)')
        }
      }
    })

    if (missingCompositeIndexes.length > 0) {
      opportunities.push({
        type: 'PERFORMANCE',
        category: 'Database Indexes',
        issue: `Missing critical composite indexes: ${missingCompositeIndexes.join(', ')}`,
        impact: 'Slow multi-tenant queries',
        fix: 'Add composite indexes for organizationId + common query fields'
      })
    }

    // Check for BTW fields
    const jobModel = this.models.find(m => m.name === 'Job')
    const invoiceModel = this.models.find(m => m.name === 'Invoice')
    
    if (jobModel && !jobModel.fields.some(f => f.name === 'btwAmount')) {
      opportunities.push({
        type: 'BUSINESS',
        category: 'Dutch Compliance',
        issue: 'Missing BTW calculation fields in Job model',
        impact: 'Manual BTW calculations, compliance risk',
        fix: 'Add subtotalAmount, btwRate, btwAmount fields with database triggers'
      })
    }

    return opportunities
  }

  identifySecurityGaps() {
    const gaps = []

    // Check for proper cascade deletion
    const modelsWithoutCascade = this.models.filter(m => 
      m.hasOrganizationId && !m.hasCascadeDelete
    )

    if (modelsWithoutCascade.length > 0) {
      gaps.push({
        type: 'SECURITY',
        issue: `Missing cascade delete: ${modelsWithoutCascade.map(m => m.name).join(', ')}`,
        risk: 'Orphaned data when organization deleted',
        fix: 'Add onDelete: Cascade to organization relationships'
      })
    }

    // Check for sensitive data fields
    const sensitiveFields = []
    this.models.forEach(model => {
      model.fields.forEach(field => {
        if (['phone', 'email', 'notes'].includes(field.name) && 
            !field.definition.includes('encryption')) {
          sensitiveFields.push(`${model.name}.${field.name}`)
        }
      })
    })

    if (sensitiveFields.length > 0) {
      gaps.push({
        type: 'GDPR',
        issue: `Unencrypted sensitive fields: ${sensitiveFields.join(', ')}`,
        risk: 'GDPR compliance violation',
        fix: 'Implement field-level encryption for PII data'
      })
    }

    return gaps
  }

  identifyPerformanceImprovements() {
    const improvements = []

    // Check for missing pagination fields
    const modelsNeedingPagination = ['Job', 'Customer', 'Invoice', 'ChatLog']
    modelsNeedingPagination.forEach(modelName => {
      const model = this.models.find(m => m.name === modelName)
      if (model && !model.indexes.some(idx => idx.includes('createdAt'))) {
        improvements.push({
          type: 'QUERY_OPTIMIZATION',
          issue: `Missing createdAt index in ${modelName}`,
          impact: 'Slow pagination queries',
          fix: 'Add index on createdAt for efficient pagination'
        })
      }
    })

    // Check for search capabilities
    const jobModel = this.models.find(m => m.name === 'Job')
    if (jobModel && !jobModel.fields.some(f => f.name === 'searchVector')) {
      improvements.push({
        type: 'SEARCH_OPTIMIZATION',
        issue: 'Missing full-text search on jobs',
        impact: 'Limited search functionality',
        fix: 'Add tsvector field with GIN index for full-text search'
      })
    }

    return improvements
  }

  identifyDutchComplianceGaps() {
    const gaps = []

    // Check for KVK validation
    const orgModel = this.models.find(m => m.name === 'Organization')
    if (orgModel) {
      const kvkField = orgModel.fields.find(f => f.name === 'kvkNumber')
      if (!kvkField || !kvkField.definition.includes('validate')) {
        gaps.push({
          type: 'COMPLIANCE',
          issue: 'Missing KVK number validation',
          impact: 'Invalid business registrations',
          fix: 'Add database constraint for KVK number format validation'
        })
      }
    }

    // Check for postal code format
    const hasPostalCodeValidation = this.models.some(model =>
      model.fields.some(field => 
        field.name === 'postalCode' && field.definition.includes('regex')
      )
    )

    if (!hasPostalCodeValidation) {
      gaps.push({
        type: 'LOCALIZATION',
        issue: 'Missing Dutch postal code validation',
        impact: 'Invalid addresses, failed deliveries',
        fix: 'Add regex validation for Dutch postal code format (1234AB)'
      })
    }

    return gaps
  }

  generateReport(analysis) {
    console.log('\n📋 PRISMA SCHEMA ANALYSIS REPORT')
    console.log('='.repeat(50))
    
    console.log('\n📊 Current Schema Summary:')
    console.log(`   • Total Models: ${analysis.currentSchema.totalModels}`)
    console.log(`   • Multi-tenant Models: ${analysis.currentSchema.modelsWithOrgId}`)
    console.log(`   • Total Indexes: ${analysis.currentSchema.totalIndexes}`)
    console.log(`   • Total Relationships: ${analysis.currentSchema.totalRelationships}`)

    console.log('\n⚡ Optimization Opportunities:')
    analysis.optimizationOpportunities.forEach((opp, i) => {
      console.log(`   ${i + 1}. [${opp.type}] ${opp.category}`)
      console.log(`      Issue: ${opp.issue}`)
      console.log(`      Impact: ${opp.impact}`)
      console.log(`      Fix: ${opp.fix}\n`)
    })

    console.log('\n🔒 Security Gaps:')
    analysis.securityGaps.forEach((gap, i) => {
      console.log(`   ${i + 1}. [${gap.type}] ${gap.issue}`)
      console.log(`      Risk: ${gap.risk}`)
      console.log(`      Fix: ${gap.fix}\n`)
    })

    console.log('\n🚀 Performance Improvements:')
    analysis.performanceImprovements.forEach((imp, i) => {
      console.log(`   ${i + 1}. [${imp.type}] ${imp.issue}`)
      console.log(`      Impact: ${imp.impact}`)
      console.log(`      Fix: ${imp.fix}\n`)
    })

    console.log('\n🇳🇱 Dutch Compliance Gaps:')
    analysis.dutchComplianceGaps.forEach((gap, i) => {
      console.log(`   ${i + 1}. [${gap.type}] ${gap.issue}`)
      console.log(`      Impact: ${gap.impact}`)
      console.log(`      Fix: ${gap.fix}\n`)
    })

    console.log('✅ Schema analysis complete!')
  }
}

// Run analyzer
if (require.main === module) {
  const analyzer = new SchemaAnalyzer()
  analyzer.analyze()
}

module.exports = SchemaAnalyzer