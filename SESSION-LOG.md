# Voice Pipeline MVP — Full Session Log

## Date: 2026-03-21 → 2026-03-22

---

## Phase 1: PRD Creation via Interview

### Process
Used `prd-interview.md` prompt — structured JTBD interview with 6 questions + 7 edge cases.

### Key decisions from interview:
1. **Segment chosen**: "Mobile Hunter" — solo real estate agent (1-3 people), Cyprus/Greece/Spain/UAE
2. **Core Jobs**: (1) voice-capture lead updates <10s, (2) morning plan with follow-ups, (3) restore buyer context in 5s
3. **Risks to validate**: retention without push triggers (D30>30%) + willingness to pay (~50 EUR/mo)
4. **Scope**: Day 1 (board + manual) + Day 2 (voice + reminders) + responsive mobile + daily WhatsApp/email summary
5. **Edge cases**: duplicate names → show candidates with phone+summary, LLM confirmation before applying, status moves bidirectional, no lead deletion

### Generated artifacts:
- `2-3-MVP/results/PRD.md` — full PRD
- Segments analysis (3 segments by AJTBD methodology)
- RAT analysis (3 risky assumptions with P×I scoring)

---

## Phase 2: Landing Page

### Text
- Used `landing-page-text.md` template with JTBD structure
- Generated `2-3-MVP/results/my-landing-page-text.md`
- English, real estate domain language throughout

### HTML iterations:
1. **v1** — dark theme, Instrument Serif + Manrope fonts, cyan accent, ambient orbs
2. **v2** — Placy brand (Inter, Ginger #EFA943, Blue #15B8FF, Cream background)
3. **v3** — dark theme per user request, Placy design tokens from `placy-website-design/`
4. **v4** — removed Placy logo and name (standalone experiment), branded as "VoicePipeline"
5. **v5** — full-width pipeline preview (all 6 columns, 12 leads, voice bar + confirmation panel)
6. **Final** — two-column hero (text left, iPhone mockup right), working Pipeline/Today tabs in phone

### Design sources used:
- `Placy_Context/placy-website-design/SKILL.md` — latest design system
- `Placy_Context/placy-website-design/assets/placy-theme.css` — Tailwind v4 tokens
- `Placy_Context/Placy_Claude-code/.claude/skills/placy-brand-guidelines/` — colors, typography, icons

### User feedback incorporated:
- Dark theme required
- No Placy branding
- More real estate context (properties, viewings, Bazaraki, Cyprus locations)
- Larger product illustration
- Mobile-first mockup (iPhone 15 Pro)

---

## Phase 3: MVP Application Build

### Project setup
- `product-mvp/` directory
- Next.js 16 + React 19 + TypeScript
- Tailwind v4 + shadcn/ui (base-nova style, copied from `Placy_Context/prototypes/channel-analytics/`)
- Prisma ORM
- Started with SQLite, later migrated to PostgreSQL (Neon) for Vercel

### Database evolution:
1. SQLite (local dev) → PostgreSQL (Neon cloud) for Vercel deployment
2. Initial schema: Lead + Note
3. Added: User + Session (for auth)
4. Added fields: transactionType, leadRole, nextAction, viewingDate, refNumber

### API routes built:
- `GET/POST /api/leads` — list and create leads
- `GET/PATCH /api/leads/[id]` — detail and update (auto-creates status_change notes)
- `POST /api/notes` — add notes to leads
- `POST /api/voice` — single-shot voice parsing (legacy, still works)
- `POST /api/voice/chat` — multi-turn conversational assistant
- `POST /api/auth/register` — create account
- `GET/POST /api/auth/[...nextauth]` — NextAuth handler

### Components built:
- `Navigation.tsx` — bottom nav (mobile) / top nav (desktop) with avatar menu
- `PipelineBoard.tsx` — Kanban with DndContext
- `PipelineColumn.tsx` — droppable column
- `LeadCard.tsx` — draggable card with useDraggable
- `LeadForm.tsx` — manual lead creation
- `VoiceButton.tsx` — mic button with Web Speech API (legacy)
- `VoiceConfirm.tsx` — simple confirm bar (legacy, replaced)
- `Providers.tsx` — NextAuth SessionProvider wrapper

### Voice Assistant components (replaced VoiceButton/VoiceConfirm):
- `voice-assistant/conversation-reducer.ts` — state machine (idle→listening→processing→active→applying→done)
- `voice-assistant/use-voice-conversation.ts` — hook: Web Speech + API + action application
- `voice-assistant/assistant-dialog.tsx` — modal dialog with chat UI, smart replies, sticky input bar
- `voice-assistant/message-bubble.tsx` — chat message bubbles
- `voice-assistant/action-preview-card.tsx` — structured preview of pending action

### Pages:
- `/` — redirect to landing.html
- `/login` — sign in (email + password)
- `/register` — create account
- `/app` — Pipeline Board
- `/today` — Today View (overdue, follow-ups, viewings)
- `/leads/[id]` — Lead Detail (info, status, timeline, edit)

---

## Phase 4: Voice Assistant Evolution

### v1 — Simple confirm bar
- VoiceButton captures speech → sends to `/api/voice` → shows small confirm bar at bottom
- Problem: user felt "lost", couldn't see what's happening, no dialog

### v2 — Conversational dialog (major refactor)
Used 3 Placy agents in parallel for analysis:
- **(^◡^) User Researcher** — identified 5 UX pain points ("black hole", "no conversational weight")
- **Journey Map Creator** — mapped Flow A (current, problematic) vs Flow B (proposed, conversational)
- **(@_@) Engineer** — designed state machine, component architecture, API design

Key insight from User Researcher:
> "The current flow treats the assistant as a command processor. The user expects a colleague with ears."

### v3 — Fixes based on user testing
1. **Stale closure bug** — "yes" didn't work because sendToAssistant closed over old state.messages → fixed with useRef
2. **Search with real data** — assistant now queries DB and returns actual lead details
3. **Lead detail context** — AssistantDialog knows which lead is open
4. **Smart quick replies** — LLM generates contextual buttons (not hardcoded Yes/No)
5. **System prompt improvements** — "yes" = immediate action, no re-confirmation

### v4 — Mobile UX fixes
- Auto-zoom disabled (viewport max-scale + 16px inputs)
- Bottom sheet instead of centered modal on mobile
- Silence timeout 3s → 5s
- Smart replies made mandatory in prompt
- Phone validation simplified (don't over-ask)

### v5 — Sticky input bar
- Replaced FAB with centered input bar at bottom of every screen
- Type text or tap mic
- Always visible, fixed on scroll

---

## Phase 5: Data Model Enhancement

### Analysis process
User shared Placy data model spec (2 screenshots with fields).

Ran two agents in parallel:
- **(^◡^) User Researcher** — classified fields as P0/P1/P2 based on agent daily workflow
- **(@_@) Engineer** — assessed implementation effort, breaking changes, file impacts

### User Researcher key findings:
- 3 new fields NOT in spec but critical: `urgency` (hot/warm/cold), `next_action`, `voice_memo_ref`
- `campaign`, `condition`, `price_value` — skip for MVP (serve CRM completionism, not agent productivity)
- `budget` should stay as string (not split into min/max/currency)
- Phone array — over-engineering for 15-30 leads

### Fields added (P0):
- `transactionType` (Sale/Rent/Auction)
- `leadRole` (Buyer/Tenant/Seller/Landlord)
- `nextAction` (what to do at follow-up)
- `viewingDate` (scheduled viewing datetime)
- `refNumber` (property reference)

### Cyprus-specific additions to voice prompt:
- Full geography: cities, areas, streets (Limassol, Paphos, Larnaca, Nicosia areas)
- Voice transcription correction ("Minneapolis" → "Limassol")
- Phone format: +357 9X XXXXXX, auto-prepend +357

---

## Phase 6: Authentication

### Approach: Email + password (simpler than Google OAuth)
- NextAuth v4 with Credentials provider
- bcrypt password hashing
- JWT sessions (30 day expiry)
- Middleware protects /app, /today, /leads/*
- User model: id, email, name, passwordHash
- Avatar menu with initials + sign out dropdown

### Google OAuth was considered but rejected:
- Requires Google Cloud Console setup, consent screen, verification
- More setup time for no additional value at MVP stage
- Can be added later as alternative sign-in method

---

## Phase 7: Deployment

### Attempt 1: Russian server (176.53.173.69)
- Ubuntu 24.04, 2GB RAM, 15GB SSD
- Installed Node.js 20, Nginx reverse proxy, systemd service
- Self-signed SSL for Web Speech API (requires HTTPS)
- **Problem**: OpenAI API blocked from Russian IP ("unsupported_country_region_territory")

### Attempt 2: Vercel (successful)
- Connected GitHub repo → auto-deploy on push
- Migrated SQLite → PostgreSQL (Neon free tier)
- All env vars configured via Vercel CLI
- HTTPS out of the box → mic works
- **Production URL**: https://product-mvp-hazel.vercel.app

### Services:
| Service | Details |
|---------|---------|
| Vercel | Hosting, serverless functions, auto-deploy from GitHub |
| Neon | PostgreSQL, project: cool-surf-29648272, region: us-east-2 |
| GitHub | https://github.com/dykmv/voice-pipeline-mvp |
| OpenAI | gpt-4o-mini for chat, whisper-1 for future WhatsApp voice |

---

## Phase 8: WhatsApp Integration Analysis (not implemented yet)

### Recommended approach:
- Meta Cloud API (direct, no middleman)
- Webhook endpoint on Vercel (`/api/whatsapp`)
- Voice messages: download .ogg → Whisper API → existing chat logic
- User linking: phone field in User model
- Estimated effort: 8-10 hours
- Estimated cost: ~$21-25/mo (Vercel Pro + Whisper)

### Architecture:
```
WhatsApp → Meta Cloud API → Webhook (Vercel) → Whisper → GPT-4o-mini → DB → Reply
```

### Key requirement:
Extract chat logic from `/api/voice/chat` into shared `lib/voice-chat.ts` so both web and WhatsApp use same function.

---

## Environment Variables (Vercel Production)

```
DATABASE_URL=postgresql://neondb_owner:npg_6gpbC4cxaKnH@ep-royal-dew-ae7n9sku...
DIRECT_URL=postgresql://neondb_owner:npg_6gpbC4cxaKnH@ep-royal-dew-ae7n9sku...
OPENAI_API_KEY=sk-proj-h-M748nnD_T7kgDUSg...
NEXTAUTH_SECRET=vp-mvp-secret-key-change-in-production-2026
NEXTAUTH_URL=https://product-mvp-hazel.vercel.app
```

---

## Git Commit History

1. Initial commit: Voice Pipeline MVP (full app)
2. Switch from SQLite to PostgreSQL for Vercel deployment
3. Add drag & drop for lead cards
4. Replace FAB with sticky input bar at bottom center
5. Add input bar spacing, Cyprus locations, phone validation
6. Add transaction_type, lead_role, next_action, viewing_date, ref_number
7. Fix mobile UX: zoom, dialog, voice timeout, smart replies, phone
8. Add email + password authentication
9. Add avatar menu with sign out + limit LeadForm width
10. Add session log with full build history and decisions
