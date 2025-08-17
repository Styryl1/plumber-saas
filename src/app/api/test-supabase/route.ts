import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Supabase connection...");
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SUPABASE_SERVICE_KEY exists:", !!process.env.SUPABASE_SERVICE_KEY);
    
    // Create client directly with env vars
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('id, name, "chatEnabled", "aiPersonality", domain')
      .eq('slug', 'demo-plumber-amsterdam')
      .single();

    console.log("Supabase response:", { data: organization, error });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      organization,
      message: "Supabase connection working"
    });
  } catch (err) {
    console.error("Error testing Supabase:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  }
}