# 🔍 LegalOps v1 - Automated Code Review Report

**Generated:** 11/14/2025, 9:26:28 PM
**Overall Health:** FAIR

## 📊 Summary

- **Critical Issues:** 2
- **Warnings:** 1
- **Suggestions:** 1

## 🚨 Critical Issues (Requires Immediate Attention)

1. Found 8 TypeScript type errors
2. Found 1101 ESLint errors

## ⚠️ Warnings

1. Found 2012 ESLint warnings

## 💡 Suggestions for Improvement

1. 23 packages have updates available

## 📋 Detailed Analysis

### TypeScript Errors

**Total Issues:** 8

```
.next/types/validator.ts(810,31): error TS2344: Type 'typeof import("C:/Users/imali/Documents/augment-projects/LegalOps_v1/legalops-platform/src/app/api/dba/get-draft/[token]/route")' does not satisfy the constraint 'RouteHandlerConfig<"/api/dba/get-draft/[token]">'.
prisma/seed-notices.ts(112,7): error TS2322: Type '{ userId: string; type: string; priority: string; title: string; message: string; filingId: string | undefined; actionUrl: string | null; actionLabel: string; } | { userId: string; type: string; ... 5 more ...; filingId?: undefined; }' is not assignable to type '(Without<NoticeCreateInput, NoticeUncheckedCreateInput> & NoticeUncheckedCreateInput) | (Without<...> & NoticeCreateInput)'.
src/app/api/filings/annual-report/route.ts(58,7): error TS2322: Type 'Omit<Filing, "id" | "createdAt" | "updatedAt">' is not assignable to type '(Without<FilingCreateInput, FilingUncheckedCreateInput> & FilingUncheckedCreateInput) | (Without<...> & FilingCreateInput)'.
src/app/api/orders/[orderId]/add-items/route.ts(84,7): error TS2322: Type '{ orderId: string; serviceType: string; description: string; quantity: number; unitPrice: number; totalPrice: number; requiresAdditionalData: boolean; dataCollectionFormType: string | undefined; }[]' is not assignable to type 'OrderItemCreateManyInput | OrderItemCreateManyInput[]'.
src/app/orders/[orderId]/ein-application/page.tsx(206,13): error TS2322: Type '{ formData: any; onChange: Dispatch<any>; }' is not assignable to type 'IntrinsicAttributes & EINApplicationFormProps'.
src/app/orders/[orderId]/operating-agreement/page.tsx(206,13): error TS2322: Type '{ formData: any; onChange: Dispatch<any>; }' is not assignable to type 'IntrinsicAttributes & OperatingAgreementFormProps'.
src/app/services/[slug]/page.tsx(393,25): error TS2719: Type '(pkg: Package) => void' is not assignable to type '(pkg: Package) => void'. Two different types with this name exist, but they are unrelated.
src/components/HealthScoreModal.tsx(385,38): error TS2503: Cannot find namespace 'JSX'.
```

### ESLint Issues

- **Errors:** 1101
- **Warnings:** 2012

### Security Vulnerabilities

- **Critical:** 0
- **High:** 0
- **Moderate:** 3
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
