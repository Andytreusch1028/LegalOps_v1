# AI System Overview  
This document defines how all AI assistants (Claude Sonnet 4.5 in Augment, ChatGPT, Qodo) should behave when working inside this project. This is the top-level reference for AI behavior and system rules.

---

## 1. Purpose of This AI System
This project uses AI as an active coding partner. To work safely and consistently, all AI tools must:

- Load the correct project context  
- Work step-by-step  
- Stay grounded in real files  
- Avoid hallucination  
- Follow validation and safety rules  
- Keep changes small, reviewable, and predictable  
- Stay aligned with the developer’s current focus

---

## 2. Authoritative Sources of Truth  
The primary files that define AI behavior are:

1. `/PROJECT-TRACKER.md`
2. `/docs/09-ai-system/AI-Safe-Execution-Sonnet.md`
3. `/docs/09-ai-system/Dev-Workflow.md`

These three files override any older instructions.  
All other `/docs/*` folders are **project reference only**, not behavior instructions.

---

## 3. Working Style Required From All AI Tools

### **A. Load Context Before Acting**
AI must always read:
- `PROJECT-TRACKER.md`
- Relevant docs in `/docs/09-ai-system/`

AI may optionally reference:
- `/docs/03-architecture`
- `/docs/02-design-system`
- `/docs/05-testing`
- `/docs/06-integrations`

These folders provide *reference*, not rules.

---

### **B. Think Before Doing**
For any task, AI must:
1. Explain reasoning  
2. Predict possible side-effects  
3. Propose a short plan  
4. Wait for approval before major changes  
5. Apply existing patterns used in the codebase  
6. Avoid guessing when information is missing  

---

### **C. Keep Code Changes Safe & Small**
- Make incremental edits  
- Never refactor multiple systems at once unless asked  
- Follow existing naming conventions, styles, and patterns  
- Anchor code in project structure rather than guesswork  

---

## 4. Tools This System Supports
- **Claude Sonnet 4.5 (Augment)**: main coding agent  
- **ChatGPT**: architecture, planning, docs, and cleanup  
- **Qodo**: code quality, PR review, and consistency enforcement  
- **GitHub**: version history and PR workflow  

Each tool uses the same rule set so behavior remains consistent.

---

## 5. Escalation: When AI Should Ask Questions
AI must ask for clarification if:

- A feature lacks acceptance criteria  
- API behavior is unknown  
- Database schema is unclear  
- A task conflicts with existing code  
- A file or directory is missing  
- A change might affect multiple modules  

Avoid hallucination by asking instead of guessing.

---

## 6. AI Is Not Allowed To:
- Invent data models  
- Create undocumented patterns  
- Introduce new dependencies without permission  
- Move or rename directories without approval  
- Modify deployment files unless explicitly told to  
- Overwrit
