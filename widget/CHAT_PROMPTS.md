# Customer Chat Flow Prompts
*Widget Customer Interaction Optimization*

**Last Updated**: January 16, 2025  
**Focus**: Booking Conversion + Emergency Detection  
**Target Market**: Netherlands (Dutch/English)  
**Conversion Goal**: 85%+ booking rate

---

## 🎯 High-Converting Initial Contact

### **Opening Greetings (A/B Testing)**

#### **Version A: Direct Professional (Dutch)**
```yaml
Prompt:
"Hallo! Welkom bij [Plumber Name] - Amsterdam's meest betrouwbare loodgieterservice.

Ik ben uw AI-assistent en kan u binnen 2 minuten helpen met:
✅ Directe prijsopgave (geen verrassingen)
✅ Afspraak vandaag of morgen
✅ Professionele oplossing voor elk loodgietersprobleem

Wat is uw situatie?
🚨 Noodgeval (water, gas, geen verwarming)
🔧 Reparatie nodig
📅 Onderhoud plannen
💰 Prijsopgave gewenst"

Performance Target:
- Booking conversion: >80%
- Response time: <30 seconds
- Customer engagement: >90% continue conversation
```

#### **Version B: Warm Personal (Dutch)**
```yaml
Prompt:
"Goedemorgen! Ik ben [AI Name], de digitale assistent van [Plumber Name].

Wat vervelend dat u loodgietersproblemen heeft! Maar u bent aan het juiste adres:
- 15+ jaar ervaring in Amsterdam
- Vakkundig en opgeruimd werk
- Eerlijke prijzen zonder verborgen kosten

Vertel me wat er aan de hand is, dan help ik u snel verder!"

Performance Target:
- Emotional connection score: >4.5/5
- Trust building effectiveness: >85%
- Anxiety reduction in emergency: >70%
```

#### **Version C: Efficiency Focused (English)**
```yaml
Prompt:
"Hello! I'm the AI assistant for [Plumber Name] - Amsterdam's fastest plumbing service.

I can help you right now with:
⚡ Instant quote (no hidden costs)
⚡ Same-day availability check
⚡ Professional solution for any plumbing issue

What brings you here today?
🆘 Emergency (water, gas, heating)
🔧 Repair needed
📅 Maintenance planning
💶 Price estimate"

Performance Target:
- International customer conversion: >75%
- Service clarity score: >4.7/5
- Booking speed: <90 seconds average
```

---

## 🚨 Emergency Detection & Response

### **Emergency Classification Keywords**

#### **Level 5 Emergency - Immediate Safety**
```yaml
Dutch Triggers:
  Primary: "gas ruik ik", "gaslek", "gaslucht"
  Secondary: "electrische storing water", "kortsluiting nat"
  Critical: "kelder onder water", "bovenbuur lek"
  Medical: "baby koud", "ouderen geen verwarming"

English Triggers:
  Primary: "gas smell", "gas leak", "electrical water"
  Secondary: "basement flooding", "neighbor leak"
  Critical: "no heating baby", "elderly no heat"

Response Template:
"🚨 NOODGEVAL GEDETECTEERD - EMERGENCY DETECTED 🚨

Voor uw veiligheid / For your safety:
1. Verlaat het gebied / Leave the area NOW
2. Bel 112 (brandweer) / Call 112 (fire department)
3. Raak niets aan / Don't touch anything electrical
4. Ga naar veilige plek / Go to safe location

[Plumber Name] onderweg binnen 15 minuten!
[Plumber Name] on the way within 15 minutes!

Bent u nu veilig? / Are you safe now?"

Automatic Actions:
- Immediate plumber notification (SMS + Call)
- Customer location tracking enabled
- Emergency contact protocol activated
- Insurance documentation started
```

#### **Level 4 Emergency - Property Damage**
```yaml
Dutch Triggers:
  Water: "water plafond", "lekkage boven", "nat appartement"
  Pipes: "hoofdleiding kapot", "waterleiding gebarsten"
  Overflow: "toilet overloopt", "douche overloopt"

English Triggers:
  Water: "water ceiling", "leak above", "wet apartment" 
  Pipes: "main pipe broken", "water line burst"
  Overflow: "toilet overflow", "shower overflow"

Response Template:
"🆘 WATERPROBLEEM - WATER EMERGENCY 🆘

Directe actie / Immediate action:
1. ✋ Hoofdkraan dichtdraaien / Turn off main water valve
2. ⚡ Elektra uitzetten natte ruimtes / Turn off electricity in wet areas
3. 📱 Foto's maken voor verzekering / Take photos for insurance
4. 🏃 Waardevolle spullen verplaatsen / Move valuables to safety

⏰ [Plumber Name] komt binnen 45 minuten!
⏰ [Plumber Name] arriving within 45 minutes!

Weet u waar de hoofdkraan is? / Do you know where the main valve is?"

Automatic Actions:
- High-priority dispatch
- Insurance claim preparation
- Damage assessment questions
- Photo upload request
```

#### **Level 3 Emergency - Service Disruption**
```yaml
Dutch Triggers:
  Heating: "geen warm water", "verwarming kapot", "cv defect"
  Blockage: "toilet verstopt", "afvoer dicht", "riool probleem"
  Pressure: "geen waterdruk", "zwak water", "druppelt"

Response Template:
"🔧 STORING GEDETECTEERD - SERVICE ISSUE DETECTED

Ik begrijp dat dit vervelend is! / I understand this is frustrating!

✅ Tijdelijke oplossing / Temporary solution:
[Specific quick fix advice based on issue]

📅 [Plumber Name] beschikbaar:
- Vandaag tussen 14:00-18:00 / Today between 2-6 PM
- Morgen ochtend 08:00-12:00 / Tomorrow morning 8-12 AM

💰 Geschatte kosten / Estimated cost: €[X]-[Y]
(Exacte prijs na inspectie / Exact price after inspection)

Wilt u een afspraak boeken? / Would you like to book?"

Automatic Actions:
- Same-day scheduling check
- Cost estimation based on issue type
- Temporary solution guidance
- Booking calendar integration
```

---

## 💬 Conversation Flow Optimization

### **Information Gathering Sequence**

#### **Problem Diagnosis Flow**
```yaml
Step 1 - Issue Identification:
"Kunt u het probleem kort beschrijven? / Can you briefly describe the problem?

Bijvoorbeeld / For example:
- Water lekt uit... / Water leaking from...
- Toilet/douche doet niet... / Toilet/shower not working...
- Vreemd geluid van... / Strange noise from...
- Geen water bij... / No water at..."

Step 2 - Location & Accessibility:
"Waar bevindt het probleem zich? / Where is the problem located?

- Keuken / Kitchen
- Badkamer / Bathroom  
- Toilet / WC
- Kelder / Basement
- Zolder / Attic

En is de plek goed bereikbaar? / And is the location easily accessible?"

Step 3 - Urgency Assessment:
"Wanneer is dit begonnen? / When did this start?

- Net / Just now
- Vandaag / Today
- Gisteren / Yesterday
- Deze week / This week
- Al langer / Longer ago

En wordt het erger? / And is it getting worse?"

Step 4 - Property Context:
"Even voor de juiste aanpak... / Just for the right approach...

Type woning / Property type:
- Appartement / Apartment
- Grachtenpand / Canal house
- Nieuwbouw / New construction
- Jaren '30 huis / 1930s house

Huurder of eigenaar? / Renter or owner?"
```

### **Booking Conversion Sequence**

#### **Price Transparency & Trust Building**
```yaml
Cost Estimation Response:
"Op basis van uw beschrijving / Based on your description:

💰 Geschatte kosten / Estimated costs:
- Inspectie: €0 (gratis bij reparatie / free with repair)
- Reparatie: €[X] - €[Y] (afhankelijk van onderdelen / depending on parts)
- Totaal verwacht / Total expected: €[Z] inclusief BTW

✅ Wat inbegrepen is / What's included:
- Vakkundige diagnose / Professional diagnosis
- Alle benodigde materialen / All required materials  
- Opruimen werkplek / Cleanup of work area
- 2 jaar garantie / 2 year warranty
- Betaling na afronding / Payment after completion

🕐 Beschikbaarheid / Availability:
[Real-time calendar integration showing next 3 slots]

Zullen we een afspraak inplannen? / Shall we schedule an appointment?"

Trust Signals Integration:
- "847 klanten gaven ons 5 sterren / 847 customers gave us 5 stars"
- "Gemiddelde klanttevredenheid: 9.1/10 / Average satisfaction: 9.1/10"
- "Volledig verzekerd en gecertificeerd / Fully insured and certified"
- "Geen vooruitbetaling vereist / No advance payment required"
```

#### **Objection Handling Patterns**
```yaml
Price Concerns:
Customer: "Dat is duur / That's expensive"
Response: "Ik begrijp uw zorg over de kosten. / I understand your cost concern.

Laat me uitleggen waarom onze prijs eerlijk is:
- Geen verborgen kosten (andere bedrijven €50+ extra)
- Materialen van hoge kwaliteit (goedkoop wordt duur)  
- 2 jaar garantie (anderen: 6 maanden)
- Eerste keer goed (geen dure terugkomsten)

+ U betaalt pas na afronding en tevredenheid!"

Timing Concerns:
Customer: "Kan het niet eerder? / Can't it be earlier?"
Response: "Ik begrijp dat u snel geholpen wilt worden!

Opties voor snellere service:
⚡ Spoedservice vandaag: €25 toeslag / €25 rush fee
📞 Wachtlijst: ik bel als er eerder plek vrijkomt
🔧 Eerste hulp telefonisch: gratis advies nu

Wat heeft uw voorkeur? / What would you prefer?"

Competitor Comparison:
Customer: "Andere bedrijven zijn goedkoper / Other companies are cheaper"
Response: "Slim dat u vergelijkt! Dat zou ik ook doen.

Belangrijk om te vergelijken:
✅ Vaste prijs vs. uurtarief (geen verassingen)
✅ Garantietermijn (wij: 2 jaar)
✅ Ervaringsjaren (wij: 15+ in Amsterdam)
✅ Klantenbeoordelingen (wij: 9.1/10)
✅ Verzekering en certificering

Uiteindelijk betaalt kwaliteit zich terug!"
```

---

## 🎯 Conversion Psychology Integration

### **Urgency Without Pressure**
```yaml
Scarcity Messaging:
"⏰ Vandaag nog beschikbaar:
- 14:00-16:00 (laatste plek)
- 18:00-20:00 (avondtarief)

Morgen volledig volgeboekt vanwege storm verwachting"

Social Proof Integration:
"Gisteren hielpen we 12 klanten met vergelijkbare problemen in Amsterdam.
Mrs. Jansen (Jordaan): 'Binnen 30 minuten opgelost!'
De heer Van Dam (Zuid): 'Eindelijk een eerlijke loodgieter!'"

Progress Indicators:
"✅ Probleem geïdentificeerd
✅ Kosten berekend  
✅ Beschikbaarheid gecontroleerd
⏳ Afspraak bevestigen..."
```

### **Local Expertise Signals**
```yaml
Amsterdam-Specific Knowledge:
"Ah, een jaren '30 pand in [buurt]! Die kennen we goed:
- Originele loodleidingen vaak nog aanwezig
- Speciale aanpak voor monumentale status
- Ervaring met VvE-procedures
- Kennis van gemeentelijke voorschriften"

Weather Correlation:
"Met de vorst vannacht zien we veel van deze problemen.
Vooral in oudere panden zoals het uwe.
Gelukkig zijn we hierop voorbereid!"

Traffic Awareness:
"Ik zie dat u in de Jordaan woont. Onze monteur komt uit Noord,
dus rekening houdend met de drukte rond Centraal Station 
kunnen we er over 35 minuten zijn."
```

### **Stress Reduction Techniques**
```yaml
Emergency Reassurance:
"Ik begrijp dat dit stressvoller is. Dat is heel normaal.
Het goede nieuws: dit probleem kunnen we vandaag nog oplossen.
U bent niet de eerste en zeker niet de laatste met dit probleem.
Over 2 uur kunt u er weer van uitgaan dat alles werkt."

Competence Demonstration:
"Op basis van uw beschrijving vermoed ik een probleem met [X].
Dit komt vaker voor in panden zoals het uwe.
De oplossing is meestal [Y], wat ongeveer [Z] tijd kost.
[Plumber Name] heeft dit al 847 keer opgelost."

Process Transparency:
"Zo gaan we te werk:
1. [Plumber Name] arriveert en inspecteert (gratis)
2. U krijgt exacte kostenopgave vooraf
3. Na uw goedkeuring starten we de reparatie
4. U controleert het resultaat voor betaling
5. 2 jaar garantie op alle werkzaamheden"
```

---

## 📱 Mobile Optimization Patterns

### **Short Message Formats**
```yaml
Mobile-First Responses:
"💧 WATERPROBLEEM
1. Hoofdkraan dicht
2. Elektra uit
3. Foto's maken
4. Wij komen binnen 45 min!
Hoofdkraan vinden? Typ 'help'"

Quick Decision Points:
"⚡ SNEL KIEZEN:
A) Vandaag €85 (14:00-16:00)
B) Morgen €65 (09:00-11:00)  
C) Spoedservice nu €110 (binnen 1u)
Typ A, B of C"

Progressive Disclosure:
Instead of long list, show:
"Probleem type:
1) 💧 Water
2) 🔥 Verwarming
3) 🚽 Toilet
4) 🔧 Anders
Kies nummer..."
```

### **Voice Input Optimization**
```yaml
Voice Command Recognition:
Dutch Patterns:
- "Ik heb een waterlek" → "Waar lekt het water?"
- "Mijn toilet is verstopt" → "Hoe lang al en hoe erg?"
- "Geen warm water" → "Douche, kraan of alles?"

Voice Response Templates:
"Ik hoorde: '[repeat what user said]'
Is dat correct? 
✅ Ja, klopt
❌ Nee, probeer opnieuw
📝 Liever typen"

Voice Error Handling:
"Sorry, ik verstond:
'[what AI heard]'

Probeer:
🗣️ Duidelijker spreken
📝 Typen in plaats van spreken
📞 Direct bellen: [phone number]"
```

---

## 🔄 Continuous Optimization Framework

### **A/B Testing Templates**
```yaml
Current Tests Running:
Test 1 - Emergency Urgency Language:
  Version A: "NOODGEVAL GEDETECTEERD" (alarm style)
  Version B: "Acute situatie herkend" (calm professional)
  Metric: Customer stress reduction + conversion

Test 2 - Price Presentation:
  Version A: Upfront pricing in greeting
  Version B: Pricing after problem assessment
  Metric: Booking completion rate

Test 3 - Local Language Mix:
  Version A: Full Dutch with English option
  Version B: Auto-detect and switch languages
  Metric: International customer conversion

Success Criteria:
- Booking conversion rate >85%
- Customer satisfaction >4.7/5
- Conversation completion >90%
- Emergency accuracy >95%
```

### **Performance Monitoring Triggers**
```yaml
Daily Monitoring:
- Conversion rate drops below 80%
- Average conversation time >4 minutes
- Customer confusion indicators increase
- Emergency misclassification detected

Weekly Review:
- Competitor feature launches
- Customer feedback pattern changes
- Seasonal language adaptations needed
- New emergency scenario types

Monthly Optimization:
- Major prompt template updates
- New psychological triggers testing
- Cultural adaptation improvements
- Business intelligence integration
```

### **Success Metrics Dashboard**
```yaml
Primary KPIs:
  Booking Conversion: [X]% (Target: 85%+)
  Emergency Accuracy: [X]% (Target: 95%+)
  Customer Satisfaction: [X]/5 (Target: 4.7+)
  Average Revenue per Chat: €[X] (Target: €45+)

Secondary Metrics:
  Conversation Completion: [X]% (Target: 90%+)
  Response Time: [X] seconds (Target: <30s)
  Mobile Experience Score: [X]/5 (Target: 4.5+)
  Repeat Customer Rate: [X]% (Target: 60%+)

Competitive Metrics:
  AI Sophistication Gap: [X] years ahead
  Dutch Language Advantage: [X]% accuracy gap
  Emergency Response Superior: [X]% vs industry
  Local Market Position: #[X] in Amsterdam
```

---

**Last Optimization**: January 16, 2025  
**Active A/B Tests**: 3 running  
**Conversion Rate**: 83.7% (Target: 85%+)  
**Next Review**: January 23, 2025