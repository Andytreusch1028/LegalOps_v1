# LegalOps v1 - Complete Icon Library Reference

**Purpose:** Visual catalog of ALL icons needed for the application, organized by feature area

**Last Updated:** 2025-10-19

---

## 📚 Icon Library: Lucide React

**Installation:** `npm install lucide-react` ✅ Already installed

**Documentation:** https://lucide.dev

**Usage:**
```tsx
import { Building2, Check, AlertCircle } from 'lucide-react';

<Building2 className="w-6 h-6 text-sky-600" />
```

---

## 🏢 Business & Entity Management

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| 🏢 Business | `Building2` | Business entity cards, LLC formation | ✅ Have |
| 🏛️ Corporation | `Building` | Corporation filings | Need |
| 📝 Edit | `Edit` | Edit business details | Need |
| ➕ Add | `Plus` | Add new business | Need |
| 🗑️ Delete | `Trash2` | Delete business | Need |
| 👁️ View | `Eye` | View business details | Need |
| 🔍 Search | `Search` | Search businesses | Need |
| 📋 Copy | `Copy` | Copy business info | Need |
| 🔗 Link | `ExternalLink` | View on Sunbiz | ✅ Have |

**Import Statement:**
```tsx
import { 
  Building2, 
  Building, 
  Edit, 
  Plus, 
  Trash2, 
  Eye, 
  Search, 
  Copy, 
  ExternalLink 
} from 'lucide-react';
```

---

## 📄 Document & Filing Management

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| 📄 Document | `FileText` | General documents | Need |
| 📁 Folder | `Folder` | Document folders | Need |
| 📂 Open Folder | `FolderOpen` | Active folder | Need |
| 📤 Upload | `Upload` | Submit filing | Need |
| 📥 Download | `Download` | Download document | Need |
| 📋 Clipboard | `ClipboardList` | Filing checklist | Need |
| ✅ Approved | `CheckCircle` | Approved filing | Need |
| ⏳ Pending | `Clock` | Pending review | ✅ Have |
| ❌ Rejected | `XCircle` | Rejected filing | Need |
| 🔄 Processing | `RefreshCw` | Processing status | Need |
| 📎 Attachment | `Paperclip` | File attachments | Need |
| 🖨️ Print | `Printer` | Print document | Need |

**Import Statement:**
```tsx
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  Upload, 
  Download, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Paperclip, 
  Printer 
} from 'lucide-react';
```

---

## 💳 Payment & Orders

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| 💳 Credit Card | `CreditCard` | Payment method | Need |
| 💰 Money | `DollarSign` | Pricing, totals | Need |
| 🛒 Cart | `ShoppingCart` | Shopping cart | Need |
| 🧾 Receipt | `Receipt` | Order receipt | Need |
| ✅ Payment Success | `CheckCircle` | Payment confirmed | Need |
| ❌ Payment Failed | `XCircle` | Payment declined | Need |
| 🔒 Secure | `Lock` | Secure payment | Need |
| 🏦 Bank | `Landmark` | Bank account | Need |
| 💸 Refund | `DollarSign` | Refund issued | Need |

**Import Statement:**
```tsx
import { 
  CreditCard, 
  DollarSign, 
  ShoppingCart, 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Landmark 
} from 'lucide-react';
```

---

## 👤 User & Account Management

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| 👤 User | `User` | User profile | Need |
| 👥 Users | `Users` | Multiple users, team | Need |
| 🔐 Login | `LogIn` | Sign in | Need |
| 🚪 Logout | `LogOut` | Sign out | Need |
| ⚙️ Settings | `Settings` | Account settings | Need |
| 🔔 Notifications | `Bell` | Notifications | Need |
| 📧 Email | `Mail` | Email address | Need |
| 📱 Phone | `Phone` | Phone number | Need |
| 🏠 Address | `MapPin` | Physical address | Need |
| 🆔 ID | `CreditCard` | Identification | Need |

**Import Statement:**
```tsx
import { 
  User, 
  Users, 
  LogIn, 
  LogOut, 
  Settings, 
  Bell, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard 
} from 'lucide-react';
```

---

## 📊 Dashboard & Analytics

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| 📊 Bar Chart | `BarChart3` | Analytics | Need |
| 📈 Line Chart | `TrendingUp` | Growth metrics | Need |
| 📉 Decline | `TrendingDown` | Declining metrics | Need |
| 🎯 Target | `Target` | Goals, KPIs | Need |
| 📅 Calendar | `Calendar` | Dates, deadlines | Need |
| ⏰ Time | `Clock` | Time tracking | ✅ Have |
| 🏠 Home | `Home` | Dashboard home | Need |
| 📱 Activity | `Activity` | Activity feed | Need |
| 🔍 Insights | `Eye` | Data insights | Need |

**Import Statement:**
```tsx
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Clock, 
  Home, 
  Activity, 
  Eye 
} from 'lucide-react';
```

---

## ⚠️ Alerts & Status

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| ✅ Success | `CheckCircle` | Success messages | Need |
| ⚠️ Warning | `AlertTriangle` | Warnings | Need |
| ❌ Error | `XCircle` | Error messages | Need |
| ℹ️ Info | `Info` | Information | Need |
| 🔔 Alert | `Bell` | Notifications | Need |
| 🚨 Urgent | `AlertCircle` | Urgent alerts | ✅ Have |
| ❓ Help | `HelpCircle` | Help/tooltips | Need |
| 🛡️ Security | `Shield` | Security features | ✅ Have |
| ⚡ Priority | `Zap` | High priority | Need |

**Import Statement:**
```tsx
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Bell, 
  AlertCircle, 
  HelpCircle, 
  Shield, 
  Zap 
} from 'lucide-react';
```

---

## 🔧 Actions & Controls

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| ✏️ Edit | `Edit` | Edit action | Need |
| 💾 Save | `Save` | Save changes | Need |
| ❌ Cancel | `X` | Cancel action | Need |
| ✅ Confirm | `Check` | Confirm action | ✅ Have |
| 🔄 Refresh | `RefreshCw` | Refresh data | Need |
| ⚙️ Settings | `Settings` | Settings menu | Need |
| 🔍 Search | `Search` | Search function | Need |
| 🗑️ Delete | `Trash2` | Delete item | Need |
| 📋 Copy | `Copy` | Copy to clipboard | Need |
| 🔗 Link | `Link` | Create link | Need |
| 📌 Pin | `Pin` | Pin item | Need |
| ⭐ Favorite | `Star` | Mark favorite | Need |

**Import Statement:**
```tsx
import { 
  Edit, 
  Save, 
  X, 
  Check, 
  RefreshCw, 
  Settings, 
  Search, 
  Trash2, 
  Copy, 
  Link, 
  Pin, 
  Star 
} from 'lucide-react';
```

---

## 🧭 Navigation

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| ➡️ Right | `ChevronRight` | Next, forward | ✅ Have |
| ⬅️ Left | `ChevronLeft` | Back, previous | ✅ Have |
| ⬆️ Up | `ChevronUp` | Expand, scroll up | Need |
| ⬇️ Down | `ChevronDown` | Collapse, scroll down | Need |
| 🏠 Home | `Home` | Home page | Need |
| 📱 Menu | `Menu` | Mobile menu | Need |
| ❌ Close | `X` | Close modal | Need |
| 🔙 Back | `ArrowLeft` | Go back | Need |
| 🔜 Forward | `ArrowRight` | Go forward | Need |
| 🔝 Top | `ArrowUp` | Scroll to top | Need |

**Import Statement:**
```tsx
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronUp, 
  ChevronDown, 
  Home, 
  Menu, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp 
} from 'lucide-react';
```

---

## 🎨 Estate Planning (Months 4-5)

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| 📜 Will | `ScrollText` | Last will & testament | Future |
| 🏥 Healthcare | `Heart` | Healthcare directive | Future |
| 💼 Trust | `Briefcase` | Living trust | Future |
| 👨‍👩‍👧‍👦 Family | `Users` | Family members | Future |
| 🏡 Property | `Home` | Real estate | Future |
| 💎 Assets | `Gem` | Asset management | Future |
| 👤 Guardian | `UserCheck` | Guardian designation | Future |
| ⚖️ Legal | `Scale` | Legal documents | Future |

**Import Statement:**
```tsx
import { 
  ScrollText, 
  Heart, 
  Briefcase, 
  Users, 
  Home, 
  Gem, 
  UserCheck, 
  Scale 
} from 'lucide-react';
```

---

## 🤖 AI & Automation

| Icon Name | Lucide Component | Usage | Priority |
|-----------|------------------|-------|----------|
| 🤖 AI | `Bot` | AI features | Need |
| 🧠 Smart | `Brain` | Smart suggestions | Need |
| ⚡ Auto | `Zap` | Automation | Need |
| 🔍 Analyze | `ScanSearch` | AI analysis | Need |
| 📊 Insights | `LineChart` | AI insights | Need |
| 🎯 Recommend | `Target` | Recommendations | Need |

**Import Statement:**
```tsx
import { 
  Bot, 
  Brain, 
  Zap, 
  ScanSearch, 
  LineChart, 
  Target 
} from 'lucide-react';
```

---

## 📋 Complete Import List (Copy & Paste)

```tsx
// LegalOps v1 - Complete Icon Library
import {
  // Business & Entity
  Building2,
  Building,
  Edit,
  Plus,
  Trash2,
  Eye,
  Search,
  Copy,
  ExternalLink,
  
  // Documents & Filings
  FileText,
  Folder,
  FolderOpen,
  Upload,
  Download,
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Paperclip,
  Printer,
  
  // Payment & Orders
  CreditCard,
  DollarSign,
  ShoppingCart,
  Receipt,
  Lock,
  Landmark,
  
  // User & Account
  User,
  Users,
  LogIn,
  LogOut,
  Settings,
  Bell,
  Mail,
  Phone,
  MapPin,
  
  // Dashboard & Analytics
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Home,
  Activity,
  
  // Alerts & Status
  AlertTriangle,
  Info,
  AlertCircle,
  HelpCircle,
  Shield,
  Zap,
  
  // Actions & Controls
  Save,
  X,
  Check,
  Link,
  Pin,
  Star,
  
  // Navigation
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Menu,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  
  // Estate Planning (Future)
  ScrollText,
  Heart,
  Briefcase,
  Gem,
  UserCheck,
  Scale,
  
  // AI & Automation
  Bot,
  Brain,
  ScanSearch,
  LineChart,
} from 'lucide-react';
```

---

## 🎨 Icon Sizing Standards

```tsx
// Small (16px) - Inline text, form labels
<Icon className="w-4 h-4" />

// Medium (24px) - Buttons, cards, navigation
<Icon className="w-6 h-6" />

// Large (32px) - Page headers, emphasis
<Icon className="w-8 h-8" />

// Extra Large (64px) - Empty states
<Icon className="w-16 h-16" />
```

---

## 🎨 Icon Color Standards

```tsx
// Default (neutral)
<Icon className="text-slate-600" />

// Primary (brand)
<Icon className="text-sky-600" />

// Success
<Icon className="text-green-600" />

// Warning
<Icon className="text-yellow-600" />

// Error
<Icon className="text-red-600" />

// Info
<Icon className="text-blue-600" />

// Inherit from parent
<Icon className="text-current" />
```

---

## 📊 Icon Usage Statistics

| Category | Total Icons | Have | Need | Priority |
|----------|-------------|------|------|----------|
| Business & Entity | 9 | 2 | 7 | HIGH |
| Documents & Filings | 12 | 1 | 11 | HIGH |
| Payment & Orders | 9 | 0 | 9 | HIGH |
| User & Account | 10 | 0 | 10 | MEDIUM |
| Dashboard & Analytics | 9 | 1 | 8 | MEDIUM |
| Alerts & Status | 9 | 3 | 6 | HIGH |
| Actions & Controls | 12 | 1 | 11 | MEDIUM |
| Navigation | 10 | 2 | 8 | HIGH |
| Estate Planning | 8 | 0 | 8 | LOW (Future) |
| AI & Automation | 6 | 0 | 6 | MEDIUM |
| **TOTAL** | **94** | **10** | **84** | - |

**Current Coverage:** 10.6% (10/94 icons)  
**Needed for 2-Week Sprint:** ~30 icons (Business, Documents, Payment, Alerts, Navigation)

---

## 🚀 Quick Start Guide

### **1. Import Icons You Need**
```tsx
import { Building2, FileText, CreditCard } from 'lucide-react';
```

### **2. Use in Components**
```tsx
<Building2 className="w-6 h-6 text-sky-600" />
```

### **3. With Icon Wrapper (Recommended)**
```tsx
import { Icon } from '@/components/legalops/icons/Icon';
import { Building2 } from 'lucide-react';

<Icon icon={Building2} size="md" variant="primary" />
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-19  
**Total Icons Cataloged:** 94

