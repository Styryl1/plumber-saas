import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { ModelManager, type QueryContext } from '~/lib/ai/model-manager';
import { GPT5Client } from '~/lib/ai/gpt5-client';
import { ClaudeClient } from '~/lib/ai/claude-client';

// Create Supabase client directly with environment variables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize AI clients for dual-model system
const gpt5Client = new GPT5Client();
const claudeClient = new ClaudeClient();

/**
 * Intelligent AI response using dual-model routing (GPT-5 + Claude Opus 4.1)
 */
async function generateIntelligentAIResponse(
  queryContext: QueryContext,
  language: "nl" | "en"
) {
  // Select optimal model based on context
  const selectedModel = ModelManager.selectModel(queryContext);
  
  console.log(`[AI] Selected model: ${selectedModel} for query type`);
  
  if (selectedModel === 'gpt-5') {
    // Use GPT-5 for customer-facing chat (Dutch expertise, emergency handling)
    const gpt5Response = await gpt5Client.generateStreamingResponse(
      queryContext.userMessage,
      queryContext.conversationHistory,
      language
    );
    
    // Collect streaming response
    let fullResponse = '';
    let finalData = null;
    
    for await (const chunk of gpt5Response) {
      fullResponse += chunk.chunk;
      if (chunk.isComplete && chunk.data) {
        finalData = chunk.data;
      }
    }
    
    return {
      text: finalData?.text || fullResponse,
      urgency: finalData?.urgency || queryContext.urgency,
      categories: finalData?.categories || [],
      estimatedCost: finalData?.estimatedCost?.min || 150,
      customerPhone: finalData?.extractedInfo?.customerPhone,
      customerName: finalData?.extractedInfo?.customerName,
      location: finalData?.extractedInfo?.address,
      shouldShowBookingForm: finalData?.shouldShowBookingForm || false
    };
    
  } else {
    // Use Claude Opus 4.1 for complex analysis and planning
    const claudeAnalysis = await claudeClient.performDetailedAnalysis({
      conversationHistory: queryContext.conversationHistory,
      customerData: {
        name: queryContext.sessionData?.customerInfo?.name,
        phone: queryContext.sessionData?.customerInfo?.phone,
        problemType: queryContext.sessionData?.problemType,
        urgency: queryContext.urgency
      },
      requestType: queryContext.needsPlanning ? 'planning' : 'technical_assessment'
    });
    
    return {
      text: claudeAnalysis.summary,
      urgency: claudeAnalysis.scheduling.priority,
      categories: [claudeAnalysis.technicalAssessment.problemComplexity],
      estimatedCost: claudeAnalysis.costBreakdown.total,
      customerPhone: undefined,
      customerName: undefined,
      location: undefined,
      shouldShowBookingForm: claudeAnalysis.scheduling.priority === 'emergency'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, organizationId, userMessage, language = "nl" } = body;
    
    if (!sessionId || !organizationId || !userMessage) {
      return NextResponse.json({ 
        error: "sessionId, organizationId, and userMessage are required" 
      }, { status: 400 });
    }

    console.log("[AI] Processing message for session:", sessionId);

    // Get session and conversation history
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('sessionId', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ 
        error: "Session not found" 
      }, { status: 404 });
    }

    // Get conversation history for context
    const { data: chatHistory, error: historyError } = await supabaseAdmin
      .from('chat_logs')
      .select('userMessage, aiResponse, urgency')
      .eq('sessionId', sessionId)
      .order('messageNumber', { ascending: true });

    if (historyError) {
      console.warn("[AI] Could not fetch chat history:", historyError);
    }

    const messageNumber = session.totalMessages + 1;

    // Build conversation history for AI
    const conversationHistory = (chatHistory || []).flatMap(entry => [
      { role: 'user' as const, content: entry.userMessage },
      { role: 'assistant' as const, content: entry.aiResponse }
    ]);

    // Generate AI response using OpenAI directly
    console.log(`[AI] Generating response for: ${userMessage.substring(0, 50)}...`);
    
    // Use intelligent model routing (GPT-5 vs Claude Opus 4.1)
    const queryContext = {
      userMessage,
      messageCount: session.totalMessages + 1,
      conversationHistory,
      urgency: detectUrgency(userMessage) as 'low' | 'normal' | 'high' | 'emergency',
      language,
      hasImages: false,
      needsPlanning: userMessage.toLowerCase().includes('planning') || userMessage.toLowerCase().includes('wanneer'),
      needsExtendedReasoning: userMessage.length > 100 || userMessage.includes('waarom') || userMessage.includes('hoe'),
      customerPhase: session.totalMessages === 0 ? 'initial' as const : 'problem_identified' as const,
      sessionData: {
        problemType: session.currentIssues?.[0],
        customerInfo: {
          name: session.customerName,
          phone: session.customerPhone
        }
      }
    };

    // Generate AI response with dual-model intelligence
    let aiResponse;
    try {
      aiResponse = await generateIntelligentAIResponse(
        queryContext,
        language
      );
    } catch (aiError) {
      console.error("[AI] Dual-Model Error:", aiError);
      // Fallback response if both AI models fail
      aiResponse = {
        text: language === "nl" 
          ? "Excuses, ik ondervind momenteel technische problemen. Voor urgente zaken belt u direct: +31 20 123 4567"
          : "Sorry, I'm experiencing technical difficulties. For urgent matters please call directly: +31 20 123 4567",
        urgency: queryContext.urgency,
        categories: detectCategories(userMessage),
        estimatedCost: calculateCost(detectCategories(userMessage), queryContext.urgency),
        customerPhone: extractPhone(userMessage),
        customerName: extractName(userMessage),
        location: extractLocation(userMessage),
        shouldShowBookingForm: queryContext.urgency === 'emergency'
      };
    }

    // Log the chat interaction
    const { error: chatLogError } = await supabaseAdmin
      .from('chat_logs')
      .insert({
        organizationId,
        sessionId,
        userMessage,
        aiResponse: aiResponse.text,
        messageNumber,
        language,
        urgency: aiResponse.urgency,
        category: aiResponse.categories,
        estimatedCost: aiResponse.estimatedCost,
        customerPhone: aiResponse.customerPhone,
        customerName: aiResponse.customerName,
        location: aiResponse.location
      });

    if (chatLogError) {
      console.error("[AI] Failed to save chat log:", chatLogError);
    }

    // Update session with extracted information
    const { error: updateError } = await supabaseAdmin
      .from('chat_sessions')
      .update({
        totalMessages: messageNumber,
        lastActivity: new Date().toISOString(),
        customerName: aiResponse.customerName || session.customerName,
        customerPhone: aiResponse.customerPhone || session.customerPhone,
        location: aiResponse.location || session.location,
        currentIssues: aiResponse.categories.length > 0 ? aiResponse.categories : session.currentIssues,
      })
      .eq('sessionId', sessionId);

    if (updateError) {
      console.error("[AI] Failed to update session:", updateError);
    }

    return NextResponse.json({
      success: true,
      response: aiResponse.text,
      urgency: aiResponse.urgency,
      categories: aiResponse.categories,
      estimatedCost: aiResponse.estimatedCost,
      shouldShowBookingForm: aiResponse.shouldShowBookingForm,
      messageNumber,
    });

  } catch (err) {
    console.error("[AI] Error processing message:", err);
    
    // NO HARDCODED FALLBACK - return real error with contact info
    const errorMessage = err instanceof Error ? err.message : "AI service temporarily unavailable";
    const contactInfo = language === "nl" 
      ? "Bel direct voor spoedeisende hulp: Demo Loodgieter Amsterdam"
      : "Call directly for emergency help: Demo Plumber Amsterdam";
    
    return NextResponse.json({ 
      error: `${errorMessage}. ${contactInfo}`,
      fallbackContact: true
    }, { status: 500 });
  }
}

/**
 * Generate AI response using OpenAI GPT-4o
 */
async function generateOpenAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  language: "nl" | "en"
) {
  try {
    const systemPrompt = language === "nl"
      ? `Je bent de AI-assistent van Demo Plumbing Amsterdam, een ervaren loodgieter met 20+ jaar expertise in de Nederlandse markt.

BEDRIJFSPROFIEL & SPECIALISATIES:
- Lekkage reparatie & detectie (thermografie, druktesten)
- Afvoer ontstopping (mechanisch + hogedruk spoeling)
- Ketel onderhoud (HR107, Nefit, Remeha, Intergas)
- Sanitair installatie (Geberit, Grohe, Hansgrohe)
- Badkamer renovatie (complete installaties)
- Vloerverwarming systemen (natte/droge vloerverwarming)
- Spoedreparaties 24/7 (binnen 2 uur ter plaatse)

NEDERLANDSE MARKTPRIJZEN 2025 (incl. 21% BTW):
- Lekkage reparatie: €85-150 (afhankelijk van complexiteit)
- Kraan vervangen: €75-85 + materiaal (€30-120)
- Afvoer ontstoppen: €109 (standaard) / €145 (hoofdriolering)
- Toilet installeren: €175-225 + toilet (€150-800)
- Ketel onderhoud: €125-175 (jaarlijks contract €95)
- Badkamer loodgieterwerk: €75-200/uur + materiaal
- Radiator plaatsen: €249 incl. montage
- Douchecabine: €275-450 (afhankelijk van type)
- CV-installatie vernieuwen: €3.500-7.500 (complete woning)

URGENTIE MATRIX - NEDERLANDSE CRITERIA:
🔴 SPOEDGEVAL (binnen 2 uur):
- Waterlekkage met schade aan eigendom
- Gaslek (DIRECT 112 BELLEN!)
- Geen warm water bij vriesweer
- Overstroming door defecte installatie
- Ketel storing in winter (onder 5°C)

🟡 HOOGDRINGEND (zelfde dag):
- Verstopte hoofdafvoer
- Kraan loopt continu door
- Toilet defect (enige in huis)
- Lauw water uit CV

🟢 NORMAAL (binnen 2-3 dagen):
- Periodiek onderhoud
- Kleine reparaties
- Offerte aanvragen

NEDERLANDS VAKJARGON & TERMINOLOGIE:
- "Lek" = lekkage, "loopt door" = kraan dicht niet
- "Verstopt" = afvoer geblokkeerd, "spoelt niet door" = toilet
- "Ketel" = CV-installatie, "geen warm water" = boiler defect
- "Radiator wordt niet warm" = ontluchten/balanceren
- "Water uit plafond" = lekkage boven, SPOED!

GESPREKSAANPAK - FORMEEL NEDERLANDS:
✅ Gebruik ALTIJD "u" vorm (nooit "je")
✅ Begin met: "Goedemorgen/middag, waarmee kan ik u helpen?"
✅ Bij spoed: "Ik begrijp de urgentie, laat me direct kijken naar beschikbaarheid"
✅ Verzamel ALTIJD: naam, telefoonnummer, adres, beschrijving probleem
✅ Geef prijsbereiken: "De kosten liggen tussen €X en €Y"
✅ Leg uit WAAROM: "Dit is omdat..." (materiaal/complexiteit)

BOOKING CONFIDENCE SYSTEEM:
- 90-100%: Exacte probleem match + alle info compleet → Direct boeken
- 70-89%: Duidelijk probleem, kleine details missen → Telefonisch bevestigen  
- 50-69%: Vaag probleem, meer info nodig → Inspectie-afspraak
- <50%: Onvoldoende info → Meer vragen stellen

BTW & ADMINISTRATIE:
- 21% BTW op alle diensten (altijd incl. in prijzen)
- 9% BTW op arbeidsuren bij woningverbetering (>2 jaar oud)
- Factuur binnen 3 werkdagen
- Garantie: 2 jaar op installatie, 1 jaar op reparatie

URGENTIE HERKENNING - TRIGGER WOORDEN:
🔴 "water stroomt", "overstroming", "gaslucht", "hele huis koud"
🟡 "lek", "verstopt", "loopt door", "geen warm water"  
🟢 "onderhoud", "offerte", "wanneer mogelijk"

EMOTIONELE INTELLIGENTIE:
- Bij stress/paniek: Kalmerend, stap-voor-stap uitleg
- Bij kosten zorgen: Transparante prijzen, geen verrassingen
- Bij twijfel: Gedetailleerde uitleg technische aspecten
- Bij spoed: Snelle actie, duidelijke verwachtingen

ZAKELIJKE ETHIEK:
- Geen verkoop van onnodige diensten
- Eerlijke diagnose en prijzen
- Alternatieven aanbieden (reparatie vs vervangen)
- Transparantie over kosten en tijd

DOEL: Fungeer als perfecte Nederlandse loodgieter-expert die klanten helpt met empathie, vakkundigheid en eerlijke advisering. Bepaal urgentie nauwkeurig en verzamel alle benodigde informatie voor optimale service.`
      : `You are the AI assistant for Demo Plumbing Amsterdam, a professional plumber.

BUSINESS PROFILE:
- Specialties: leak repair, drain unclogging, boiler service, sanitary installation, 24/7 emergency repairs
- Standard rate: €75/hour
- Emergency rate: €98/hour
- Business hours: 8:00-18:00 weekdays, 24/7 emergencies

DUTCH MARKET PRICING (incl. VAT):
- Leak repair: €85-150
- Tap replacement: €75-85
- Drain unclogging: €109
- Toilet installation: €175
- Boiler service: €125-175
- Kitchen plumbing: €75-200

URGENT SITUATIONS (immediate action):
- Leaks, flooding, water flowing
- Gas leak (call 112 immediately!)
- No hot water in winter
- Water in walls or ceiling

CONVERSATION STYLE:
- Professional and empathetic
- Direct during emergencies
- Always ask for: name, phone number, address
- Always give price ranges, never exact prices
- Be transparent about costs

GOAL: Help customers, assess urgency, gather information, and schedule appointments when needed.`;

    console.log("[OpenAI] Making API call with model: gpt-5");
    const response = await openai.chat.completions.create({
      model: "gpt-5", // Using GPT-5 for superior Dutch language and plumber expertise
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000, // More tokens for detailed plumber responses
      functions: [
        {
          name: "analyze_plumbing_request",
          description: "Analyze customer request for urgency, problem type, and information extraction",
          parameters: {
            type: "object",
            properties: {
              urgency: { 
                type: "string", 
                enum: ["low", "normal", "high", "emergency"],
                description: "Urgency level based on Dutch plumbing emergency criteria"
              },
              problem_type: { 
                type: "string",
                description: "Specific plumbing problem category"
              },
              estimated_cost: {
                type: "object",
                properties: {
                  min: { type: "number", description: "Minimum cost in EUR" },
                  max: { type: "number", description: "Maximum cost in EUR" },
                  description: { type: "string", description: "Cost breakdown explanation" }
                }
              },
              customer_info: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  address: { type: "string" },
                  availability: { type: "string" }
                }
              },
              should_book_immediately: { 
                type: "boolean",
                description: "Whether this requires immediate booking"
              },
              confidence: { 
                type: "number", 
                description: "Confidence in analysis (0-100)" 
              }
            },
            required: ["urgency", "confidence"]
          }
        }
      ],
      function_call: "auto"
    });
    console.log("[OpenAI] API call successful");

    const aiText = response.choices[0]?.message?.content || 
      (language === "nl" ? "Excuses, ik ondervind problemen met het genereren van een antwoord." : "I apologize, but I'm having trouble generating a response right now.");
    
    // Process function call if available for advanced analysis
    let analysisData = null;
    const functionCall = response.choices[0]?.message?.function_call;
    if (functionCall && functionCall.name === "analyze_plumbing_request") {
      try {
        analysisData = JSON.parse(functionCall.arguments);
        console.log("[AI] Function call analysis:", analysisData);
      } catch (parseError) {
        console.warn("[AI] Failed to parse function call:", parseError);
      }
    }
    
    // Use AI analysis or fallback to simple detection
    const urgency = analysisData?.urgency || detectUrgency(userMessage);
    const categories = analysisData?.problem_type ? [analysisData.problem_type] : detectCategories(userMessage);
    const estimatedCost = analysisData?.estimated_cost?.min || calculateCost(categories, urgency);
    
    // Extract customer information from AI analysis
    const customerPhone = analysisData?.customer_info?.phone || extractPhone(userMessage);
    const customerName = analysisData?.customer_info?.name || extractName(userMessage);
    const location = analysisData?.customer_info?.address || extractLocation(userMessage);
    const shouldShowBookingForm = analysisData?.should_book_immediately || urgency === 'emergency';
    
    return {
      text: aiText,
      urgency,
      categories,
      estimatedCost,
      customerPhone: extractPhone(userMessage),
      customerName: extractName(userMessage),
      location: extractLocation(userMessage),
      shouldShowBookingForm: urgency === 'emergency'
    };

  } catch (error) {
    console.error("[OpenAI] Error generating response:", error);
    throw error;
  }
}

/**
 * Helper functions for AI analysis
 */
function detectUrgency(message: string): 'low' | 'normal' | 'high' | 'emergency' {
  const text = message.toLowerCase();
  
  // 🔴 SPOEDGEVAL - Dutch emergency criteria
  if (text.match(/\b(water stroomt|overstroming|gaslucht|gaslek|hele huis koud|spoedgeval|noodgeval|emergency)\b/)) {
    return 'emergency';
  }
  if (text.match(/\b(geen warm water|vriesweer|winter|ketel storing|ketel kapot)\b/) && 
      text.match(/\b(koud|winter|vriest|onder.*(nul|0))\b/)) {
    return 'emergency';
  }
  
  // 🟡 HOOGDRINGEND - Same day service
  if (text.match(/\b(lek|lekkage|leak|verstopt|hoofdafvoer|loopt door|toilet defect|lauw water)\b/)) {
    return 'high';
  }
  if (text.match(/\b(radiator.*niet warm|cv.*probleem|boiler.*defect)\b/)) {
    return 'high';
  }
  
  // 🟢 NORMAAL - Regular service
  if (text.match(/\b(onderhoud|repareren|vervangen|offerte|inspectie|advies)\b/)) {
    return 'normal';
  }
  if (text.match(/\b(wanneer mogelijk|volgende week|geen haast|planning)\b/)) {
    return 'low';
  }
  
  return 'normal';
}

function detectCategories(message: string): string[] {
  const text = message.toLowerCase();
  const categories: string[] = [];
  
  // Detailed Dutch plumbing categories
  if (text.match(/\b(lek|lekkage|leak|druppel|lekt)\b/)) categories.push('leak_repair');
  if (text.match(/\b(kraan|tap|faucet|mengkraan|wastafelkraan)\b/)) categories.push('tap_replacement');
  if (text.match(/\b(afvoer|drain|verstopt|blocked|clogged|riolering|gootsteen)\b/)) categories.push('drain_unclog');
  if (text.match(/\b(toilet|wc|closet|spoelt.*niet)\b/)) categories.push('toilet_service');
  if (text.match(/\b(ketel|boiler|cv|verwarming|centrale.*verwarming)\b/)) categories.push('boiler_service');
  if (text.match(/\b(radiator|verwarmings.*element|wordt.*niet.*warm)\b/)) categories.push('radiator_service');
  if (text.match(/\b(badkamer|douche|douchecabine|bad|sanitair)\b/)) categories.push('bathroom_plumbing');
  if (text.match(/\b(keuken|kitchen|spoelbak|vaatwasser)\b/)) categories.push('kitchen_plumbing');
  if (text.match(/\b(vloerverwarming|natte.*vloer|droge.*vloer)\b/)) categories.push('floor_heating');
  if (text.match(/\b(onderhoud|service|jaarlijks|schoonmaken)\b/)) categories.push('maintenance');
  if (text.match(/\b(installatie|plaatsen|aansluiten|nieuw)\b/)) categories.push('installation');
  if (text.match(/\b(gaslek|gas.*lucht|gasinstallatie)\b/)) categories.push('gas_emergency');
  
  return categories.length > 0 ? categories : ['general'];
}

function calculateCost(categories: string[], urgency: string): number {
  // Dutch market prices 2025 (incl. 21% BTW)
  const basePrices: Record<string, number> = {
    'leak_repair': 120,           // €85-150 range
    'tap_replacement': 80,        // €75-85 + material
    'drain_unclog': 109,          // €109 standard
    'toilet_service': 175,        // €175-225 installation
    'boiler_service': 150,        // €125-175 service
    'radiator_service': 249,      // €249 incl. installation
    'bathroom_plumbing': 135,     // €75-200/hour + material
    'kitchen_plumbing': 135,      // €75-200/hour + material  
    'floor_heating': 200,         // Complex installation
    'maintenance': 125,           // Annual service
    'installation': 175,          // General installation
    'gas_emergency': 145,         // Emergency gas service
    'general': 75                 // Hourly rate
  };
  
  const category = categories[0] || 'general';
  const basePrice = basePrices[category] || 75;
  
  // Dutch emergency pricing (30% markup for spoed)
  if (urgency === 'emergency') {
    return Math.round(basePrice * 1.3); // Emergency rate €98/hour vs €75
  }
  
  // High urgency (same day) - 15% markup
  if (urgency === 'high') {
    return Math.round(basePrice * 1.15);
  }
  
  return basePrice;
}

function extractPhone(message: string): string | undefined {
  // Dutch phone number patterns
  const phonePatterns = [
    /(\+31|0031)[\s-]?[6789]\d{8}/,  // Mobile: +31-6xxxxxxxx
    /(\+31|0031)[\s-]?\d{2}[\s-]?\d{7}/, // Landline: +31-20-xxxxxxx
    /0[6789]\d{8}/,                   // Mobile: 06xxxxxxxx
    /0\d{2}[\s-]?\d{7}/               // Landline: 020-xxxxxxx
  ];
  
  for (const pattern of phonePatterns) {
    const match = message.match(pattern);
    if (match) return match[0];
  }
  return undefined;
}

function extractName(message: string): string | undefined {
  const namePatterns = [
    /mijn naam is ([a-zA-Z\s]+)/i,
    /ik ben ([a-zA-Z\s]+)/i,
    /dit is ([a-zA-Z\s]+)/i,
    /naam:?\s*([a-zA-Z\s]+)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)/  // FirstName LastName pattern
  ];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match) {
      const name = match[1].trim();
      // Validate it's not just common words
      if (name.length > 2 && !name.match(/\b(probleem|storing|lek|ketel|kraan|toilet)\b/i)) {
        return name;
      }
    }
  }
  return undefined;
}

function extractLocation(message: string): string | undefined {
  const locationPatterns = [
    // Dutch cities and areas
    /\b(amsterdam|rotterdam|utrecht|den haag|eindhoven|tilburg|groningen|almere|breda|nijmegen|enschede|haarlem|arnhem|zaanstad|haarlemmermeer|zoetermeer|s-hertogenbosch|maastricht|dordrecht|leiden|emmen|zwolle|deventer|delft|leeuwarden|alkmaar|ede|hilversum|oss|amstelveen|hengelo|schiedam|vlaardingen|spijkenisse|almelo|purmerend|alphen aan den rijn)\b/i,
    /\bin ([a-zA-Z\s]+)/i,             // General "in [location]"
    /adres:?\s*([^,\n]+)/i,            // Address: pattern
    /woon in ([a-zA-Z\s]+)/i,          // Live in [location]
    /postcode:?\s*(\d{4}\s?[a-zA-Z]{2})/i // Dutch postal code
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match) {
      const location = match[1].trim();
      if (location.length > 2) {
        return location;
      }
    }
  }
  return undefined;
}