'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, FileText, RefreshCw, XCircle, Award, Grid3x3 } from 'lucide-react';
import { ServiceCard } from '@/components/legalops/cards/ServiceCard';
import { EmptyState } from '@/components/legalops/layout/EmptyState';
import { LiquidGlassIcon, IconCategory } from '@/components/legalops/icons/LiquidGlassIcon';
import { cn } from '@/components/legalops/theme';

interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  totalPrice: number;
  serviceFee: number;
  stateFee: number;
  icon: string;
  isPopular: boolean;
  isFeatured: boolean;
  processingTime: string;
  category: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Read category from URL parameter on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch services from API
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const data = await response.json();

        // Handle error responses
        if (Array.isArray(data)) {
          // Convert Decimal strings to numbers
          const services = data.map((service: any) => ({
            ...service,
            totalPrice: typeof service.totalPrice === 'string' ? parseFloat(service.totalPrice) : service.totalPrice,
            serviceFee: typeof service.serviceFee === 'string' ? parseFloat(service.serviceFee) : service.serviceFee,
            stateFee: typeof service.stateFee === 'string' ? parseFloat(service.stateFee) : service.stateFee,
          }));
          setServices(services);
        } else if (data.error) {
          console.error('API Error:', data.error);
          setServices([]);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categories = [
    { value: 'all', label: 'All Services', icon: Grid3x3, category: 'estate' as IconCategory },
    { value: 'FORMATION', label: 'Formation', icon: Building2, category: 'business' as IconCategory },
    { value: 'ANNUAL_COMPLIANCE', label: 'Annual Compliance', icon: RefreshCw, category: 'success' as IconCategory },
    { value: 'AMENDMENTS', label: 'Amendments', icon: FileText, category: 'warning' as IconCategory },
    { value: 'DISSOLUTION', label: 'Dissolution', icon: XCircle, category: 'payment' as IconCategory },
    { value: 'CERTIFICATES', label: 'Certificates', icon: Award, category: 'documents' as IconCategory },
  ];

  const filteredServices = Array.isArray(services)
    ? (selectedCategory === 'all'
        ? services
        : services.filter(s => s.category === selectedCategory))
    : [];

  const featuredServices = Array.isArray(filteredServices) ? filteredServices.filter(s => s.isFeatured) : [];
  const otherServices = Array.isArray(filteredServices) ? filteredServices.filter(s => !s.isFeatured) : [];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      FORMATION: <Building2 className="w-6 h-6" />,
      ANNUAL_COMPLIANCE: <RefreshCw className="w-6 h-6" />,
      AMENDMENTS: <FileText className="w-6 h-6" />,
      DISSOLUTION: <XCircle className="w-6 h-6" />,
      CERTIFICATES: <Award className="w-6 h-6" />,
    };
    return icons[category] || <Building2 className="w-6 h-6" />;
  };

  const getCategoryColor = (category: string): 'sky' | 'green' | 'amber' | 'purple' => {
    const colors: Record<string, 'sky' | 'green' | 'amber' | 'purple'> = {
      FORMATION: 'sky',
      ANNUAL_COMPLIANCE: 'green',
      AMENDMENTS: 'amber',
      DISSOLUTION: 'purple',
      CERTIFICATES: 'green',
    };
    return colors[category] || 'sky';
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)' }}>
      {/* Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <h1 className="font-semibold tracking-tight" style={{ fontSize: '48px', color: '#0f172a', marginBottom: '16px' }}>
            Florida Business Services
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '768px', margin: '0 auto' }}>
            Choose the service you need to get your business started or maintained
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Category Filter - Liquid Glass Style */}
        <div style={{ marginBottom: '64px' }}>
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => {
              // Define color schemes for each category
              const colorSchemes: Record<string, { border: string; bg: string; shadow: string }> = {
                all: { border: 'border-slate-300', bg: 'bg-gradient-to-br from-slate-50 to-slate-100', shadow: 'shadow-slate-200/50' },
                FORMATION: { border: 'border-sky-300', bg: 'bg-gradient-to-br from-sky-50 to-sky-100', shadow: 'shadow-sky-200/50' },
                ANNUAL_COMPLIANCE: { border: 'border-emerald-300', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', shadow: 'shadow-emerald-200/50' },
                AMENDMENTS: { border: 'border-amber-300', bg: 'bg-gradient-to-br from-amber-50 to-amber-100', shadow: 'shadow-amber-200/50' },
                DISSOLUTION: { border: 'border-purple-300', bg: 'bg-gradient-to-br from-purple-50 to-purple-100', shadow: 'shadow-purple-200/50' },
                CERTIFICATES: { border: 'border-green-300', bg: 'bg-gradient-to-br from-green-50 to-green-100', shadow: 'shadow-green-200/50' },
              };

              const colors = colorSchemes[cat.value] || colorSchemes.all;

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    'inline-flex items-center gap-3 rounded-xl font-medium transition-all duration-200 pl-4 pr-8 py-3',
                    selectedCategory === cat.value
                      ? `${colors.bg} shadow-lg border-2 ${colors.border} ${colors.shadow} scale-105`
                      : 'bg-white/60 border border-slate-200 hover:bg-white hover:shadow-md hover:scale-102'
                  )}
                >
                  <LiquidGlassIcon
                    icon={cat.icon}
                    category={cat.category}
                    size="sm"
                  />
                  <span className={cn(
                    'text-sm mr-4',
                    selectedCategory === cat.value
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600'
                  )}>
                    {cat.label}
                  </span>
                  <span className="w-2"></span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ServiceCard key={i} title="" description="" price={0} loading={true} />
            ))}
          </div>
        ) : (
          <>
            {/* Featured Services Section */}
            {featuredServices.length > 0 && (
              <div style={{ marginBottom: '96px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 className="text-3xl font-semibold text-slate-900 mb-2">Featured Services</h2>
                  <p className="text-slate-600">Our most popular services to get you started</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredServices.map(service => (
                    <ServiceCard
                      key={service.id}
                      title={service.name}
                      description={service.shortDescription}
                      price={service.totalPrice}
                      icon={<span className="text-4xl">{service.icon}</span>}
                      accentColor={getCategoryColor(service.category)}
                      badge={service.isPopular ? 'Popular' : undefined}
                      onClick={() => router.push(`/services/${service.slug}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Services Section */}
            {otherServices.length > 0 && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h2 className="text-3xl font-semibold text-slate-900 mb-2">
                    {featuredServices.length > 0 ? 'Other Services' : 'Available Services'}
                  </h2>
                  <p className="text-slate-600">Additional filing and compliance services</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherServices.map(service => (
                    <ServiceCard
                      key={service.id}
                      title={service.name}
                      description={service.shortDescription}
                      price={service.totalPrice}
                      icon={getCategoryIcon(service.category)}
                      accentColor={getCategoryColor(service.category)}
                      badge={service.isPopular ? 'Popular' : undefined}
                      onClick={() => router.push(`/services/${service.slug}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredServices.length === 0 && (
              <EmptyState
                icon={Building2}
                title="No services found"
                description="Try selecting a different category to see available services."
                action={{
                  label: 'View All Services',
                  onClick: () => setSelectedCategory('all'),
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

