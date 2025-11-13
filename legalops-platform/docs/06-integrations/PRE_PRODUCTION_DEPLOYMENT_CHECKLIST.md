# Pre-Production Deployment Checklist

## 🎯 Overview
This checklist ensures all critical configurations are production-ready before launching LegalOps v1. Complete ALL items before deploying to production.

---

## 🔐 **Critical: API Keys & Environment Variables**

### **SendGrid Email Service** ⚠️ **REQUIRED FOR EMAIL FUNCTIONALITY**

**Current Status:** ❌ Using test/placeholder API key  
**Impact:** Emails will NOT be sent (magic links, order confirmations, notifications)  
**Location:** `legalops-platform/.env`

**Action Required:**
1. Sign up for SendGrid account: https://app.sendgrid.com/
2. Create API key: https://app.sendgrid.com/settings/api_keys
   - Name: `LegalOps Production`
   - Permissions: `Full Access` or `Mail Send` only
3. Replace placeholder in `.env`:
   ```bash
   # BEFORE (Development - emails won't send):
   SENDGRID_API_KEY="SG.test_1234567890abcdefghijklmnop"
   
   # AFTER (Production - emails will send):
   SENDGRID_API_KEY="SG.your_real_api_key_here"
   ```
4. Verify sender email is configured in SendGrid:
   - Go to: https://app.sendgrid.com/settings/sender_auth
   - Verify domain OR single sender email
   - Update `FROM_EMAIL` in `.env` to match verified sender

**Test After Replacement:**
```bash
# Restart dev server
npm run dev

# Test email sending:
# 1. Save DBA draft (authenticated or guest)
# 2. Check terminal for: "✅ Email sent successfully"
# 3. Check inbox for magic link email
```

---

### **Stripe Payment Processing**

**Current Status:** ✅ Using test keys (correct for development)  
**Location:** `legalops-platform/.env`

**Action Required Before Production:**
1. Get production keys: https://dashboard.stripe.com/apikeys
2. Replace test keys in `.env`:
   ```bash
   # BEFORE (Development):
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   
   # AFTER (Production):
   STRIPE_SECRET_KEY="sk_live_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   ```
3. Update webhook secret:
   - Create production webhook: https://dashboard.stripe.com/webhooks
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook signing secret
   - Update `STRIPE_WEBHOOK_SECRET` in `.env`

---

### **Database Configuration**

**Current Status:** ✅ Using Neon PostgreSQL (production-ready)  
**Location:** `legalops-platform/.env`

**Action Required Before Production:**
1. Verify production database URL is set:
   ```bash
   DATABASE_URL="postgresql://neondb_owner:npg_...@ep-...-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```
2. Enable connection pooling (already configured with `-pooler` endpoint)
3. Set up automated backups in Neon dashboard
4. Run production migrations:
   ```bash
   npx prisma migrate deploy
   ```

---

### **NextAuth Configuration**

**Current Status:** ⚠️ Using development secret  
**Location:** `legalops-platform/.env`

**Action Required Before Production:**
1. Generate secure secret:
   ```bash
   openssl rand -base64 32
   ```
2. Update `.env`:
   ```bash
   # BEFORE (Development):
   NEXTAUTH_SECRET="legalops-v1-secret-key-change-in-production-2025"
   NEXTAUTH_URL="http://localhost:3000"
   
   # AFTER (Production):
   NEXTAUTH_SECRET="your_generated_secure_secret_here"
   NEXTAUTH_URL="https://yourdomain.com"
   ```

---

### **USPS Address Validation**

**Current Status:** ✅ Using production credentials  
**Location:** `legalops-platform/.env`

**Action Required:** None (already configured)

---

## 📧 **Email Templates & Sender Configuration**

### **Verify Email Templates**
- [ ] Order confirmation emails display correctly
- [ ] DBA magic link emails display correctly
- [ ] Publication certification emails display correctly
- [ ] All email links use production domain (not localhost)

### **Update Email Links**
Search codebase for `localhost:3000` and replace with production domain:
```bash
# Files to check:
- src/lib/services/email-service.ts
- src/app/api/dba/save-draft/route.ts
- src/app/api/dba/save-draft-authenticated/route.ts
```

---

## 🔒 **Security Configuration**

### **Environment Variables**
- [ ] All API keys are production keys (not test/placeholder)
- [ ] All secrets are cryptographically secure (not default values)
- [ ] `.env` file is in `.gitignore` (never commit to Git)
- [ ] Production `.env` is stored securely (password manager, secrets vault)

### **HTTPS/SSL**
- [ ] SSL certificate installed and valid
- [ ] All HTTP traffic redirects to HTTPS
- [ ] HSTS headers configured
- [ ] Mixed content warnings resolved

### **CORS Configuration**
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Remove development origins (`localhost`, `127.0.0.1`)

---

## 🧪 **Pre-Launch Testing**

### **Email Functionality**
- [ ] Order confirmation emails send successfully
- [ ] DBA magic link emails send successfully
- [ ] Magic links work and redirect correctly
- [ ] Calendar reminder downloads work
- [ ] All email links use production domain

### **Payment Processing**
- [ ] Test payments with Stripe production mode
- [ ] Verify webhook events are received
- [ ] Test payment success flow
- [ ] Test payment failure flow
- [ ] Verify order creation in database

### **Database Operations**
- [ ] All CRUD operations work correctly
- [ ] Database migrations applied successfully
- [ ] Connection pooling works under load
- [ ] Backup/restore procedures tested

---

## 📊 **Monitoring & Logging**

### **Error Tracking**
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure error alerts
- [ ] Test error reporting

### **Performance Monitoring**
- [ ] Set up performance monitoring
- [ ] Configure slow query alerts
- [ ] Monitor API response times

### **Email Delivery Monitoring**
- [ ] Monitor SendGrid delivery rates
- [ ] Set up bounce/spam alerts
- [ ] Configure email analytics

---

## 🚀 **Deployment Steps**

### **1. Pre-Deployment**
- [ ] Complete ALL items in this checklist
- [ ] Run full test suite
- [ ] Create database backup
- [ ] Document rollback procedure

### **2. Deployment**
- [ ] Deploy application to production server
- [ ] Update environment variables on server
- [ ] Run database migrations
- [ ] Restart application services

### **3. Post-Deployment Verification**
- [ ] Test homepage loads correctly
- [ ] Test user registration/login
- [ ] Test DBA filing workflow (guest and authenticated)
- [ ] Test payment processing
- [ ] Test email sending
- [ ] Verify database connectivity
- [ ] Check error logs for issues

### **4. Go-Live**
- [ ] Monitor error rates for 24 hours
- [ ] Monitor email delivery rates
- [ ] Monitor payment success rates
- [ ] Be ready to rollback if critical issues arise

---

## 📝 **Quick Reference: Critical Files**

### **Environment Configuration**
- `legalops-platform/.env` - All API keys and secrets

### **Email Service**
- `legalops-platform/src/lib/services/email-service.ts` - SendGrid integration

### **Payment Processing**
- `legalops-platform/src/app/api/checkout/route.ts` - Stripe integration
- `legalops-platform/src/app/api/webhooks/stripe/route.ts` - Webhook handler

### **Database**
- `legalops-platform/prisma/schema.prisma` - Database schema
- `legalops-platform/prisma/migrations/` - Migration history

---

## ⚠️ **CRITICAL REMINDER**

**DO NOT deploy to production until:**
1. ✅ SendGrid API key is replaced with real production key
2. ✅ Stripe keys are replaced with live production keys
3. ✅ NextAuth secret is replaced with secure generated secret
4. ✅ All email templates tested and working
5. ✅ All payment flows tested and working
6. ✅ Database backups configured and tested

**Failure to complete these steps will result in:**
- ❌ Emails not being sent (broken magic links, no order confirmations)
- ❌ Payment processing failures
- ❌ Security vulnerabilities
- ❌ Poor customer experience
- ❌ Lost revenue

---

## 📞 **Support Resources**

### **SendGrid**
- Dashboard: https://app.sendgrid.com/
- Documentation: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/

### **Stripe**
- Dashboard: https://dashboard.stripe.com/
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com/

### **Neon (Database)**
- Dashboard: https://console.neon.tech/
- Documentation: https://neon.tech/docs
- Support: https://neon.tech/docs/introduction/support

---

**Last Updated:** 2025-11-05  
**Status:** Development - NOT production ready until checklist complete

