import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly with environment variables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, browserFingerprint, language = "nl" } = body;
    
    if (!organizationId) {
      return NextResponse.json({ 
        error: "organizationId is required" 
      }, { status: 400 });
    }

    console.log("Starting session for organization:", organizationId);

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        sessionId,
        browserFingerprint,
        preferredLanguage: language,
        isActive: true,
        totalMessages: 0,
      })
      .select()
      .single();

    console.log("Session creation result:", { session, error });

    if (error) {
      throw new Error("Failed to create chat session");
    }

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      language: session.preferredLanguage,
    });
  } catch (err) {
    console.error("Error starting session:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Unknown error" 
    }, { status: 500 });
  }
}