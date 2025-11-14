# 🔍 LegalOps v1 - Automated Code Review Report

**Generated:** 11/13/2025, 11:00:11 PM
**Overall Health:** FAIR

## 📊 Summary

- **Critical Issues:** 2
- **Warnings:** 1
- **Suggestions:** 1

## 🚨 Critical Issues (Requires Immediate Attention)

1. Found 93 TypeScript type errors
2. Found 1102 ESLint errors

## ⚠️ Warnings

1. Found 2009 ESLint warnings

## 💡 Suggestions for Improvement

1. 23 packages have updates available

## 📋 Detailed Analysis

### TypeScript Errors

**Total Issues:** 93

```
.next/types/validator.ts(810,31): error TS2344: Type 'typeof import("C:/Users/imali/Documents/augment-projects/LegalOps_v1/legalops-platform/src/app/api/dba/get-draft/[token]/route")' does not satisfy the constraint 'RouteHandlerConfig<"/api/dba/get-draft/[token]">'.
prisma/seed-notices.ts(112,7): error TS2322: Type '{ userId: string; type: string; priority: string; title: string; message: string; filingId: string | undefined; actionUrl: string | null; actionLabel: string; } | { userId: string; type: string; ... 5 more ...; filingId?: undefined; }' is not assignable to type '(Without<NoticeCreateInput, NoticeUncheckedCreateInput> & NoticeUncheckedCreateInput) | (Without<...> & NoticeCreateInput)'.
scripts/import-florida-entities.ts(150,29): error TS2339: Property 'dataSync' does not exist on type 'PrismaClient<PrismaClientOptions, never, DefaultArgs>'.
scripts/list-orders.ts(41,24): error TS18047: 'order.user' is possibly 'null'.
scripts/list-orders.ts(41,48): error TS18047: 'order.user' is possibly 'null'.
scripts/list-orders.ts(42,14): error TS18047: 'order.user' is possibly 'null'.
scripts/list-orders.ts(42,38): error TS18047: 'order.user' is possibly 'null'.
scripts/list-orders.ts(43,11): error TS18047: 'order.user' is possibly 'null'.
src/app/admin/entities/[id]/page.tsx(48,57): error TS2339: Property 'type' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; clientId: string | null; businessEntityId: string | null; state: string; street: string; street2: string | null; city: string; zipCode: string; country: string; addressType: AddressType; registeredAgentId: string | null; }'.
src/app/admin/entities/[id]/page.tsx(49,55): error TS2339: Property 'type' does not exist on type '{ id: string; createdAt: Date; updatedAt: Date; clientId: string | null; businessEntityId: string | null; state: string; street: string; street2: string | null; city: string; zipCode: string; country: string; addressType: AddressType; registeredAgentId: string | null; }'.
... and 10 more
```

### ESLint Issues

- **Errors:** 1102
- **Warnings:** 2009

### Security Vulnerabilities

- **Critical:** 0
- **High:** 0
- **Moderate:** 2
- **Low:** 2

---

## 🤖 Instructions for Sonnet 4.5

Please review the issues above and provide:

1. **Root Cause Analysis** - What's causing these issues?
2. **Priority Ranking** - Which issues should be fixed first?
3. **Step-by-Step Fix Instructions** - Detailed instructions for each critical issue
4. **Code Examples** - Show me the exact code changes needed
5. **Prevention Strategy** - How to avoid these issues in the future

Focus on critical issues first, then warnings, then suggestions.
