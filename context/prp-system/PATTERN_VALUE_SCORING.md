# Pattern Value Scoring System

> **Purpose**: Automated pattern evaluation for optimization and pruning
> **Updated**: Every implementation, reviewed weekly

## 📊 Scoring Algorithm

### Pattern Value Score = (Usage × Success × Recency × Impact)

```yaml
Usage_Score: 
  - 0 uses (30 days): 0 points
  - 1-2 uses: 1 point
  - 3-5 uses: 2 points
  - 6-10 uses: 3 points
  - 11+ uses: 4 points

Success_Rate_Score:
  - <50% success: 0 points
  - 50-69% success: 1 point
  - 70-84% success: 2 points
  - 85-94% success: 3 points
  - 95%+ success: 4 points

Recency_Score:
  - >180 days: 0 points
  - 91-180 days: 1 point
  - 31-90 days: 2 points
  - 8-30 days: 3 points
  - <7 days: 4 points

Impact_Score:
  - Bugfix/minor: 1 point
  - Feature enhancement: 2 points
  - New feature: 3 points
  - Architecture/competitive advantage: 4 points
```

## 🎯 Scoring Thresholds

```yaml
Current_Patterns_Minimum: 8 points (keep in active)
Reference_Migration: 4-7 points (stable but not heavily used)
Archive_Candidate: 0-3 points (consider archiving)
Delete_Candidate: 0 points + >365 days unused
```

## 📈 Pattern Lifecycle Management

### Weekly Automated Process:
1. **Calculate scores** for all patterns
2. **Identify migration candidates** based on thresholds  
3. **Flag consolidation opportunities** (similar patterns <6 points)
4. **Generate optimization recommendations**
5. **Update metadata** in pattern files

### Monthly Review Process:
1. **Review archive candidates** with team
2. **Consolidate similar patterns** into generalized versions
3. **Update success rates** based on recent implementations
4. **Identify pattern gaps** in coverage

## 🔄 Pattern Consolidation Strategy

### Consolidation Triggers:
- **Similar Patterns**: 2+ patterns with >70% code similarity, both <6 points
- **Superseded Patterns**: New pattern with >90% success rate vs old <70%
- **Over-Specific Patterns**: Pattern used only once, can be generalized

### Consolidation Process:
1. **Identify consolidation candidates** through similarity analysis
2. **Create generalized pattern** combining best aspects
3. **Test new consolidated pattern** with existing use cases
4. **Archive old patterns** with reference to new consolidated version
5. **Update documentation** with migration guide

## 📊 Success Metrics

### Pattern Library Health:
- **Average Pattern Score**: Target >6.0 across all active patterns
- **Usage Distribution**: 80/20 rule (20% patterns handle 80% use cases)
- **Consolidation Rate**: Reduce pattern count by 5-10% monthly while maintaining coverage
- **Success Rate Improvement**: +2-5% monthly improvement in average success rates

### Competitive Advantage Tracking:
- **Development Velocity**: Time to implement features (target: -20% monthly)
- **Pattern Reuse**: Percentage of new features using existing patterns (target: >60%)
- **Knowledge Retention**: Senior knowledge captured in patterns (target: >80%)
- **Onboarding Speed**: New developer productivity with patterns (target: -50% ramp time)

## 🤖 Automated Pattern Analysis

### Daily Automated Tasks:
- Update usage counters when patterns are referenced
- Calculate success rates from feature implementation outcomes
- Flag patterns approaching line limits for consolidation
- Generate daily pattern health reports

### Weekly Automated Tasks:
- Recalculate all pattern value scores
- Identify migration and consolidation candidates
- Generate pattern optimization recommendations
- Update pattern metadata files

### Monthly Automated Tasks:
- Generate comprehensive pattern library health report
- Analyze competitive advantage metrics
- Recommend new pattern areas based on feature gaps
- Archive patterns that meet deletion criteria

---

**Next Update**: Weekly automated analysis
**Pattern Health Score**: [To be calculated]
**Optimization Opportunities**: [To be identified]