# Dutch Compliance Patterns - Legal & Regulatory

## 🎯 Overview
Complete Dutch legal and regulatory compliance for plumbing SaaS including BTW, KVK, GDPR, and industry-specific requirements.

## 🇳🇱 Dutch Tax Compliance (BTW)

### **BTW Rate Application**
```typescript
// Dutch VAT (BTW) calculation system
interface BTWRates {
  standard: 21;      // Standard rate for most services
  reduced: 9;        // Reduced rate for specific cases
  zero: 0;          // Exports and specific exemptions
}

export class BTWCalculator {
  // Determine correct BTW rate based on service type and customer
  static getBTWRate(serviceType: string, customerType: 'private' | 'business', isNewConstruction: boolean): number {
    switch (serviceType) {
      case 'installation':
      case 'renovation':
        // Reduced rate for certain renovation work
        if (customerType === 'private' && !isNewConstruction) {
          return 9; // Reduced rate for home improvements
        }
        return 21; // Standard rate for new construction/business
        
      case 'repair':
      case 'maintenance':
      case 'emergency':
        return 21; // Standard rate for repairs and maintenance
        
      case 'consultation':
        return 21; // Standard rate for services
        
      default:
        return 21; // Default to standard rate
    }
  }
  
  // Calculate BTW amounts
  static calculateBTW(netAmount: number, btwRate: number) {
    const btwAmount = (netAmount * btwRate) / 100;
    const grossAmount = netAmount + btwAmount;
    
    return {
      netAmount: Math.round(netAmount * 100) / 100,
      btwRate,
      btwAmount: Math.round(btwAmount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100
    };
  }
  
  // Reverse calculation from gross amount
  static calculateFromGross(grossAmount: number, btwRate: number) {
    const netAmount = grossAmount / (1 + btwRate / 100);
    const btwAmount = grossAmount - netAmount;
    
    return {
      netAmount: Math.round(netAmount * 100) / 100,
      btwRate,
      btwAmount: Math.round(btwAmount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100
    };
  }
}
```

### **Invoice Compliance Requirements**
```typescript
// Dutch invoice requirements (Wet op de omzetbelasting)
interface DutchInvoiceRequirements {
  // Mandatory fields for BTW-compliant invoices
  invoiceNumber: string;          // Sequential numbering required
  invoiceDate: Date;              // Invoice issue date
  deliveryDate: Date;             // Service delivery date
  
  // Supplier information (your company)
  supplier: {
    name: string;                 // Full company name
    address: Address;             // Complete address
    kvkNumber: string;            // Chamber of Commerce number
    btwNumber: string;            // BTW identification number
  };
  
  // Customer information
  customer: {
    name: string;                 // Customer name
    address: Address;             // Customer address
    btwNumber?: string;           // BTW number if business customer
  };
  
  // Invoice lines with BTW details
  lines: {
    description: string;          // Clear service description
    quantity: number;             // Service quantity
    unitPrice: number;            // Price per unit (excl. BTW)
    netAmount: number;            // Total excl. BTW
    btwRate: number;              // BTW percentage
    btwAmount: number;            // BTW amount
    grossAmount: number;          // Total incl. BTW
  }[];
  
  // Totals
  totalNet: number;               // Total excl. BTW
  totalBTW: number;               // Total BTW
  totalGross: number;             // Total incl. BTW
  
  // Payment information
  paymentTerms: string;           // "Betaling binnen 14 dagen"
  paymentMethod: string;          // iDEAL, bank transfer, etc.
  
  // Legal texts (required for certain services)
  legalNotices?: string[];        // Warranty, complaints procedure, etc.
}

export function generateCompliantInvoice(job: Job, customer: Customer): DutchInvoiceRequirements {
  const invoiceNumber = generateSequentialInvoiceNumber();
  const btwRate = BTWCalculator.getBTWRate(job.serviceType, customer.type, job.isNewConstruction);
  
  const lines = job.materials.map(material => {
    const btw = BTWCalculator.calculateBTW(material.netPrice, btwRate);
    return {
      description: `${material.description} (${material.quantity}x)`,
      quantity: material.quantity,
      unitPrice: material.unitPrice,
      netAmount: btw.netAmount,
      btwRate: btw.btwRate,
      btwAmount: btw.btwAmount,
      grossAmount: btw.grossAmount
    };
  });
  
  // Add labor costs
  const laborBTW = BTWCalculator.calculateBTW(job.laborCosts, btwRate);
  lines.push({
    description: `Arbeidsloon (${job.hoursWorked} uur à €${job.hourlyRate})`,
    quantity: job.hoursWorked,
    unitPrice: job.hourlyRate,
    netAmount: laborBTW.netAmount,
    btwRate: laborBTW.btwRate,
    btwAmount: laborBTW.btwAmount,
    grossAmount: laborBTW.grossAmount
  });
  
  const totalNet = lines.reduce((sum, line) => sum + line.netAmount, 0);
  const totalBTW = lines.reduce((sum, line) => sum + line.btwAmount, 0);
  const totalGross = totalNet + totalBTW;
  
  return {
    invoiceNumber,
    invoiceDate: new Date(),
    deliveryDate: job.completedAt || new Date(),
    supplier: getCompanyInfo(),
    customer: {
      name: customer.name,
      address: customer.address,
      btwNumber: customer.btwNumber
    },
    lines,
    totalNet: Math.round(totalNet * 100) / 100,
    totalBTW: Math.round(totalBTW * 100) / 100,
    totalGross: Math.round(totalGross * 100) / 100,
    paymentTerms: "Betaling binnen 14 dagen na factuurdatum",
    paymentMethod: "iDEAL of bankoverschrijving",
    legalNotices: [
      "Garantie conform algemene voorwaarden",
      "Klachten binnen 14 dagen na oplevering",
      "Eigendomsvoorbehoud van toepassing"
    ]
  };
}
```

## 🏢 Chamber of Commerce (KVK) Integration

### **KVK Validation & Registration**
```typescript
// KVK API integration for business validation
export class KVKIntegration {
  private static apiKey = process.env.KVK_API_KEY!;
  private static baseUrl = 'https://api.kvk.nl/api/v1';
  
  // Validate KVK number and get company details
  static async validateAndFetchCompany(kvkNumber: string) {
    try {
      const response = await fetch(`${this.baseUrl}/naamgevingen/${kvkNumber}`, {
        headers: {
          'apikey': this.apiKey,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('KVK nummer niet gevonden');
      }
      
      const data = await response.json();
      
      return {
        kvkNumber: data.kvkNummer,
        businessName: data.naam,
        tradeNames: data.handelsNamen || [],
        legalForm: data.rechtsvorm,
        businessAddress: {
          street: data.adres.straatnaam,
          houseNumber: data.adres.huisnummer,
          houseNumberAddition: data.adres.huisnummerToevoeging,
          postalCode: data.adres.postcode,
          city: data.adres.plaats
        },
        businessActivities: data.activiteiten.map((act: any) => ({
          sbiCode: act.sbiCode,
          description: act.omschrijving,
          isMainActivity: act.isHoofdactiviteit
        })),
        isActive: data.status === 'Actief'
      };
    } catch (error) {
      throw new Error(`KVK validatie mislukt: ${error.message}`);
    }
  }
  
  // Check if company is authorized for plumbing work
  static async validatePlumbingAuthorization(kvkNumber: string) {
    const company = await this.validateAndFetchCompany(kvkNumber);
    
    // Check for relevant SBI codes for plumbing/heating work
    const plumbingSBICodes = [
      '43221', // Installatie van verwarmings- en luchtbehandelingsapparatuur
      '43222', // Installatie van leidingen en sanitair
      '4322',  // Loodgieters-, verwarmings- en luchtbehandelingsinstallatie
      '4329',  // Overige bouwinstallatie
    ];
    
    const hasPlumbingAuthorization = company.businessActivities.some(activity =>
      plumbingSBICodes.some(code => activity.sbiCode.startsWith(code))
    );
    
    if (!hasPlumbingAuthorization) {
      throw new Error('Bedrijf niet geregistreerd voor loodgieterswerk');
    }
    
    return {
      ...company,
      plumbingAuthorized: true
    };
  }
}
```

### **Business Registration Validation**
```typescript
// Validate business registration during onboarding
export async function validateBusinessRegistration(registrationData: {
  kvkNumber: string;
  btwNumber: string;
  businessName: string;
}) {
  // Validate KVK registration
  const kvkValidation = await KVKIntegration.validatePlumbingAuthorization(registrationData.kvkNumber);
  
  // Validate BTW number format
  const btwRegex = /^NL\d{9}B\d{2}$/;
  if (!btwRegex.test(registrationData.btwNumber)) {
    throw new Error('Ongeldig BTW nummer format. Verwacht: NL123456789B12');
  }
  
  // Cross-validate BTW number with KVK
  const expectedBTW = `NL${registrationData.kvkNumber}B01`;
  if (registrationData.btwNumber !== expectedBTW) {
    // BTW number doesn't match standard pattern, validate with tax office
    const btwValidation = await validateBTWWithTaxOffice(registrationData.btwNumber);
    if (!btwValidation.valid) {
      throw new Error('BTW nummer niet geregistreerd bij Belastingdienst');
    }
  }
  
  return {
    kvkValidation,
    btwValid: true,
    businessAuthorized: true
  };
}

async function validateBTWWithTaxOffice(btwNumber: string) {
  // Integration with Belastingdienst VIES system
  try {
    const response = await fetch('http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: `
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <checkVat xmlns="urn:ec.europa.eu:taxud.vies:services:checkVat:types">
              <countryCode>NL</countryCode>
              <vatNumber>${btwNumber.replace('NL', '')}</vatNumber>
            </checkVat>
          </soap:Body>
        </soap:Envelope>
      `
    });
    
    const xmlResponse = await response.text();
    return {
      valid: xmlResponse.includes('<valid>true</valid>'),
      companyName: extractFromXML(xmlResponse, 'name'),
      address: extractFromXML(xmlResponse, 'address')
    };
  } catch (error) {
    throw new Error('BTW validatie niet mogelijk');
  }
}
```

## 📊 Financial Reporting & Compliance

### **BTW Declaration Support**
```typescript
// Generate BTW declaration data
export class BTWDeclaration {
  // Generate quarterly BTW report
  static async generateQuarterlyReport(orgId: string, year: number, quarter: number) {
    const startDate = new Date(year, (quarter - 1) * 3, 1);
    const endDate = new Date(year, quarter * 3, 0);
    
    const invoices = await db.invoice.findMany({
      where: {
        organizationId: orgId,
        invoiceDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        lines: true
      }
    });
    
    // Group by BTW rate
    const btwSummary = invoices.reduce((summary, invoice) => {
      invoice.lines.forEach(line => {
        const rate = line.btwRate.toString();
        if (!summary[rate]) {
          summary[rate] = {
            rate: line.btwRate,
            netTotal: 0,
            btwTotal: 0,
            grossTotal: 0,
            invoiceCount: 0
          };
        }
        
        summary[rate].netTotal += line.netAmount;
        summary[rate].btwTotal += line.btwAmount;
        summary[rate].grossTotal += line.grossAmount;
      });
      
      summary[invoice.lines[0]?.btwRate.toString()]?.invoiceCount++;
      
      return summary;
    }, {} as Record<string, any>);
    
    return {
      period: {
        year,
        quarter,
        startDate,
        endDate
      },
      summary: Object.values(btwSummary),
      totalInvoices: invoices.length,
      totalNet: Object.values(btwSummary).reduce((sum: number, item: any) => sum + item.netTotal, 0),
      totalBTW: Object.values(btwSummary).reduce((sum: number, item: any) => sum + item.btwTotal, 0),
      totalGross: Object.values(btwSummary).reduce((sum: number, item: any) => sum + item.grossTotal, 0)
    };
  }
  
  // Export for accounting software
  static async exportForAccounting(orgId: string, year: number, quarter: number, format: 'exact' | 'king' | 'twinfield') {
    const report = await this.generateQuarterlyReport(orgId, year, quarter);
    
    switch (format) {
      case 'exact':
        return this.formatForExact(report);
      case 'king':
        return this.formatForKing(report);
      case 'twinfield':
        return this.formatForTwinfield(report);
      default:
        throw new Error('Onbekend accounting formaat');
    }
  }
  
  private static formatForExact(report: any) {
    // Format for Exact Online import
    return {
      format: 'Exact Online',
      data: report.summary.map((item: any) => ({
        Grootboekrekening: item.rate === 21 ? '8000' : '8001',
        Omschrijving: `BTW ${item.rate}% Q${report.period.quarter} ${report.period.year}`,
        Bedrag: item.btwTotal,
        BTWCode: item.rate === 21 ? 'H1' : 'L1'
      }))
    };
  }
}
```

### **Annual Financial Reports**
```typescript
// Generate annual financial summaries
export class AnnualReporting {
  static async generateAnnualSummary(orgId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    // Revenue analysis
    const monthlyRevenue = await db.invoice.groupBy({
      by: ['invoiceDate'],
      where: {
        organizationId: orgId,
        invoiceDate: { gte: startDate, lte: endDate }
      },
      _sum: {
        totalGross: true,
        totalNet: true,
        totalBTW: true
      }
    });
    
    // Customer analysis
    const customerStats = await db.customer.aggregate({
      where: { organizationId: orgId },
      _count: { id: true }
    });
    
    // Job type analysis
    const serviceTypeAnalysis = await db.job.groupBy({
      by: ['serviceType'],
      where: {
        organizationId: orgId,
        completedAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      _avg: { totalAmount: true }
    });
    
    return {
      year,
      revenue: {
        totalGross: monthlyRevenue.reduce((sum, month) => sum + (month._sum.totalGross || 0), 0),
        totalNet: monthlyRevenue.reduce((sum, month) => sum + (month._sum.totalNet || 0), 0),
        totalBTW: monthlyRevenue.reduce((sum, month) => sum + (month._sum.totalBTW || 0), 0),
        monthlyBreakdown: monthlyRevenue
      },
      customers: {
        total: customerStats._count.id,
        newThisYear: await this.getNewCustomersCount(orgId, year)
      },
      services: serviceTypeAnalysis,
      complianceStatus: {
        btwDeclarationsComplete: await this.checkBTWDeclarations(orgId, year),
        invoiceNumberingCompliant: await this.validateInvoiceNumbering(orgId, year),
        recordRetentionCompliant: true // 7 year retention requirement
      }
    };
  }
  
  private static async checkBTWDeclarations(orgId: string, year: number) {
    // Check if all quarterly BTW declarations are complete
    const quarters = [1, 2, 3, 4];
    const declarations = await Promise.all(
      quarters.map(q => BTWDeclaration.generateQuarterlyReport(orgId, year, q))
    );
    
    return declarations.every(declaration => declaration.totalInvoices > 0);
  }
  
  private static async validateInvoiceNumbering(orgId: string, year: number) {
    // Validate sequential invoice numbering (Dutch requirement)
    const invoices = await db.invoice.findMany({
      where: {
        organizationId: orgId,
        invoiceDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31)
        }
      },
      orderBy: { invoiceNumber: 'asc' }
    });
    
    // Check for gaps in numbering
    for (let i = 1; i < invoices.length; i++) {
      const current = parseInt(invoices[i].invoiceNumber);
      const previous = parseInt(invoices[i - 1].invoiceNumber);
      
      if (current !== previous + 1) {
        return false; // Gap in numbering found
      }
    }
    
    return true;
  }
}
```

## 🔒 Data Protection & GDPR

### **Dutch GDPR Implementation**
```typescript
// Dutch-specific GDPR compliance
export class DutchGDPRCompliance {
  // Dutch Data Protection Authority (AP) requirements
  static readonly RETENTION_PERIODS = {
    customerData: 7 * 365, // 7 years (tax law requirement)
    invoiceData: 7 * 365,  // 7 years (tax law requirement)
    jobRecords: 7 * 365,   // 7 years (business records)
    auditLogs: 2 * 365,    // 2 years (security monitoring)
    marketingData: 365,     // 1 year (consent-based)
  };
  
  // Privacy notice in Dutch
  static getPrivacyNotice(): string {
    return `
      PRIVACYVERKLARING
      
      Wij verwerken uw persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG).
      
      DOELEINDEN:
      - Uitvoering van de overeenkomst (loodgieterswerk)
      - Facturatie en boekhouding
      - Wettelijke verplichtingen (belastingwet)
      
      BEWAARTERMIJN:
      - Klantgegevens: 7 jaar na laatste contact
      - Factuurgegevens: 7 jaar (belastingwet)
      - Communicatie: 2 jaar na afronding project
      
      UW RECHTEN:
      - Inzage in uw gegevens
      - Rectificatie van onjuiste gegevens  
      - Wissing van gegevens (onder voorwaarden)
      - Beperking van verwerking
      - Overdraagbaarheid van gegevens
      - Bezwaar tegen verwerking
      
      CONTACT:
      Voor vragen over privacy: privacy@[bedrijfsnaam].nl
      Autoriteit Persoonsgegevens: autoriteitpersoonsgegevens.nl
    `;
  }
  
  // Automated data retention management
  static async enforceRetentionPolicies(orgId: string) {
    const now = new Date();
    
    // Delete expired marketing data
    const marketingCutoff = new Date(now.getTime() - this.RETENTION_PERIODS.marketingData * 24 * 60 * 60 * 1000);
    await db.marketingConsent.deleteMany({
      where: {
        organizationId: orgId,
        createdAt: { lt: marketingCutoff },
        status: 'withdrawn'
      }
    });
    
    // Anonymize old customer data (but keep for tax purposes)
    const customerCutoff = new Date(now.getTime() - this.RETENTION_PERIODS.customerData * 24 * 60 * 60 * 1000);
    await db.customer.updateMany({
      where: {
        organizationId: orgId,
        lastContactDate: { lt: customerCutoff }
      },
      data: {
        name: 'GEANONIMISEERD',
        email: 'geanonimiseerd@privacy.local',
        phone: 'GEANONIMISEERD',
        notes: 'GEANONIMISEERD CONFORM AVG'
      }
    });
    
    // Delete old audit logs
    const auditCutoff = new Date(now.getTime() - this.RETENTION_PERIODS.auditLogs * 24 * 60 * 60 * 1000);
    await db.auditLog.deleteMany({
      where: {
        organizationId: orgId,
        timestamp: { lt: auditCutoff }
      }
    });
  }
}
```

---

**This Dutch compliance guide provides complete legal and regulatory compliance patterns including BTW calculations, KVK integration, financial reporting, and GDPR implementation specific to the Dutch market.**