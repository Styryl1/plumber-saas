# Clarifying Questions Template - Plumber SaaS PRP

## 🎯 Scope & Requirements Analysis

### Task Boundaries
- What are the exact components/pages that need to be created or modified?
- What are the specific acceptance criteria for this task?
- Are there any features that are explicitly out of scope?
- What is the priority level of this task (emergency/high/medium/low)?

### Success Criteria
- How will we measure the success of this implementation?
- What are the specific user experience goals?
- Are there performance benchmarks that need to be met?
- What testing requirements need to be satisfied?

### Dependencies & Constraints
- Are there any dependencies on other ongoing development work?
- Are there external API integrations required?
- What are the timeline constraints for this implementation?
- Are there any budget or resource limitations?

## 🔧 Technical Integration Questions

### tRPC & API Layer
- Which tRPC routers need to be created or modified?
- What are the specific API endpoints required?
- Are there any authentication/authorization requirements for these APIs?
- What error handling patterns should be implemented?

### Database & Data Layer
- Are there Prisma schema changes required?
- What new database tables or fields need to be created?
- Are there any data migration requirements?
- What are the Supabase RLS policy requirements?

### Real-time Requirements
- Are there any real-time features required (live updates, notifications)?
- What WebSocket connections or Supabase subscriptions are needed?
- How should real-time data be synchronized across multiple clients?
- Are there any offline/sync requirements?

### External Integrations
- Are there Google Maps API integrations needed?
- Is WhatsApp Business API integration required?
- Are there payment processing (Mollie/iDEAL) requirements?
- What other third-party services need to be integrated?

## 📱 Mobile & User Experience Questions

### Mobile Experience Requirements
- What are the specific mobile device requirements (phone/tablet)?
- Are there touch-specific interactions needed (swipe/pinch/drag)?
- What are the responsive design breakpoints required?
- Are there any mobile-specific performance requirements?

### Accessibility Requirements
- What WCAG 2.1 AA compliance requirements apply?
- Are there specific screen reader compatibility needs?
- What keyboard navigation patterns are required?
- Are there color contrast or visual accessibility requirements?

### User Journey Mapping
- What is the complete user flow for this feature?
- Where do users enter and exit this feature?
- Are there any error recovery or alternative paths needed?
- How does this integrate with existing user workflows?

## 🇳🇱 Dutch Market Specific Questions

### BTW (Tax) Requirements
- Are BTW calculations required for this feature?
- What BTW rates apply (21% standard, 9% reduced, 0% exempt)?
- Are there specific BTW reporting or invoice requirements?
- How should BTW be displayed to end users?

### Dutch Language & Terminology
- What specific Dutch plumbing terminology should be used?
- Are there regional variations (Amsterdam vs Rotterdam) to consider?
- What level of Dutch language support is required?
- Are there any cultural communication preferences to consider?

### Amsterdam Market Focus
- Are there Amsterdam-specific features or integrations needed?
- What Amsterdam postal code or geographic integrations are required?
- Are there local business directory or map integrations needed?
- How does this feature support Amsterdam market penetration goals?

### Payment & Business Compliance
- Is iDEAL payment integration required for this feature?
- Are there Dutch business regulation compliance requirements?
- What customer data privacy (GDPR) considerations apply?
- Are there professional licensing or certification requirements?

## 🏰 Competitive Strategy Questions

### Data Collection Opportunities
- What customer interaction data can we collect from this feature?
- How can this data improve our AI training and recommendations?
- What analytics or insights can be generated?
- How does this data create competitive advantages?

### Netherlands Market Advantage
- How does this feature strengthen our Netherlands-first positioning?
- What local market benefits does this provide over international competitors?
- How does this improve our understanding of Dutch customer behavior?
- What network effects can be created or enhanced?

### Learning Velocity Enhancement
- How will this feature accelerate our learning about plumber needs?
- What patterns can be extracted for reuse across other plumbers?
- How does this improve our AI's understanding of plumbing problems?
- What cross-customer insights can be generated?

### Platform Network Effects
- How does this feature increase value for existing customers?
- What incentives does this create for new customer acquisition?
- How does this increase switching costs for competitors?
- What data moats are strengthened or created?

## 🎨 UI/UX Design Questions

### Design System Integration
- Which shadcn/ui components should be used as the foundation?
- What custom components need to be created?
- How should this integrate with our existing green theme (#059669)?
- Are there any new design patterns needed?

### Schedule-X Calendar Integration
- Is calendar functionality required for this feature?
- What calendar views are needed (day/week/month)?
- Are there drag-and-drop scheduling requirements?
- How should calendar events be synchronized with other systems?

### Performance & Optimization
- What are the performance requirements for this feature?
- Are there large dataset handling requirements (1000+ jobs)?
- What loading states and optimization strategies are needed?
- How should this feature perform on low-end mobile devices?

## 🔒 Security & Multi-tenancy Questions

### Data Isolation Requirements
- How should data be isolated between different plumber organizations?
- What RLS policies need to be implemented or updated?
- Are there any cross-tenant data sharing requirements?
- How should permissions be managed for different user roles?

### Authentication & Authorization
- What user roles and permissions are required?
- Are there different access levels (plumber/customer/admin)?
- How should emergency access scenarios be handled?
- What session management requirements apply?

### Data Protection & Privacy
- What customer PII is collected or processed?
- How should data be encrypted at rest and in transit?
- What data retention and deletion policies apply?
- Are there any data export or portability requirements?

## 📊 Success Metrics & Validation

### Key Performance Indicators
- What metrics will indicate successful implementation?
- How will user adoption be measured?
- What performance benchmarks need to be met?
- How will business impact be quantified?

### Testing & Quality Assurance
- What testing strategies should be employed?
- Are there specific browser or device compatibility requirements?
- What accessibility testing is required?
- How should error scenarios be tested?

### Rollout & Deployment Strategy
- Should this be rolled out gradually or all at once?
- Are there any feature flags or A/B testing requirements?
- What monitoring and alerting should be implemented?
- What rollback procedures should be in place?

---

**Use these questions to ensure comprehensive understanding before implementation begins. Tailor the questions based on the specific task complexity and requirements.**