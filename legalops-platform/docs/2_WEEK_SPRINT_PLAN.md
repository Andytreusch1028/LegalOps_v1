# 2-Week Sprint Plan: Core Checkout Flow

**Start Date:** Next Session  
**Goal:** Working checkout flow with basic fraud protection  
**Approach:** Foundation first, AI features later (Month 3)

---

## 🎯 Sprint Objectives

By end of Week 2, you will have:

✅ **Working checkout flow** - Customer can order and pay  
✅ **Service selection** - LLC formation and annual report  
✅ **Payment processing** - Stripe integration  
✅ **Order confirmation** - Success page and email  
✅ **Basic fraud protection** - Rule-based checks (no AI cost)  
✅ **Email notifications** - Order confirmation and decline emails  

**NOT in this sprint:**
- ❌ Full AI risk scoring (postponed to Month 3)
- ❌ Sunbiz API integration (Month 3)
- ❌ Additional filing types (Month 3)

---

## 📅 Week 1: Basic Checkout Flow

### **Day 1-2: Service Selection & LLC Formation Form**

**Tasks:**
1. Create `/services` page - List available services
2. Create `/services/llc-formation` page - LLC formation flow
3. Build LLC formation form components:
   - Business name input
   - Business purpose
   - Registered agent selection
   - Principal address
   - Member/manager information
4. Integrate `AddressValidationModal` (already built)
5. Form validation and error handling

**Files to Create:**
- `src/app/services/page.tsx`
- `src/app/services/llc-formation/page.tsx`
- `src/components/forms/LLCFormationForm.tsx`

**Expected Outcome:** Customer can fill out LLC formation form

---

### **Day 3-4: Checkout Page**

**Tasks:**
1. Create `/checkout` page
2. Order summary component
3. Payment form (Stripe Elements)
4. Billing address form
5. Order total calculation (subtotal + tax)
6. Form validation

**Files to Create:**
- `src/app/checkout/page.tsx`
- `src/components/checkout/OrderSummary.tsx`
- `src/components/checkout/PaymentForm.tsx`

**Expected Outcome:** Customer sees order summary and can enter payment info

---

### **Day 5-7: Payment Processing & Confirmation**

**Tasks:**
1. Set up Stripe account (if not done)
2. Install Stripe packages: `npm install @stripe/stripe-js stripe`
3. Create Stripe payment intent API: `/api/stripe/create-payment-intent`
4. Process payment on checkout
5. Create order in database after successful payment
6. Create `/order-confirmation` page
7. Show order number, receipt, next steps
8. Test complete flow end-to-end

**Files to Create:**
- `src/app/api/stripe/create-payment-intent/route.ts`
- `src/app/api/orders/create/route.ts` (simple version, no AI)
- `src/app/order-confirmation/page.tsx`

**Environment Variables Needed:**
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Expected Outcome:** Customer can complete purchase and see confirmation

---

## 📅 Week 2: Simple Protection & Email

### **Day 8-9: Disclaimer & Rule-Based Fraud Checks**

**Tasks:**
1. Add `ServiceRefusalDisclaimer` to checkout start (already built)
2. Create simple fraud detection service (NO AI, NO GPT-4):
   - Check for temporary email domains
   - Check for prepaid cards
   - Check for new account + large order
   - Check for previous chargebacks
3. Modify order creation to run simple checks BEFORE payment
4. Show `OrderDeclinedMessage` if declined (already built)
5. Test decline scenarios

**Files to Create:**
- `src/lib/services/simple-fraud-detection.ts` (rule-based only)

**Files to Modify:**
- `src/app/checkout/page.tsx` (add disclaimer)
- `src/app/api/orders/create/route.ts` (add fraud checks)

**Expected Outcome:** Basic fraud protection without AI costs

---

### **Day 10-11: Email Notifications**

**Tasks:**
1. Choose email service (SendGrid recommended - free tier: 100 emails/day)
2. Sign up for SendGrid account
3. Install package: `npm install @sendgrid/mail`
4. Create email service: `src/lib/services/email-service.ts`
5. Create email templates:
   - Order confirmation
   - Order declined
   - Filing submitted
6. Send emails on order events
7. Test email delivery

**Files to Create:**
- `src/lib/services/email-service.ts`
- `src/lib/email-templates/order-confirmation.ts`
- `src/lib/email-templates/order-declined.ts`

**Environment Variables Needed:**
```env
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@legalops.com
```

**Expected Outcome:** Customers receive email confirmations

---

### **Day 12-14: Testing, Polish & Documentation**

**Tasks:**
1. Test complete flow multiple times:
   - LLC formation order
   - Annual report order
   - Declined order (temporary email)
   - Payment success
   - Payment failure
2. Fix any bugs found
3. Polish UI/UX
4. Add loading states
5. Add error messages
6. Update documentation
7. Create user guide for testing

**Expected Outcome:** Polished, working checkout flow ready for real customers

---

## 🔧 Technical Stack

**Frontend:**
- Next.js 15.5.5
- React 18+
- TypeScript
- Tailwind CSS
- Stripe Elements (payment UI)

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL database
- Stripe API (payment processing)
- SendGrid API (email)

**No AI in this sprint:**
- ❌ OpenAI API (save for Month 3)
- ❌ GPT-4 analysis (save for Month 3)

---

## 💰 Costs for This Sprint

**Required:**
- Stripe: Free (test mode)
- SendGrid: Free tier (100 emails/day)
- Database: $0 (local development)

**Total: $0** 🎉

**Later (Month 3) when adding AI:**
- OpenAI API: ~$200-400/month

---

## 📊 Success Metrics

By end of sprint, you should be able to:

1. ✅ Customer visits site
2. ✅ Customer selects LLC formation service
3. ✅ Customer fills out business details
4. ✅ Customer sees order summary
5. ✅ Customer accepts service refusal disclaimer
6. ✅ Customer enters payment information
7. ✅ System checks for basic fraud patterns
8. ✅ If legitimate: Process payment via Stripe
9. ✅ If fraud: Show decline page (no charge)
10. ✅ Create order in database
11. ✅ Show confirmation page
12. ✅ Send confirmation email
13. ✅ Customer sees order in dashboard

**End-to-end time:** ~5-10 minutes per order

---

## 🚀 What Happens After This Sprint

### **Month 3: Upgrade to Full AI**

Once basic checkout works and you have real customer data:

1. Enable the AI risk scoring we already built
2. Add GPT-4 analysis for behavioral patterns
3. Add admin review dashboard (already built)
4. Add verification workflow
5. Fine-tune based on actual fraud patterns

**Effort:** 2-3 days (everything already built, just plug in)

---

## 📝 Daily Checklist Template

Use this each day:

```
[ ] Morning: Review yesterday's work
[ ] Morning: Read today's tasks
[ ] Work: Complete tasks for the day
[ ] Afternoon: Test what you built
[ ] Evening: Commit code to Git
[ ] Evening: Update progress notes
[ ] Evening: Plan tomorrow
```

---

## 🎯 Key Principles for This Sprint

1. **Keep it simple** - Basic functionality first
2. **No scope creep** - Stick to the plan
3. **Test frequently** - Don't wait until the end
4. **Commit often** - Save your work
5. **Ask for help** - When stuck, ask
6. **Stay focused** - Ignore shiny new features

---

## 🛑 When You Get Ahead of Yourself

**If you start thinking about:**
- "What if we add AI here..."
- "We should build this advanced feature..."
- "Let me research this cool technology..."

**STOP and ask:**
1. Can a customer complete a purchase without this?
2. Is this in the 2-week sprint plan?
3. Can this wait until Month 3?

**If answers are YES, NO, YES → Skip it for now!**

---

## 📞 Support & Resources

**Stripe Documentation:**
- https://stripe.com/docs/payments/accept-a-payment
- https://stripe.com/docs/stripe-js/react

**SendGrid Documentation:**
- https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs

**Next.js Documentation:**
- https://nextjs.org/docs

---

## ✅ Sprint Completion Checklist

At end of Week 2, verify:

- [ ] Customer can select LLC formation service
- [ ] Customer can fill out business details
- [ ] Address validation works
- [ ] Customer can proceed to checkout
- [ ] Service refusal disclaimer shows and requires acceptance
- [ ] Order summary displays correctly
- [ ] Payment form works (Stripe Elements)
- [ ] Basic fraud checks run before payment
- [ ] Legitimate orders process payment successfully
- [ ] Fraudulent orders are declined (no charge)
- [ ] Order is created in database
- [ ] Confirmation page shows order details
- [ ] Confirmation email is sent
- [ ] Order appears in customer dashboard
- [ ] All code is committed to Git
- [ ] Documentation is updated

---

## 🎉 Next Session Plan

**When you return, we'll start with:**

1. Review this sprint plan together
2. Set up Stripe account (if needed)
3. Create service selection page
4. Begin LLC formation form

**Estimated time to first working checkout:** 7-10 days of focused work

---

**Remember: Foundation first, fancy features later!** 🏗️

**You have permission to get excited about advanced features, but I have permission to nudge you back on track!** 😊

---

**See you next session!** 🚀

