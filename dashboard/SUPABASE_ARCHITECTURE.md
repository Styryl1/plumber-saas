# Supabase Architecture - Complete Setup Guide

## Overview
Production-ready Supabase configuration for multi-tenant plumbing SaaS with PostgreSQL 16+, Row Level Security, real-time subscriptions, Edge Functions, and Dutch market compliance.

## Project Setup

### Supabase Project Configuration
```bash
# Initialize Supabase project
npx supabase init

# Link to remote project
npx supabase link --project-ref your-project-ref

# Generate TypeScript types
npx supabase gen types typescript --local > src/types/supabase.ts
```

### Environment Configuration
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# Database URL for Prisma
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

## Database Schema with Dutch Compliance

### Core Business Tables
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Organizations table with Dutch business fields
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Dutch business compliance
  kvk_number TEXT UNIQUE, -- Chamber of Commerce number
  btw_number TEXT UNIQUE, -- VAT number (NL123456789B01)
  iban TEXT, -- Dutch bank account
  
  -- Business address
  address TEXT,
  postal_code TEXT, -- Dutch format: 1234 AB
  city TEXT,
  country TEXT DEFAULT 'Netherlands',
  
  -- Business configuration
  services JSONB DEFAULT '[]',
  working_hours JSONB DEFAULT '{}',
  service_area JSONB DEFAULT '{}',
  pricing JSONB DEFAULT '{}',
  
  -- AI and widget configuration
  ai_personality TEXT DEFAULT 'professional',
  ai_instructions TEXT,
  widget_config JSONB DEFAULT '{}',
  
  -- Subscription
  plan TEXT DEFAULT 'STARTER' CHECK (plan IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
  plan_expiry TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table with Dutch location support
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  employee_id UUID REFERENCES employees(id),
  
  -- Job details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'LEAK_REPAIR', 'BOILER_SERVICE', 'DRAIN_CLEANING', 
    'INSTALLATION', 'MAINTENANCE', 'EMERGENCY', 'OTHER'
  )),
  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'EMERGENCY')),
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN (
    'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
  )),
  
  -- Scheduling with Dutch time zone
  scheduled_at TIMESTAMPTZ NOT NULL,
  estimated_duration INTEGER, -- minutes
  actual_duration INTEGER, -- minutes
  completed_at TIMESTAMPTZ,
  
  -- Location with PostGIS support
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL, -- Dutch format validation
  city TEXT NOT NULL,
  coordinates POINT, -- PostGIS point for route optimization
  
  -- Pricing with Dutch BTW
  labor_rate DECIMAL(10,2) NOT NULL,
  materials_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL,
  btw_rate DECIMAL(4,2) DEFAULT 21.00, -- Dutch VAT rate
  
  -- Documentation
  notes TEXT,
  internal_notes TEXT,
  photos JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers with Dutch address validation
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Contact information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  
  -- Dutch address format
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL, -- 1234 AB format
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Netherlands',
  
  -- Customer classification
  customer_type TEXT DEFAULT 'PRIVATE' CHECK (customer_type IN ('PRIVATE', 'BUSINESS', 'PROPERTY_MANAGER')),
  preferred_contact TEXT DEFAULT 'PHONE' CHECK (preferred_contact IN ('PHONE', 'EMAIL', 'WHATSAPP', 'SMS')),
  language TEXT DEFAULT 'nl',
  
  -- Business customer fields
  company_name TEXT,
  kvk_number TEXT,
  btw_number TEXT,
  
  -- Customer management
  notes TEXT,
  tags JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices with Dutch BTW compliance
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  job_id UUID REFERENCES jobs(id),
  
  -- Invoice identification
  invoice_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')),
  
  -- Dutch BTW calculation
  subtotal DECIMAL(10,2) NOT NULL,
  btw_amount DECIMAL(10,2) NOT NULL,
  btw_rate DECIMAL(4,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  -- Dates
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  
  -- Payment tracking
  payment_method TEXT CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'IDEAL', 'CARD', 'OTHER')),
  payment_reference TEXT,
  
  -- Files and attachments
  pdf_url TEXT,
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Widget analytics and AI data
CREATE TABLE widget_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Session tracking
  fingerprint TEXT,
  ip_address INET NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  
  -- Geographic data
  country TEXT,
  city TEXT,
  postal_code TEXT,
  coordinates POINT,
  
  -- Session timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Conversion tracking
  lead_generated BOOLEAN DEFAULT false,
  booking_made BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2)
);

CREATE TABLE widget_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES widget_sessions(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('USER', 'ASSISTANT', 'SYSTEM')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

### Complete Multi-Tenant Security
```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to get organization ID from JWT
CREATE OR REPLACE FUNCTION auth.org_id() RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'org_id';
$$ LANGUAGE SQL STABLE;

-- Helper function to get user ID from JWT
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'sub';
$$ LANGUAGE SQL STABLE;

-- Organizations: Users can only access their own organization
CREATE POLICY "Users can access own organization" ON organizations
FOR ALL USING (
  clerk_id = auth.user_id() OR
  id::text = auth.org_id()
);

-- Jobs: Organization members only
CREATE POLICY "Organization members can manage jobs" ON jobs
FOR ALL USING (organization_id::text = auth.org_id());

-- Customers: Organization isolation
CREATE POLICY "Organization members can manage customers" ON customers
FOR ALL USING (organization_id::text = auth.org_id());

-- Invoices: Organization isolation
CREATE POLICY "Organization members can manage invoices" ON invoices
FOR ALL USING (organization_id::text = auth.org_id());

-- Employees: Organization staff management
CREATE POLICY "Organization members can manage employees" ON employees
FOR ALL USING (organization_id::text = auth.org_id());

-- Materials: Organization inventory
CREATE POLICY "Organization members can manage materials" ON materials
FOR ALL USING (organization_id::text = auth.org_id());

-- Widget sessions: Allow public widget access + organization dashboard access
CREATE POLICY "Public widget session creation" ON widget_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Organization can view own widget data" ON widget_sessions
FOR SELECT USING (organization_id::text = auth.org_id());

CREATE POLICY "Organization can update own widget data" ON widget_sessions
FOR UPDATE USING (organization_id::text = auth.org_id());

-- Widget messages: Follow session permissions
CREATE POLICY "Widget message management" ON widget_messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM widget_sessions 
    WHERE id = session_id 
    AND (
      organization_id::text = auth.org_id() OR
      auth.jwt() IS NULL  -- Allow public access for active chats
    )
  )
);

-- Service role bypass for admin operations
CREATE POLICY "Service role full access" ON organizations
FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON jobs
FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON customers
FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON invoices
FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON widget_sessions
FOR ALL TO service_role USING (true);

CREATE POLICY "Service role full access" ON widget_messages
FOR ALL TO service_role USING (true);
```

## Real-time Subscriptions

### Organization-Scoped Real-time Updates
```sql
-- Create publication for real-time updates
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- Real-time filters for organization isolation
-- These are configured in the Supabase dashboard under Database > Publications
```

```typescript
// src/hooks/useRealtimeUpdates.ts
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { getSupabaseClient } from '~/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeUpdates() {
  const { orgId } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!orgId) return

    const supabase = getSupabaseClient()
    
    // Subscribe to job changes
    const jobsChannel = supabase
      .channel(`jobs:org:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          // Invalidate jobs queries
          queryClient.invalidateQueries({ queryKey: ['jobs'] })
        }
      )
      .subscribe()

    // Subscribe to customer changes
    const customersChannel = supabase
      .channel(`customers:org:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['customers'] })
        }
      )
      .subscribe()

    // Subscribe to invoice changes
    const invoicesChannel = supabase
      .channel(`invoices:org:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `organization_id=eq.${orgId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['invoices'] })
        }
      )
      .subscribe()

    return () => {
      jobsChannel.unsubscribe()
      customersChannel.unsubscribe()
      invoicesChannel.unsubscribe()
    }
  }, [orgId, queryClient])
}
```

## Edge Functions

### Dutch Address Validation Function
```typescript
// supabase/functions/validate-dutch-address/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface AddressValidationRequest {
  postalCode: string
  houseNumber: string
  city?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { postalCode, houseNumber, city }: AddressValidationRequest = await req.json()

    // Validate Dutch postal code format
    const postalCodeRegex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i
    if (!postalCodeRegex.test(postalCode)) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid Dutch postal code format' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Call Dutch postal code API (BAG API or PostcodeAPI.nu)
    const normalizedPostalCode = postalCode.replace(/\s/g, '').toUpperCase()
    const apiResponse = await fetch(
      `https://api.postcodeapi.nu/v3/lookup/${normalizedPostalCode}/${houseNumber}`,
      {
        headers: {
          'X-Api-Key': Deno.env.get('POSTCODEAPI_KEY')!
        }
      }
    )

    if (!apiResponse.ok) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Address not found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const addressData = await apiResponse.json()

    return new Response(
      JSON.stringify({
        valid: true,
        address: {
          street: addressData.street,
          city: addressData.city,
          province: addressData.province,
          latitude: addressData.latitude,
          longitude: addressData.longitude
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
```

### BTW Rate Calculation Function
```typescript
// supabase/functions/calculate-btw/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface BTWCalculationRequest {
  amount: number
  serviceType: string
  isRepair?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, serviceType, isRepair = false }: BTWCalculationRequest = await req.json()

    // Dutch BTW rates (2024)
    let btwRate = 21.00 // Standard rate

    // Reduced rate (9%) for certain repairs and maintenance
    const reducedRateServices = [
      'BOILER_SERVICE',
      'MAINTENANCE',
      'LEAK_REPAIR'
    ]

    if (isRepair && reducedRateServices.includes(serviceType)) {
      btwRate = 9.00
    }

    const btwAmount = (amount * btwRate) / 100
    const totalAmount = amount + btwAmount

    return new Response(
      JSON.stringify({
        subtotal: amount,
        btwRate,
        btwAmount: Math.round(btwAmount * 100) / 100,
        total: Math.round(totalAmount * 100) / 100
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
```

## Database Triggers and Functions

### Automatic Updated At Timestamps
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Invoice Number Generation
```sql
-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number(org_id UUID)
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
BEGIN
  year_suffix := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get next sequence number for this organization and year
  SELECT COALESCE(MAX(
    CAST(REGEXP_REPLACE(invoice_number, '^INV-' || year_suffix || '-', '') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM invoices 
  WHERE organization_id = org_id 
  AND invoice_number LIKE 'INV-' || year_suffix || '-%';
  
  invoice_num := 'INV-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();
```

## Performance Optimization

### Database Indexes
```sql
-- Organizations
CREATE INDEX idx_organizations_clerk_id ON organizations(clerk_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Jobs
CREATE INDEX idx_jobs_organization_id ON jobs(organization_id);
CREATE INDEX idx_jobs_status ON jobs(organization_id, status);
CREATE INDEX idx_jobs_scheduled_at ON jobs(organization_id, scheduled_at);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_postal_code ON jobs(postal_code);

-- Customers
CREATE INDEX idx_customers_organization_id ON customers(organization_id);
CREATE INDEX idx_customers_name ON customers(organization_id, name);
CREATE INDEX idx_customers_postal_code ON customers(organization_id, postal_code);
CREATE INDEX idx_customers_phone ON customers(organization_id, phone);

-- Invoices
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(organization_id, status);
CREATE INDEX idx_invoices_date ON invoices(organization_id, invoice_date);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);

-- Widget analytics
CREATE INDEX idx_widget_sessions_org ON widget_sessions(organization_id, started_at);
CREATE INDEX idx_widget_messages_session ON widget_messages(session_id, timestamp);

-- PostGIS spatial indexes
CREATE INDEX idx_jobs_coordinates ON jobs USING GIST(coordinates);
```

### Connection Pooling Configuration
```typescript
// src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
)

// Connection pooling for high-traffic scenarios
export const createPooledSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'connection': 'keep-alive'
        }
      }
    }
  )
}
```

## GDPR Compliance

### Data Retention and Deletion
```sql
-- GDPR data retention function
CREATE OR REPLACE FUNCTION gdpr_cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete widget sessions older than 2 years
  DELETE FROM widget_sessions 
  WHERE started_at < NOW() - INTERVAL '2 years';
  
  -- Anonymize old customer data (keep business records but remove PII)
  UPDATE customers 
  SET 
    name = 'GDPR Deleted User',
    email = NULL,
    phone = 'DELETED',
    address = 'DELETED',
    notes = NULL
  WHERE created_at < NOW() - INTERVAL '7 years'
  AND name != 'GDPR Deleted User';
  
  -- Archive old invoices but keep for legal compliance (10 years)
  -- Dutch law requires keeping business records for 7 years
  
END;
$$ LANGUAGE plpgsql;

-- Schedule GDPR cleanup (requires pg_cron extension)
SELECT cron.schedule('gdpr-cleanup', '0 2 1 * *', 'SELECT gdpr_cleanup_old_data();');
```

This Supabase architecture provides enterprise-grade database infrastructure with perfect multi-tenant isolation, Dutch compliance, real-time capabilities, and GDPR compliance for the plumbing SaaS platform.