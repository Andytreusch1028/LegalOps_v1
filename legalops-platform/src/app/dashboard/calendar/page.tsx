import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-semibold" style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px' }}>
          Compliance Calendar
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b' }}>
          Never miss a deadline with smart reminders
        </p>
      </div>

      {/* Coming Soon Card */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: '#f0fdf4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}
        >
          <Calendar size={40} color="#10b981" />
        </div>

        <h2 className="font-semibold" style={{ fontSize: '24px', color: '#0f172a', marginBottom: '12px' }}>
          Compliance Calendar Coming Soon
        </h2>

        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
          Your compliance calendar will automatically track all important deadlines including
          annual reports, tax filings, and license renewals - with smart reminders before they're due.
        </p>

        {/* Features Preview */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: '24px', maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}
        >
          <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
            <p className="font-semibold" style={{ fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>
              📅 Auto-Populated Deadlines
            </p>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              State-specific deadlines added automatically for each business
            </p>
          </div>

          <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
            <p className="font-semibold" style={{ fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>
              🔔 Smart Reminders
            </p>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Email and SMS reminders 30, 14, and 7 days before deadlines
            </p>
          </div>

          <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
            <p className="font-semibold" style={{ fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>
              🤖 AI Deadline Detection
            </p>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              AI extracts deadlines from registered agent mail automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

