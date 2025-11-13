---
title: LEGALOPS_MASTER_BUILD_PLAN
version: 3.0
maintainer: Joby Ives / LegalOps Build Core
environment: Augment + Claude Sonnet 4.5
authority_rule: >
  Where conflicts exist between earlier build phases and Joby Ives directives,
  defer to Joby Ives’ implementation as final authority.
execution_mode: autonomous
description: >
  Full, end-to-end build specification for the LegalOps platform.
  Combines all prior dashboard and system build plans (Phases 1–6)
  with the new Smart + Safe Experience Overhaul (Phase 7),
  integrating Smart Forms, AI Risk Scoring, and the Liquid Glass UX.
---

# 🧭 LEGALOPS MASTER BUILD PLAN
> **Engineer of Record:** Claude Sonnet 4.5  
> **Build Mode:** Full Autonomous Execution (phase ordered)  

---

## 🔰 Preamble
This document is the single source of truth for all LegalOps engineering,
UX, and AI integration work.  
Every `<!-- SONNET_TASK: ... -->` block is an executable instruction.  
Each phase builds on the previous one in chronological order.

---

## 🏗️ Phase 1 – Core System Setup
- Scaffold Next.js + Prisma + Tailwind environment.
- Establish `/api` routing convention and authentication middleware.
- Define base Prisma models:
  `User`, `Client`, `BusinessEntity`, `Address`, `Document`, `Order`.
- Implement secure CRUD API routes.
<!-- SONNET_TASK: initialize Next.js app and Prisma schema baseline -->

---

## 📄 Phase 2 – Document Management System
- Enable secure document upload via RA Mail.
- Build `/dashboard/documents` and `/dashboard/ra-mail`.
- Integrate AI OCR and Document Summarization stubs.
<!-- SONNET_TASK: implement document OCR & summarization pipelines -->

---

## 🧩 Phase 3 – Client and Business Entity Management
- Relational link: User → Client → BusinessEntity.
- Add multi-business support.
- Implement `/dashboard/businesses/[id]` views with inline editing.
<!-- SONNET_TASK: link User ↔ Client ↔ BusinessEntity relationships -->

---

## 💼 Phase 4 – Service Checkout Flow
- Existing checkout built around Stripe API.
- Steps: Service Selection → Payment → Confirmation.
- Preserve Prisma `Order` and `PaymentIntent` schemas.
<!-- SONNET_TASK: maintain existing checkout flow and schemas -->

---

## 🧠 Phase 5 – AI Filing Agent Integration
- Integrate OpenAI API for form generation.
- Auto-populate Sunbiz forms from Prisma records.
- Maintain LLC, Annual Report, and Amendment flows.
<!-- SONNET_TASK: connect AI Filing Agent to Prisma and Sunbiz mappers -->

---

## 📊 Phase 6 – Dashboard Enhancement & Analytics
- Build the full LegalOps Portal Shell Layout.
- Implement global NavBar, SidePanel, and responsive cards.
- Add Analytics page with KPIs (pending filings, risk levels, AI metrics).
<!-- SONNET_TASK: implement Portal Shell and Analytics Dashboard -->

---

## ⚡ Phase 7 – Smart + Safe Experience Overhaul (NEW)
> **Lead Designer:** Joby Ives  
> **Objective:** Integrate Smart Forms, AI Risk Scoring, and Liquid Glass UI into the existing LegalOps ecosystem.

### 7.1 Smart Forms Automation
- Replace static forms with state-aware Smart Forms.  
- Auto-fill personal, business, agent, and manager fields using stored records.  
- Add one-click confirmation dialogs (“Use saved agent?”).  
- Visual state: verified fields = Liquid Glass Blue glow.  
- Progressive auto-load for mobile.
<!-- SONNET_TASK: implement Smart Form memory layer in /api/forms and /api/orders -->

### 7.2 AI Risk Scoring Integration
- Assess each order via behavioral, payment, and historical signals.  
- Display Security Confidence Badge on checkout step 2.  
- Add `/admin/risk-management` for review and approval.  
- Orders marked “Review” pause before Stripe capture.
<!-- SONNET_TASK: create /api/risk/assess endpoint and Admin Risk Dashboard -->

### 7.3 Unified UX Flow
- Public → Checkout → Dashboard should share visual continuity.  
- Add breadcrumbs and progress ribbons for orientation.  
- Apply Liquid Glass palette and Lucide-only icons.  
- Trust Signals: “Secure Payment”, “State Approved”, “AI Reviewed”.
<!-- SONNET_TASK: apply Liquid Glass design tokens and Lucide icons globally -->

### 7.4 Accessibility & Performance
- Enforce WCAG 2.1 AA contrast ratios.  
- Keyboard navigable modals and skip links.  
- Optimize AI calls for mobile (< 5 s response).
<!-- SONNET_TASK: run axe audit and Lighthouse tests -->

### 7.5 Testing & Feedback
- **Cypress:** Smart Form autofill accuracy (≥ 100 %).  
- **Playwright:** Admin risk review.  
- **Lighthouse:** Performance ≥ 90 score.  
- Add feedback beacon (“Was this clear?”).
<!-- SONNET_TASK: add testing suite for autofill and risk flows -->

---

## 🧱 System Integration Appendix

### A. Key APIs
| Endpoint | Method | Purpose |
|:--|:--|:--|
| `/api/risk/assess` | POST | Evaluate risk score and return recommendation |
| `/api/forms/drafts` | POST / GET | Persist Smart Form drafts |
| `/api/documents/ocr` | POST | Extract text from uploaded files |
| `/api/documents/summarize` | POST | Generate AI summary |

### B. Prisma Models
```prisma
model RiskAssessment {
  id                String @id @default(cuid())
  orderId           String
  userId            String
  score             Int
  level             RiskLevel
  recommendation    RiskRecommendation
  requiresReview    Boolean @default(false)
  factors           Json
  createdAt         DateTime @default(now())
}

enum RiskLevel { LOW MEDIUM HIGH CRITICAL }
enum RiskRecommendation { APPROVE REVIEW VERIFY DECLINE }
```
<!-- SONNET_TASK: migrate database to add RiskAssessment model -->

### C. Design Tokens (Liquid Glass)
```css
:root{
 --lg-surface: 255 255 255;
 --lg-glass: 255 255 255 / 0.6;
 --lg-sky: 37 99 235;
 --lg-emerald: 16 185 129;
 --lg-amber: 245 158 11;
 --radius-lg: 20px;
 --shadow-soft: 0 8px 28px rgba(0,0,0,0.08);
}
```
<!-- SONNET_TASK: apply design tokens in tailwind.config.ts -->

### D. Components & Routes
- `/checkout` → `RiskBadge`, `TrustStrip`, single-column layout.  
- `/confirmation` → order status + redirect to `/dashboard/customer`.  
- `/dashboard/customer` → Health Score, Action Center, My Businesses.  
- Contracts:
  - `RiskBadge.tsx`: `{ score: number; level: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; }`
  - `Wizard.tsx`: `{ steps: Step[]; current: number; onNext():void; onBack():void }`
<!-- SONNET_TASK: scaffold RiskBadge, TrustStrip, and Wizard components -->

### E. Testing Plan
- Cypress e2e: checkout and autofill flows  
- Playwright: admin risk approval  
- Axe + Lighthouse: a11y and performance budget
<!-- SONNET_TASK: implement test automation pipeline -->

### F. KPIs & Success Metrics
| Metric | Baseline | Target |
|:--|:--|:--|
| Filing Time | 10 min | < 2 min |
| Risk False Positives | 5 % | < 1 % |
| Conversion Rate | 35 % | 55 % |
| Accessibility Score | 80 | ≥ 95 |
| User Satisfaction | 4.3 / 5 | ≥ 4.8 / 5 |

### G. Deployment & Env
- `OPENAI_API_KEY`, `BLOB_STORAGE_URL`, `DATABASE_URL`, `STRIPE_SECRET_KEY`  
- Fail-safe behavior when `OPENAI_API_KEY` is missing (rules-only risk scoring).
<!-- SONNET_TASK: add env var checks and graceful fallbacks -->

---

## ⚙️ Risk Register & Mitigation
| Risk | Mitigation |
|:--|:--|
| AI false positives | Admin override + threshold tuning |
| OCR latency | Queue jobs + lazy summary loading |
| A11y regressions | Pre-merge axe checks + Storybook a11y add-on |
| Performance drops | Lighthouse budget enforcement |

---

## ✅ Final Directive to Claude Sonnet 4.5
> Execute this build plan phase by phase.  
> Treat each SONNET_TASK as an atomic task unit.  
> Where duplicate instructions exist, Joby Ives directives override previous plans.  
> Maintain Liquid Glass UI consistency and UPL-safe automation practices throughout.
