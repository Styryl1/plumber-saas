import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationSlug = searchParams.get('organizationSlug');

    if (!organizationSlug) {
      return NextResponse.json({ error: 'organizationSlug is required' }, { status: 400 });
    }

    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .select('id, name, chatEnabled, aiPersonality, domain')
      .eq('slug', organizationSlug)
      .single();

    if (error || !organization || !organization.chatEnabled) {
      return NextResponse.json({ error: 'Chat not available for this organization' }, { status: 404 });
    }

    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      aiPersonality: organization.aiPersonality,
      chatEnabled: organization.chatEnabled,
    });
  } catch (error) {
    console.error('Widget config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}