# Semgrep Security Rules - Custom Implementation

## 🔍 Overview
Custom Semgrep rules specifically designed for the Plumber SaaS platform, covering API security, GDPR compliance, AI security, and Dutch market requirements.

## 📋 Rule Categories

### **🛡️ API Security Rules**
- **widget-api-key-required**: Ensures all widget API endpoints validate API keys
- **widget-domain-validation-missing**: Checks for domain whitelist validation
- **rate-limiting-missing**: Detects missing rate limiting implementation
- **cors-wildcard-dangerous**: Prevents dangerous CORS wildcard usage

### **🇪🇺 GDPR Compliance Rules**
- **gdpr-consent-required-user-data**: Ensures consent tracking for personal data
- **gdpr-data-retention-check**: Validates retention period specification
- **gdpr-personal-data-export**: Prevents personal data leaks in logs

### **🧠 AI Security Rules**
- **ai-prompt-injection-risk**: Detects unsanitized user input to AI models
- **ai-response-validation-missing**: Ensures AI responses are validated
- **ai-system-prompt-exposed**: Prevents system prompt exposure

### **💳 Payment Security Rules**
- **payment-amount-validation-missing**: Validates payment amounts
- **mollie-api-key-hardcoded**: Prevents hardcoded API keys
- **payment-webhook-verification-missing**: Ensures webhook signature verification

### **🔐 Session Security Rules**
- **session-id-weak-generation**: Enforces strong session ID generation
- **session-without-expiration**: Ensures sessions have expiration times

### **📝 Input Validation Rules**
- **zod-validation-missing**: Checks for Zod schema validation
- **sql-injection-risk**: Detects potential SQL injection vulnerabilities
- **xss-prevention-missing**: Ensures XSS sanitization

## 🚀 Running Security Scans

### **Basic Security Scan**
```bash
# Run all security rules
semgrep scan --config=p/security src/

# Run custom rules only
semgrep scan --config=.semgrep/custom-rules.yaml src/

# Run specific rule category
semgrep scan --config=.semgrep/custom-rules.yaml --include="*api*" src/
```

### **Comprehensive Security Check**
```bash
# Full security validation
semgrep scan --config=p/security --config=.semgrep/custom-rules.yaml src/ --json > security-report.json

# Analyze results
semgrep scan --config=.semgrep/custom-rules.yaml src/ --json | jq '.results[] | select(.extra.severity == "ERROR")'
```

### **CI/CD Integration**
```bash
# Pre-commit hook
#!/bin/bash
echo "Running security scan..."
semgrep scan --config=.semgrep/custom-rules.yaml src/ --error --quiet

if [ $? -ne 0 ]; then
  echo "❌ Security issues found! Fix before committing."
  exit 1
fi

echo "✅ Security scan passed!"
```

## 🎯 Rule Implementation Examples

### **API Security Validation**
```typescript
// ❌ FAILS: widget-api-key-required
export async function POST(request: NextRequest) {
  const body = await request.json();
  // Missing API key validation
  return processRequest(body);
}

// ✅ PASSES: Proper API key validation
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }
  
  const organization = await validateApiKey(apiKey);
  if (!organization) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }
  
  const body = await request.json();
  return processRequest(body, organization);
}
```

### **GDPR Compliance Validation**
```typescript
// ❌ FAILS: gdpr-consent-required-user-data
const userData = {
  name: userInput.name,
  email: userInput.email,
  phone: userInput.phone
  // Missing consent tracking
};

// ✅ PASSES: Proper consent tracking
const userData = {
  name: userInput.name,
  email: userInput.email,
  phone: userInput.phone,
  consentGiven: true,
  consentDate: new Date(),
  consentVersion: '1.0'
};
```

### **AI Security Validation**
```typescript
// ❌ FAILS: ai-prompt-injection-risk
const aiResponse = await openai.chat.completions.create({
  messages: [{ 
    role: 'user', 
    content: userMessage // Direct user input - injection risk
  }]
});

// ✅ PASSES: Sanitized input
const aiResponse = await openai.chat.completions.create({
  messages: [{ 
    role: 'user', 
    content: sanitizePrompt(userMessage) // Sanitized input
  }]
});
```

### **Payment Security Validation**
```typescript
// ❌ FAILS: payment-amount-validation-missing
const payment = await mollieClient.payments.create({
  amount: {
    currency: 'EUR',
    value: userInput.amount // Unvalidated amount
  },
  description: 'Service payment'
});

// ✅ PASSES: Validated amount
const payment = await mollieClient.payments.create({
  amount: {
    currency: 'EUR',
    value: validateAmount(userInput.amount) // Validated amount
  },
  description: 'Service payment'
});

function validateAmount(amount: number): string {
  if (amount <= 0 || amount > 10000) {
    throw new Error('Invalid payment amount');
  }
  return amount.toFixed(2);
}
```

## 🔧 Custom Rule Development

### **Creating New Rules**
```yaml
# Template for new security rule
- id: your-rule-name
  languages: [typescript, javascript]
  message: "Description of the security issue"
  severity: ERROR # or WARNING, INFO
  pattern: |
    # Pattern to match
  pattern-not: |
    # Pattern to exclude (safe code)
  paths:
    include:
      - "src/app/api/**"
    exclude:
      - "**/__tests__/**"
```

### **Testing Custom Rules**
```bash
# Test rule against specific file
semgrep scan --config=.semgrep/custom-rules.yaml --include="your-rule-name" src/specific-file.ts

# Validate rule syntax
semgrep scan --validate --config=.semgrep/custom-rules.yaml

# Test rule performance
semgrep scan --config=.semgrep/custom-rules.yaml --time src/
```

## 📊 Security Metrics & Reporting

### **Generate Security Report**
```bash
# Comprehensive security report
semgrep scan \
  --config=p/security \
  --config=.semgrep/custom-rules.yaml \
  --json \
  --output=security-report.json \
  src/

# Convert to readable format
semgrep scan \
  --config=.semgrep/custom-rules.yaml \
  --sarif \
  --output=security-report.sarif \
  src/
```

### **Security Dashboard Metrics**
```typescript
// Extract metrics from Semgrep results
interface SecurityMetrics {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  rulesCovered: string[];
  filesScanned: number;
  lastScanDate: Date;
}

export function parseSecurityReport(reportPath: string): SecurityMetrics {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  return {
    totalIssues: report.results.length,
    criticalIssues: report.results.filter(r => r.extra.severity === 'ERROR').length,
    highIssues: report.results.filter(r => r.extra.severity === 'WARNING').length,
    mediumIssues: report.results.filter(r => r.extra.severity === 'INFO').length,
    lowIssues: 0,
    rulesCovered: [...new Set(report.results.map(r => r.check_id))],
    filesScanned: [...new Set(report.results.map(r => r.path))].length,
    lastScanDate: new Date()
  };
}
```

## 🚨 Automated Security Monitoring

### **GitHub Actions Integration**
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/security
            .semgrep/custom-rules.yaml
          generateSarif: "1"
          
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: semgrep.sarif
        if: always()
```

### **Local Development Hooks**
```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "🔒 Running security checks..."

# Run critical security rules only (fast)
semgrep scan \
  --config=.semgrep/custom-rules.yaml \
  --severity=ERROR \
  --quiet \
  src/

if [ $? -ne 0 ]; then
  echo "❌ Critical security issues found!"
  echo "Run 'semgrep scan --config=.semgrep/custom-rules.yaml src/' for details"
  exit 1
fi

echo "✅ Security checks passed!"
```

## 🎯 Rule Maintenance

### **Regular Rule Updates**
- **Weekly**: Review and update rule patterns
- **Monthly**: Add new rules based on emerging threats
- **Quarterly**: Performance optimization and false positive reduction

### **Rule Performance Monitoring**
```bash
# Check rule performance
semgrep scan --config=.semgrep/custom-rules.yaml --time --metrics src/

# Identify slow rules
semgrep scan --config=.semgrep/custom-rules.yaml --debug src/ 2>&1 | grep "took"
```

---

**These Semgrep rules provide comprehensive security coverage for the Plumber SaaS platform.**
**Last Updated**: January 17, 2025
**Rules Version**: 1.0
**Next Review**: January 24, 2025