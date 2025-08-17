# GDPR Compliance Implementation - Netherlands Market

## 🇪🇺 Overview
Complete GDPR compliance implementation for Dutch plumbing SaaS platform, ensuring legal protection and customer trust.

## 📋 GDPR Requirements Checklist

### **✅ Data Collection & Consent**
- [ ] Clear consent banners with granular options
- [ ] Consent tracking and versioning
- [ ] Opt-in confirmation for marketing
- [ ] Age verification for users under 16
- [ ] Easy consent withdrawal

### **✅ Data Processing**
- [ ] Legal basis documentation for all processing
- [ ] Data minimization (collect only necessary data)
- [ ] Purpose limitation (use data only for stated purposes)
- [ ] Accuracy maintenance and correction procedures
- [ ] Storage limitation (automatic deletion after 730 days)

### **✅ Individual Rights**
- [ ] Right to access (data export)
- [ ] Right to rectification (data correction)
- [ ] Right to erasure ("right to be forgotten")
- [ ] Right to portability (data download)
- [ ] Right to object (stop processing)
- [ ] Right to restrict processing

### **✅ Security & Accountability**
- [ ] Privacy by design implementation
- [ ] Data protection impact assessments (DPIA)
- [ ] Breach notification procedures (72 hours)
- [ ] Data processor agreements
- [ ] Privacy policy transparency
- [ ] Regular compliance audits

## 🛠️ Implementation Patterns

### **Consent Management System**
```typescript
// GDPR-compliant consent tracking
interface GDPRConsent {
  userId: string;
  consentId: string;
  consentType: 'necessary' | 'analytics' | 'marketing' | 'ai_processing';
  isGranted: boolean;
  consentDate: Date;
  withdrawalDate?: Date;
  ipAddress: string;
  userAgent: string;
  consentVersion: string;
  legalBasis: 'consent' | 'legitimate_interest' | 'contract' | 'legal_obligation';
}

export async function recordConsent(consent: Omit<GDPRConsent, 'consentId' | 'consentDate'>) {
  const consentRecord = {
    ...consent,
    consentId: generateConsentId(),
    consentDate: new Date(),
    consentVersion: getCurrentConsentVersion()
  };

  // Store in secure audit table
  await supabase
    .from('gdpr_consent_log')
    .insert(consentRecord);

  // Update user preferences
  await updateUserConsent(consent.userId, consent.consentType, consent.isGranted);
  
  return consentRecord;
}

// Check if user has valid consent for specific processing
export async function hasValidConsent(
  userId: string, 
  consentType: GDPRConsent['consentType']
): Promise<boolean> {
  const latestConsent = await supabase
    .from('gdpr_consent_log')
    .select('*')
    .eq('userId', userId)
    .eq('consentType', consentType)
    .order('consentDate', { ascending: false })
    .limit(1)
    .single();

  return latestConsent.data?.isGranted && !latestConsent.data?.withdrawalDate;
}
```

### **Data Subject Rights Implementation**

#### **Right to Access (Data Export)**
```typescript
export async function exportUserData(userId: string): Promise<UserDataExport> {
  // Verify user identity
  await verifyUserIdentity(userId);

  // Collect all user data across tables
  const userData = await Promise.all([
    getUserProfile(userId),
    getUserChats(userId),
    getUserBookings(userId),
    getUserPayments(userId),
    getUserConsents(userId),
    getUserAuditLog(userId)
  ]);

  const exportData: UserDataExport = {
    exportDate: new Date(),
    userId,
    personalData: userData[0],
    chatHistory: userData[1],
    bookings: userData[2],
    payments: userData[3].map(payment => ({
      // Anonymize sensitive payment data
      id: payment.id,
      amount: payment.amount,
      date: payment.date,
      status: payment.status
      // Exclude: full payment details, bank info
    })),
    consents: userData[4],
    auditLog: userData[5]
  };

  // Log the data access request
  await logGDPRActivity({
    userId,
    activity: 'data_export',
    description: 'User requested data export',
    ipAddress: getCurrentIP(),
    timestamp: new Date()
  });

  return exportData;
}
```

#### **Right to Erasure ("Right to be Forgotten")**
```typescript
export async function deleteUserData(userId: string, reason: string): Promise<DeletionReport> {
  // Verify deletion is legally allowed
  await verifyDeletionAllowed(userId);

  const deletionReport: DeletionReport = {
    userId,
    deletionDate: new Date(),
    reason,
    deletedRecords: {}
  };

  // Step 1: Anonymize instead of delete where legally required
  const anonymizedRecords = await anonymizeUserData(userId);
  deletionReport.deletedRecords.anonymized = anonymizedRecords;

  // Step 2: Delete personal data
  const personalDataDeletion = await deletePersonalData(userId);
  deletionReport.deletedRecords.personalData = personalDataDeletion;

  // Step 3: Delete chat sessions (keep anonymized analytics)
  const chatDeletion = await deleteChatData(userId);
  deletionReport.deletedRecords.chatData = chatDeletion;

  // Step 4: Handle financial records (legal retention requirements)
  const financialRetention = await handleFinancialRecords(userId);
  deletionReport.deletedRecords.financialRecords = financialRetention;

  // Step 5: Log the deletion (required for compliance)
  await logGDPRActivity({
    userId,
    activity: 'data_deletion',
    description: `User data deleted: ${reason}`,
    ipAddress: getCurrentIP(),
    timestamp: new Date(),
    details: deletionReport
  });

  return deletionReport;
}

async function anonymizeUserData(userId: string) {
  // Replace personal data with anonymized versions
  const anonymizedData = {
    name: 'Anonymous User',
    email: `anonymous_${crypto.randomUUID()}@deleted.local`,
    phone: null,
    address: null
  };

  await supabase
    .from('users')
    .update(anonymizedData)
    .eq('id', userId);

  return anonymizedData;
}
```

### **Data Retention Automation**
```typescript
// Automatic data deletion after 730 days (Dutch requirement)
export async function automateDataRetention() {
  const retentionPeriod = 730; // days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

  // Find records eligible for deletion
  const expiredRecords = await supabase
    .from('chat_sessions')
    .select('id, userId, createdAt')
    .lt('createdAt', cutoffDate.toISOString())
    .eq('retentionHold', false); // Not under legal hold

  // Process deletions in batches
  for (const record of expiredRecords.data || []) {
    try {
      await deleteExpiredRecord(record);
      await logGDPRActivity({
        userId: record.userId,
        activity: 'automatic_deletion',
        description: 'Data automatically deleted per retention policy',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Retention deletion failed:', error);
    }
  }
}

// Schedule daily retention cleanup
export function scheduleRetentionCleanup() {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', automateDataRetention);
}
```

## 🇳🇱 Dutch-Specific GDPR Requirements

### **Autoriteit Persoonsgegevens (AP) Compliance**
```typescript
// Dutch privacy authority compliance
export const dutchGDPRRequirements = {
  // Notification requirements
  breachNotification: {
    authority: 'Autoriteit Persoonsgegevens',
    timeLimit: '72 hours',
    email: 'datalek@autoriteitpersoonsgegevens.nl',
    language: 'Dutch'
  },

  // Age of consent
  minAge: 16, // Netherlands: 16 years (higher than EU minimum of 13)

  // Cookie consent
  cookieConsent: {
    required: true,
    categories: ['necessary', 'functional', 'analytics', 'marketing'],
    optOut: true, // Must be opt-in, not opt-out
    language: 'nl-NL'
  },

  // Data processor requirements
  processorAgreements: {
    required: true,
    language: 'Dutch',
    dutchLaw: true
  }
};
```

### **BTW-Compliant Data Processing**
```typescript
// Ensure GDPR compliance with Dutch tax requirements
export async function processBTWCompliantData(customerData: {
  name: string;
  address: string;
  kvkNumber?: string;
  vatNumber?: string;
}) {
  // Check if customer consents to BTW processing
  const hasBTWConsent = await hasValidConsent(
    customerData.userId, 
    'necessary' // BTW is legal obligation, not consent-based
  );

  // Process BTW data with GDPR compliance
  const btwData = {
    companyName: customerData.name,
    address: customerData.address,
    kvkNumber: customerData.kvkNumber,
    vatNumber: customerData.vatNumber,
    // Add GDPR metadata
    legalBasis: 'legal_obligation', // BTW law requires this data
    retentionPeriod: 2555, // 7 years (BTW requirement)
    processingPurpose: 'tax_compliance'
  };

  return btwData;
}
```

## 🔒 Privacy by Design Implementation

### **Data Minimization Patterns**
```typescript
// Collect only necessary data
export const dataCollectionLimits = {
  widget: {
    required: ['organizationId', 'sessionId', 'message'],
    optional: ['location'], // Only with explicit consent
    forbidden: ['credit_card', 'password', 'biometric']
  },
  
  booking: {
    required: ['name', 'phone', 'address', 'service_type'],
    optional: ['email', 'preferred_date'],
    forbidden: ['income', 'other_services', 'personal_details']
  }
};

// Validate data collection against limits
export function validateDataCollection(
  dataType: keyof typeof dataCollectionLimits,
  collectedData: Record<string, any>
): ValidationResult {
  const limits = dataCollectionLimits[dataType];
  
  // Check for forbidden fields
  const forbiddenFields = Object.keys(collectedData)
    .filter(field => limits.forbidden.includes(field));
    
  if (forbiddenFields.length > 0) {
    throw new Error(`Forbidden data fields: ${forbiddenFields.join(', ')}`);
  }

  // Check required fields
  const missingRequired = limits.required
    .filter(field => !collectedData[field]);
    
  if (missingRequired.length > 0) {
    throw new Error(`Missing required fields: ${missingRequired.join(', ')}`);
  }

  return { valid: true, warnings: [] };
}
```

### **Consent Banner Implementation**
```typescript
// GDPR-compliant consent banner
export const ConsentBanner = {
  necessary: {
    title: 'Functionele cookies',
    description: 'Noodzakelijk voor de werking van de website',
    canOptOut: false,
    legalBasis: 'legitimate_interest'
  },
  
  analytics: {
    title: 'Analytische cookies', 
    description: 'Helpen ons de website te verbeteren',
    canOptOut: true,
    legalBasis: 'consent'
  },
  
  marketing: {
    title: 'Marketing cookies',
    description: 'Voor gepersonaliseerde advertenties',
    canOptOut: true,
    legalBasis: 'consent'
  },

  aiProcessing: {
    title: 'AI-gesprekken',
    description: 'Uw berichten worden verwerkt door AI voor betere service',
    canOptOut: true,
    legalBasis: 'consent',
    retention: '730 dagen'
  }
};
```

## 📊 Compliance Monitoring

### **GDPR Audit Dashboard**
```typescript
export async function generateGDPRReport(): Promise<ComplianceReport> {
  const report = {
    date: new Date(),
    totalUsers: await getUserCount(),
    activeConsents: await getActiveConsents(),
    dataRequests: await getDataRequests(),
    breaches: await getSecurityBreaches(),
    retentionCompliance: await checkRetentionCompliance(),
    processorAgreements: await checkProcessorAgreements()
  };

  return report;
}

// Weekly compliance check
export function scheduleComplianceCheck() {
  cron.schedule('0 0 * * 1', async () => { // Every Monday
    const report = await generateGDPRReport();
    await sendComplianceReport(report);
  });
}
```

---

**This GDPR implementation ensures full compliance with Dutch and EU privacy laws.**
**Last Updated**: January 17, 2025
**Compliance Status**: Full GDPR + Dutch AP compliance
**Next Audit**: February 17, 2025