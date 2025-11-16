/**
 * Admin Order Detail Page
 * Displays detailed information about a specific order
 */

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { 
  ShoppingCart, 
  Calendar, 
  DollarSign, 
  User,
  Mail,
  Phone,
  CreditCard,
  Package,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      package: true,
      orderItems: true,
      riskAssessment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Back Button */}
      <Link
        href="/admin/orders"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6366F1',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <ShoppingCart size={32} style={{ color: '#6366F1' }} />
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1E293B',
            margin: 0,
          }}>
            Order {order.orderNumber}
          </h1>
        </div>
        <div style={{ marginLeft: '44px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            background: 
              order.orderStatus === 'COMPLETED' ? '#DCFCE7' :
              order.orderStatus === 'PROCESSING' ? '#DBEAFE' :
              order.orderStatus === 'PENDING' ? '#FEF3C7' :
              order.orderStatus === 'PAID' ? '#D1FAE5' :
              '#FEE2E2',
            color: 
              order.orderStatus === 'COMPLETED' ? '#16A34A' :
              order.orderStatus === 'PROCESSING' ? '#2563EB' :
              order.orderStatus === 'PENDING' ? '#F59E0B' :
              order.orderStatus === 'PAID' ? '#059669' :
              '#DC2626',
          }}>
            {order.orderStatus}
          </span>
          <span style={{
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            background: 
              order.paymentStatus === 'PAID' ? '#DCFCE7' :
              order.paymentStatus === 'PENDING' ? '#FEF3C7' :
              '#FEE2E2',
            color: 
              order.paymentStatus === 'PAID' ? '#16A34A' :
              order.paymentStatus === 'PENDING' ? '#F59E0B' :
              '#DC2626',
          }}>
            Payment: {order.paymentStatus}
          </span>
          {order.requiresReview && (
            <span style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <AlertTriangle size={14} />
              Requires Review
            </span>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Customer Information */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1E293B',
            marginBottom: '20px',
          }}>
            Customer Information
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {order.isGuestOrder ? (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                    Customer Type
                  </div>
                  <span style={{
                    fontSize: '13px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: '#F1F5F9',
                    color: '#64748B',
                  }}>
                    Guest Order
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                    Name
                  </div>
                  <div style={{ fontSize: '15px', color: '#1E293B' }}>
                    {order.guestFirstName} {order.guestLastName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                    Email
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} style={{ color: '#64748B' }} />
                    <a 
                      href={`mailto:${order.guestEmail}`}
                      style={{ fontSize: '15px', color: '#6366F1', textDecoration: 'none' }}
                    >
                      {order.guestEmail}
                    </a>
                  </div>
                </div>
                {order.guestPhone && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                      Phone
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} style={{ color: '#64748B' }} />
                      <a 
                        href={`tel:${order.guestPhone}`}
                        style={{ fontSize: '15px', color: '#6366F1', textDecoration: 'none' }}
                      >
                        {order.guestPhone}
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : order.user ? (
              <>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                    Name
                  </div>
                  <div style={{ fontSize: '15px', color: '#1E293B' }}>
                    {order.user.firstName} {order.user.lastName}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                    Email
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} style={{ color: '#64748B' }} />
                    <a 
                      href={`mailto:${order.user.email}`}
                      style={{ fontSize: '15px', color: '#6366F1', textDecoration: 'none' }}
                    >
                      {order.user.email}
                    </a>
                  </div>
                </div>
                {order.user.phone && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                      Phone
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} style={{ color: '#64748B' }} />
                      <a 
                        href={`tel:${order.user.phone}`}
                        style={{ fontSize: '15px', color: '#6366F1', textDecoration: 'none' }}
                      >
                        {order.user.phone}
                      </a>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '8px' }}>
                  <Link
                    href={`/admin/customers/${order.userId}`}
                    style={{
                      padding: '10px 20px',
                      background: '#6366F1',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    View Customer Profile
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ color: '#94A3B8' }}>No customer information available</div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1E293B',
            marginBottom: '20px',
          }}>
            Order Details
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Order Number
              </div>
              <div style={{ fontSize: '15px', color: '#1E293B', fontFamily: 'monospace', fontWeight: '600' }}>
                {order.orderNumber}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                Order Date
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: '#64748B' }} />
                <span style={{ fontSize: '15px', color: '#1E293B' }}>
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {order.paidAt && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Paid At
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} style={{ color: '#64748B' }} />
                  <span style={{ fontSize: '15px', color: '#1E293B' }}>
                    {new Date(order.paidAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {order.completedAt && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Completed At
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} style={{ color: '#64748B' }} />
                  <span style={{ fontSize: '15px', color: '#1E293B' }}>
                    {new Date(order.completedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {order.paymentMethod && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Payment Method
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} style={{ color: '#64748B' }} />
                  <span style={{ fontSize: '15px', color: '#1E293B' }}>
                    {order.paymentMethod}
                  </span>
                </div>
              </div>
            )}

            {order.package && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Package
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={16} style={{ color: '#64748B' }} />
                  <span style={{ fontSize: '15px', color: '#1E293B' }}>
                    {order.package.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px',
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#1E293B',
          marginBottom: '20px',
        }}>
          Order Items
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {order.orderItems.map((item) => (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#F8FAFC',
                borderRadius: '8px',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#1E293B' }}>
                  {item.serviceType.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                  {item.description}
                </div>
                {item.quantity > 1 && (
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    Quantity: {item.quantity}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
                  ${Number(item.totalPrice).toFixed(2)}
                </div>
                {item.quantity > 1 && (
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    ${Number(item.unitPrice).toFixed(2)} each
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', color: '#64748B' }}>Subtotal</span>
            <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: '500' }}>
              ${Number(order.subtotal).toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '15px', color: '#64748B' }}>Tax</span>
            <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: '500' }}>
              ${Number(order.tax).toFixed(2)}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingTop: '12px',
            borderTop: '2px solid #E2E8F0',
          }}>
            <span style={{ fontSize: '18px', color: '#1E293B', fontWeight: '600' }}>Total</span>
            <span style={{ fontSize: '18px', color: '#1E293B', fontWeight: '700' }}>
              ${Number(order.total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Form Data Section */}
      {(() => {
        // Find the order item with additionalData (usually the service fee item)
        const itemWithData = order.orderItems.find(item => item.additionalData);
        const formData = itemWithData?.additionalData as Record<string, unknown>;

        if (!formData) {
          return (
            <div style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1E293B',
                marginBottom: '20px',
              }}>
                Form Data
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B' }}>
                No form data available for this order (created before form data storage was implemented)
              </p>
            </div>
          );
        }

        return (
          <div style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1E293B',
              marginBottom: '20px',
            }}>
              Form Data
            </h2>

            {/* Fictitious Name Information */}
            {formData.fictitiousName && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Fictitious Name Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                      Fictitious Name
                    </div>
                    <div style={{ fontSize: '15px', color: '#1E293B' }}>
                      {formData.fictitiousName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                      Principal County
                    </div>
                    <div style={{ fontSize: '15px', color: '#1E293B' }}>
                      {formData.principalCounty}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mailing Address */}
            {formData.mailingAddress && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mailing Address
                </h3>
                <div style={{ fontSize: '15px', color: '#1E293B', lineHeight: '1.6' }}>
                  {formData.mailingAddress.street}<br />
                  {formData.mailingAddress.city}, {formData.mailingAddress.state} {formData.mailingAddress.zipCode}
                </div>
              </div>
            )}

            {/* Individual Owners */}
            {formData.individualOwners && formData.individualOwners.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Individual Owners
                </h3>
                {formData.individualOwners.map((owner, index: number) => (
                  <div key={index} style={{ marginBottom: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>
                      {owner.firstName} {owner.middleName} {owner.lastName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>
                      {owner.address.street}<br />
                      {owner.address.city}, {owner.address.state} {owner.address.zipCode}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Business Entity Owners */}
            {formData.businessEntityOwners && formData.businessEntityOwners.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Business Entity Owners
                </h3>
                {formData.businessEntityOwners.map((owner, index: number) => (
                  <div key={index} style={{ marginBottom: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B', marginBottom: '8px' }}>
                      {owner.entityName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>
                      FEI/EIN: {owner.fein}<br />
                      {owner.address.street}<br />
                      {owner.address.city}, {owner.address.state} {owner.address.zipCode}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Newspaper Advertisement */}
            {formData.newspaperAdvertised && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Newspaper Advertisement
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                      Newspaper Name
                    </div>
                    <div style={{ fontSize: '15px', color: '#1E293B' }}>
                      {formData.newspaperName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                      Advertisement Date
                    </div>
                    <div style={{ fontSize: '15px', color: '#1E293B' }}>
                      {formData.advertisementDate}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Services */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Additional Services
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                    Certified Copy
                  </div>
                  <div style={{ fontSize: '15px', color: '#1E293B' }}>
                    {formData.certifiedCopy ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                    Certificate of Status
                  </div>
                  <div style={{ fontSize: '15px', color: '#1E293B' }}>
                    {formData.certificateOfStatus ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                    Has FEIN
                  </div>
                  <div style={{ fontSize: '15px', color: '#1E293B' }}>
                    {formData.hasFEIN ? `Yes (${formData.fein})` : 'No'}
                  </div>
                </div>
              </div>
            </div>

            {/* Correspondence Email */}
            {formData.correspondenceEmail && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Correspondence Email
                </h3>
                <div style={{ fontSize: '15px', color: '#1E293B' }}>
                  {formData.correspondenceEmail}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Risk Assessment */}
      {(order.riskScore !== null || order.riskAssessment) && (
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1E293B',
            marginBottom: '20px',
          }}>
            Risk Assessment
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {order.riskScore !== null && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Risk Score
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1E293B' }}>
                  {order.riskScore}/100
                </div>
              </div>
            )}

            {order.riskLevel && (
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', fontWeight: '500' }}>
                  Risk Level
                </div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: 
                    order.riskLevel === 'LOW' ? '#DCFCE7' :
                    order.riskLevel === 'MEDIUM' ? '#FEF3C7' :
                    '#FEE2E2',
                  color: 
                    order.riskLevel === 'LOW' ? '#16A34A' :
                    order.riskLevel === 'MEDIUM' ? '#F59E0B' :
                    '#DC2626',
                }}>
                  {order.riskLevel}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

