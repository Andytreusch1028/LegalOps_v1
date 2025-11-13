import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@legalops.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.startsWith('SG.test_')) {
      console.warn('⚠️  SendGrid API key not configured or using test key. Email not sent.');
      console.warn(`   Would have sent email to: ${options.to}`);
      console.warn(`   Subject: ${options.subject}`);
      return false;
    }

    await sgMail.send({
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`✅ Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    console.error(`   To: ${options.to}`);
    console.error(`   Subject: ${options.subject}`);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  amount: number,
  serviceName: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .order-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! 🎉</h1>
            <p>Thank you for your order</p>
          </div>

          <div class="content">
            <p>Hi there,</p>
            <p>Your order has been successfully received and payment has been processed. Here are your order details:</p>

            <div class="order-details">
              <div class="detail-row">
                <strong>Order Number:</strong>
                <span>${orderNumber}</span>
              </div>
              <div class="detail-row">
                <strong>Service:</strong>
                <span>${serviceName}</span>
              </div>
              <div class="detail-row">
                <strong>Amount Paid:</strong>
                <span>$${amount.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <strong>Date:</strong>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <h3>What's Next?</h3>
            <ol>
              <li>We'll review your filing information</li>
              <li>Our team will prepare your documents</li>
              <li>We'll file with the Florida Department of State</li>
              <li>You'll receive updates via email</li>
            </ol>

            <p>You can track your order status anytime by logging into your dashboard.</p>

            <a href="${process.env.NEXTAUTH_URL}/dashboard/orders/${orderNumber}" class="button">View Order</a>
          </div>

          <div class="footer">
            <p>LegalOps - Florida Business Formation Services</p>
            <p>Questions? Contact us at support@legalops.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed - ${orderNumber}`,
    html,
  });
}

export async function sendOrderDeclinedEmail(
  email: string,
  orderNumber: string,
  reason: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #fee2e2; color: #991b1b; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Review Required</h1>
          </div>

          <div class="content">
            <p>Hi there,</p>
            <p>We were unable to process your order at this time. This is a standard security measure to protect both you and our business.</p>

            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Reason:</strong> ${reason}</p>

            <p><strong>Important:</strong> No charges have been made to your payment method.</p>

            <p>If you believe this is an error or would like to discuss your order, please contact our support team:</p>
            <ul>
              <li>Email: support@legalops.com</li>
              <li>Phone: 1-800-555-0123</li>
            </ul>

            <p>We apologize for any inconvenience.</p>
          </div>

          <div class="footer">
            <p>LegalOps - Florida Business Formation Services</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Order Review Required - ${orderNumber}`,
    html,
  });
}

export async function sendPublicationCertificationEmail(
  email: string,
  fictitiousName: string,
  newspaperName: string,
  publicationDate: string,
  certificationDate: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
          .certification-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10B981; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .warning-box { background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 6px; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Publication Certification Confirmed</h1>
          </div>

          <div class="content">
            <p>Hi there,</p>
            <p>This email confirms that you have certified newspaper publication for your DBA filing. This is an important legal requirement for your fictitious name registration in Florida.</p>

            <div class="certification-details">
              <h3 style="margin-top: 0; color: #065F46;">Certification Details</h3>
              <div class="detail-row">
                <strong>Fictitious Name:</strong>
                <span>${fictitiousName}</span>
              </div>
              <div class="detail-row">
                <strong>Newspaper Name:</strong>
                <span>${newspaperName}</span>
              </div>
              <div class="detail-row">
                <strong>Publication Date:</strong>
                <span>${new Date(publicationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <strong>Certification Date:</strong>
                <span>${certificationDate}</span>
              </div>
            </div>

            <div class="warning-box">
              <strong style="color: #92400E;">⚠️ Important Legal Notice</strong>
              <p style="margin: 8px 0 0 0; color: #78350F; font-size: 14px;">
                This certification is a legal statement that you have published the required notice in a newspaper of general circulation.
                False certification may result in rejection of your filing and potential penalties under Florida law.
              </p>
            </div>

            <h3>What's Next?</h3>
            <ol>
              <li>Complete your payment to submit your DBA filing</li>
              <li>We'll review your information and publication certification</li>
              <li>We'll file your DBA with the Florida Department of State</li>
              <li>You'll receive your official registration confirmation</li>
            </ol>

            <p><strong>Keep this email for your records.</strong> It serves as proof of your certification and the details you provided.</p>

            <p>If you did not make this certification or believe this is an error, please contact us immediately.</p>
          </div>

          <div class="footer">
            <p>LegalOps - Florida Business Formation Services</p>
            <p>Questions? Contact us at support@legalops.com</p>
            <p style="margin-top: 10px; font-size: 11px; color: #9CA3AF;">
              This is an automated confirmation email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Publication Certification Confirmed - ${fictitiousName}`,
    html,
  });
}

