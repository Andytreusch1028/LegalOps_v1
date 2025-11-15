'use client';

import { LiquidGlassIcon, IconCategory } from '@/components/legalops/icons/LiquidGlassIcon';
import {
  Building2,
  FileText,
  CreditCard,
  User,
  BarChart3,
  Bot,
  ScrollText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Upload,
  Download,
  Edit,
  Trash2,
  Plus,
  Search,
  Settings,
  Bell,
  Mail,
  Phone,
  Home,
  TrendingUp,
  Calendar,
  ShoppingCart,
  DollarSign,
  Heart,
  Briefcase,
  Brain,
  Zap,
} from 'lucide-react';

export default function IconShowcasePage() {
  const categories: { name: string; category: IconCategory; description: string; icons: React.ComponentType[] }[] = [
    {
      name: 'Business & Entity',
      category: 'business',
      description: 'LLC formation, business management, corporate filings',
      icons: [Building2, Edit, Plus, Trash2, Search, Home],
    },
    {
      name: 'Documents & Filings',
      category: 'documents',
      description: 'Annual reports, document uploads, filing submissions',
      icons: [FileText, Upload, Download, CheckCircle, XCircle],
    },
    {
      name: 'Payment & Orders',
      category: 'payment',
      description: 'Checkout, payment methods, order history',
      icons: [CreditCard, DollarSign, ShoppingCart],
    },
    {
      name: 'User & Account',
      category: 'user',
      description: 'Profile, account settings, notifications',
      icons: [User, Settings, Bell, Mail, Phone],
    },
    {
      name: 'Dashboard & Analytics',
      category: 'analytics',
      description: 'Analytics, reports, statistics',
      icons: [BarChart3, TrendingUp, Calendar],
    },
    {
      name: 'AI & Automation',
      category: 'ai',
      description: 'AI risk scoring, smart suggestions, automation',
      icons: [Bot, Brain, Zap],
    },
    {
      name: 'Estate Planning',
      category: 'estate',
      description: 'Wills, trusts, estate documents (future)',
      icons: [ScrollText, Heart, Briefcase],
    },
  ];

  const statusIcons: { name: string; category: IconCategory; icon: React.ComponentType }[] = [
    { name: 'Success', category: 'success', icon: CheckCircle },
    { name: 'Warning', category: 'warning', icon: AlertTriangle },
    { name: 'Error', category: 'error', icon: XCircle },
    { name: 'Info', category: 'info', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💎 Liquid Glass Icon System
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Apple-inspired icon design with category-based gradients and glass effects
          </p>
          <p className="text-sm text-gray-500">
            Inspired by Apple's Liquid Glass design language (iOS 26, macOS Tahoe 26)
          </p>
        </div>

        {/* Size Examples */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Size Variations</h2>
          <div className="flex items-end gap-8">
            <div className="text-center">
              <LiquidGlassIcon icon={Building2} category="business" size="sm" />
              <p className="text-xs text-gray-600 mt-2">Small (24px)</p>
            </div>
            <div className="text-center">
              <LiquidGlassIcon icon={Building2} category="business" size="md" />
              <p className="text-xs text-gray-600 mt-2">Medium (32px)</p>
            </div>
            <div className="text-center">
              <LiquidGlassIcon icon={Building2} category="business" size="lg" />
              <p className="text-xs text-gray-600 mt-2">Large (48px)</p>
            </div>
            <div className="text-center">
              <LiquidGlassIcon icon={Building2} category="business" size="xl" />
              <p className="text-xs text-gray-600 mt-2">Extra Large (64px)</p>
            </div>
          </div>
        </div>

        {/* Category Sections */}
        {categories.map((cat) => (
          <div key={cat.category} className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <LiquidGlassIcon icon={cat.icons[0]} category={cat.category} size="lg" />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{cat.name}</h2>
                  <p className="text-sm text-gray-600">{cat.description}</p>
                </div>
              </div>
            </div>

            {/* Icons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {cat.icons.map((IconComponent, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <LiquidGlassIcon 
                    icon={IconComponent} 
                    category={cat.category} 
                    size="lg"
                    onClick={() => console.log(`${cat.name} icon clicked`)}
                  />
                  <p className="text-xs text-gray-600 text-center">
                    {IconComponent.displayName || IconComponent.name || 'Icon'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Status Icons */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Status Icons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statusIcons.map((status) => (
              <div key={status.category} className="flex flex-col items-center gap-3">
                <LiquidGlassIcon 
                  icon={status.icon} 
                  category={status.category} 
                  size="lg"
                />
                <p className="text-sm font-medium text-gray-900">{status.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive States */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Interactive States</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <LiquidGlassIcon 
                icon={Building2} 
                category="business" 
                size="lg"
              />
              <p className="text-xs text-gray-600 mt-2">Default</p>
            </div>
            <div className="text-center">
              <LiquidGlassIcon 
                icon={Building2} 
                category="business" 
                size="lg"
                onClick={() => alert('Clicked!')}
              />
              <p className="text-xs text-gray-600 mt-2">Clickable (hover me)</p>
            </div>
            <div className="text-center">
              <LiquidGlassIcon 
                icon={Building2} 
                category="business" 
                size="lg"
                disabled
              />
              <p className="text-xs text-gray-600 mt-2">Disabled</p>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Usage Examples</h2>
          
          {/* Service Card Example */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Card</h3>
            <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <div className="flex items-start gap-4">
                <LiquidGlassIcon icon={Building2} category="business" size="lg" />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">LLC Formation</h4>
                  <p className="text-gray-600 mb-4">
                    Professional LLC formation service for Florida businesses
                  </p>
                  <div className="text-2xl font-bold text-gray-900">$299.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge Example */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Badges</h3>
            <div className="flex flex-wrap gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border-2 border-gray-200">
                <LiquidGlassIcon icon={CheckCircle} category="success" size="sm" />
                <span className="text-sm font-medium text-gray-900">Approved</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border-2 border-gray-200">
                <LiquidGlassIcon icon={AlertTriangle} category="warning" size="sm" />
                <span className="text-sm font-medium text-gray-900">Pending Review</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border-2 border-gray-200">
                <LiquidGlassIcon icon={XCircle} category="error" size="sm" />
                <span className="text-sm font-medium text-gray-900">Rejected</span>
              </div>
            </div>
          </div>

          {/* Navigation Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Items</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:bg-gray-100 transition-colors">
                <LiquidGlassIcon icon={Home} category="business" size="md" />
                <span className="text-sm font-medium text-gray-900">Dashboard</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:bg-gray-100 transition-colors">
                <LiquidGlassIcon icon={FileText} category="documents" size="md" />
                <span className="text-sm font-medium text-gray-900">Documents</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:bg-gray-100 transition-colors">
                <LiquidGlassIcon icon={User} category="user" size="md" />
                <span className="text-sm font-medium text-gray-900">Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-gray-900 rounded-lg shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Code Example</h2>
          <pre className="text-sm text-green-400 overflow-x-auto">
{`import { LiquidGlassIcon } from '@/components/legalops/icons/LiquidGlassIcon';
import { Building2 } from 'lucide-react';

// Business entity icon
<LiquidGlassIcon 
  icon={Building2} 
  category="business" 
  size="lg" 
/>

// Interactive button
<LiquidGlassIcon 
  icon={Settings} 
  category="user" 
  size="md"
  onClick={() => console.log('Clicked!')}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}

