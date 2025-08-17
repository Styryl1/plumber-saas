import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly with environment variables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const organizationSlug = url.searchParams.get('organizationSlug');
    
    if (!organizationSlug) {
      return NextResponse.json({ 
        error: "organizationSlug parameter is required" 
      }, { status: 400 });
    }

    console.log("Widget config request for:", organizationSlug);

    const { data: organization, error } = await supabaseAdmin
      .from('organizations')
      .select('id, name, "chatEnabled", "aiPersonality", domain')
      .eq('slug', organizationSlug)
      .single();

    console.log("Supabase query result:", { organization, error });

    if (error || !organization || !organization.chatEnabled) {
      return NextResponse.json({ 
        error: "Chat not available for this organization" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      organizationId: organization.id,
      organizationName: organization.name,
      aiPersonality: organization.aiPersonality,
      chatEnabled: organization.chatEnabled,
    });
  } catch (err) {
    console.error("Error getting widget config:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  }
}