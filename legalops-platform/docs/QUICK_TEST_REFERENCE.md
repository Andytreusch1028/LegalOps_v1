# Quick Test Reference Card

## 🚀 Start Testing in 30 Seconds

### 1. Open Browser
```
http://localhost:3000/services
```

### 2. Sign In
- Email: `test@example.com`
- Password: `TestPassword123!`

### 3. Click "LLC FORMATION" Filter

### 4. Click "LLC Formation" Card

### 5. Fill Form
- Business Name: `Test LLC 2025`
- Purpose: `General business`
- Agent: Select any
- Address: Enter Florida address
- Member: Add one member

### 6. Click "Proceed to Checkout"

### 7. Check Terms Checkbox

### 8. Enter Card
```
Card: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
```

### 9. Click "Pay $XX.XX"

### 10. Verify Confirmation Page ✅

---

## 🧪 Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Decline |
| 4000 2500 0000 3155 | ⚠️ Auth Required |

**Expiry:** Any future date  
**CVC:** Any 3 digits

---

## ✅ What to Check

- [ ] Services page loads
- [ ] Filtering works
- [ ] Form accepts input
- [ ] Address validation works
- [ ] Checkout page shows order
- [ ] Payment form loads
- [ ] Payment succeeds
- [ ] Confirmation page shows
- [ ] Order in dashboard
- [ ] Email received

---

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Services | http://localhost:3000/services |
| Checkout | http://localhost:3000/checkout/[orderId] |
| Confirmation | http://localhost:3000/order-confirmation/[orderId] |
| Dashboard | http://localhost:3000/dashboard/orders |

---

## 📊 Expected Results

| Step | Expected |
|------|----------|
| Services Load | 15 services shown |
| Filter | Only LLC services shown |
| Form | All fields work |
| Checkout | Order summary correct |
| Payment | Processes in 2-5 seconds |
| Confirmation | Shows order details |
| Dashboard | Order appears with "PAID" status |
| Email | Confirmation received |

---

## 🐛 If Something Breaks

| Issue | Fix |
|-------|-----|
| Payment form missing | Check browser console (F12) |
| Payment fails | Try card again or use 4242... |
| Order not in dashboard | Refresh page |
| Email not received | Check spam folder |
| Form won't submit | Check for validation errors |

---

## 📝 Test Scenarios

### Scenario 1: Success ✅
- Use card: `4242 4242 4242 4242`
- Should complete successfully

### Scenario 2: Decline ❌
- Use card: `4000 0000 0000 0002`
- Should show error and stay on checkout

### Scenario 3: Annual Report
- Select "ANNUAL REPORT" filter
- Complete checkout

### Scenario 4: Dissolution
- Select "DISSOLUTION" filter
- Complete checkout

---

## ⏱️ Time Estimates

| Phase | Time |
|-------|------|
| Browse Services | 2 min |
| Select Service | 1 min |
| Fill Form | 5 min |
| Checkout | 2 min |
| Accept Terms | 2 min |
| Payment | 2 min |
| Confirmation | 2 min |
| Dashboard | 2 min |
| **Total** | **~20 min** |

---

## 📞 Need Help?

1. Check TESTING_GUIDE.md
2. Check MANUAL_TEST_STEPS.md
3. Check browser console (F12)
4. Check server logs

---

## ✨ Success Indicators

- ✅ No red errors in console
- ✅ Payment processes in 2-5 seconds
- ✅ Confirmation page loads
- ✅ Order appears in dashboard
- ✅ Email received (if SendGrid configured)

---

**Happy Testing! 🎉**

