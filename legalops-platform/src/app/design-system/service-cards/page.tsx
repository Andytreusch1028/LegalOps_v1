'use client';

import { ServiceCard } from '@/components/legalops/cards/ServiceCard';
import {
  Building2,
  FileText,
  CreditCard,
  User,
  BarChart3,
  Bot,
  ScrollText,
  Calendar,
  Shield,
  Briefcase,
} from 'lucide-react';

export default function ServiceCardsShowcasePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💎 Service Cards with Liquid Glass Icons
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Updated ServiceCard component with category-based Liquid Glass icons
          </p>
          <p className="text-sm text-gray-500">
            Each service category has its own unique gradient color
          </p>
        </div>

        {/* Business Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Business & Entity Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="LLC Formation"
              description="Professional LLC formation service for Florida businesses with complete filing support"
              price={299.00}
              icon={Building2}
              category="business"
              badge="Popular"
              onClick={() => console.log('LLC Formation clicked')}
            />
            <ServiceCard
              title="Corporation Formation"
              description="Form a Florida corporation with expert guidance and comprehensive documentation"
              price={349.00}
              icon={Building2}
              category="business"
              onClick={() => console.log('Corporation clicked')}
            />
            <ServiceCard
              title="Business Name Search"
              description="Comprehensive business name availability search across all Florida databases"
              price={49.00}
              icon={Building2}
              category="business"
              onClick={() => console.log('Name Search clicked')}
            />
          </div>
        </div>

        {/* Document Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Document & Filing Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="Annual Report"
              description="Florida annual report filing with automated deadline tracking and reminders"
              price={149.00}
              icon={FileText}
              category="documents"
              badge="Required"
              onClick={() => console.log('Annual Report clicked')}
            />
            <ServiceCard
              title="Registered Agent Service"
              description="Professional registered agent service with secure document handling"
              price={99.00}
              icon={FileText}
              category="documents"
              onClick={() => console.log('Registered Agent clicked')}
            />
            <ServiceCard
              title="Document Amendment"
              description="Amend your articles of organization or incorporation with state filing"
              price={199.00}
              icon={FileText}
              category="documents"
              onClick={() => console.log('Amendment clicked')}
            />
          </div>
        </div>

        {/* Payment & Subscription Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment & Subscription Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="Premium Subscription"
              description="Unlimited filings, priority support, and advanced analytics dashboard"
              price={499.00}
              icon={CreditCard}
              category="payment"
              badge="Best Value"
              onClick={() => console.log('Premium clicked')}
            />
            <ServiceCard
              title="Business Bundle"
              description="LLC formation + annual report + registered agent service package"
              price={449.00}
              icon={CreditCard}
              category="payment"
              onClick={() => console.log('Bundle clicked')}
            />
            <ServiceCard
              title="Rush Processing"
              description="Expedited filing service with 24-hour processing guarantee"
              price={99.00}
              icon={CreditCard}
              category="payment"
              onClick={() => console.log('Rush clicked')}
            />
          </div>
        </div>

        {/* User & Account Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">User & Account Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="Account Management"
              description="Manage multiple businesses, users, and permissions from one dashboard"
              price={0.00}
              icon={User}
              category="user"
              badge="Free"
              onClick={() => console.log('Account clicked')}
            />
            <ServiceCard
              title="Team Collaboration"
              description="Add team members with role-based access and collaboration tools"
              price={29.00}
              icon={User}
              category="user"
              onClick={() => console.log('Team clicked')}
            />
            <ServiceCard
              title="Notification Preferences"
              description="Customize email, SMS, and dashboard notifications for all your businesses"
              price={0.00}
              icon={User}
              category="user"
              badge="Free"
              onClick={() => console.log('Notifications clicked')}
            />
          </div>
        </div>

        {/* Analytics & Reporting Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Analytics & Reporting Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="Business Analytics"
              description="Comprehensive analytics dashboard with filing history and compliance tracking"
              price={79.00}
              icon={BarChart3}
              category="analytics"
              onClick={() => console.log('Analytics clicked')}
            />
            <ServiceCard
              title="Compliance Calendar"
              description="Automated deadline tracking with smart reminders and filing suggestions"
              price={49.00}
              icon={Calendar}
              category="analytics"
              badge="New"
              onClick={() => console.log('Calendar clicked')}
            />
            <ServiceCard
              title="Custom Reports"
              description="Generate custom reports for multiple businesses with export capabilities"
              price={99.00}
              icon={BarChart3}
              category="analytics"
              onClick={() => console.log('Reports clicked')}
            />
          </div>
        </div>

        {/* AI & Automation Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">AI & Automation Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="AI Document Review"
              description="Automated document review with AI-powered error detection and suggestions"
              price={149.00}
              icon={Bot}
              category="ai"
              badge="AI Powered"
              onClick={() => console.log('AI Review clicked')}
            />
            <ServiceCard
              title="Smart Filing Assistant"
              description="AI assistant that guides you through complex filings with intelligent help"
              price={99.00}
              icon={Bot}
              category="ai"
              onClick={() => console.log('Assistant clicked')}
            />
            <ServiceCard
              title="Automated Compliance"
              description="AI-powered compliance monitoring with automatic filing recommendations"
              price={199.00}
              icon={Bot}
              category="ai"
              onClick={() => console.log('Compliance clicked')}
            />
          </div>
        </div>

        {/* Estate Planning Services (Future) */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Estate Planning Services (Coming Soon)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="Last Will & Testament"
              description="Comprehensive will preparation with legal review and state-specific requirements"
              price={299.00}
              icon={ScrollText}
              category="estate"
              badge="Coming Soon"
              onClick={() => console.log('Will clicked')}
            />
            <ServiceCard
              title="Living Trust"
              description="Revocable living trust creation with asset transfer guidance and documentation"
              price={499.00}
              icon={Briefcase}
              category="estate"
              onClick={() => console.log('Trust clicked')}
            />
            <ServiceCard
              title="Healthcare Directive"
              description="Healthcare power of attorney and living will with HIPAA authorization"
              price={149.00}
              icon={Shield}
              category="estate"
              onClick={() => console.log('Healthcare clicked')}
            />
          </div>
        </div>

        {/* Backwards Compatibility Test */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Backwards Compatibility (Legacy accentColor)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="Legacy Sky Blue"
              description="Using accentColor='sky' (maps to business category)"
              price={99.00}
              accentColor="sky"
              onClick={() => console.log('Legacy sky clicked')}
            />
            <ServiceCard
              title="Legacy Green"
              description="Using accentColor='green' (maps to documents category)"
              price={99.00}
              accentColor="green"
              onClick={() => console.log('Legacy green clicked')}
            />
            <ServiceCard
              title="Legacy Purple"
              description="Using accentColor='purple' (maps to payment category)"
              price={99.00}
              accentColor="purple"
              onClick={() => console.log('Legacy purple clicked')}
            />
          </div>
        </div>

        {/* Loading State */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Loading State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="Loading..."
              description="Loading..."
              price={0}
              loading={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

