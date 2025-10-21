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
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email not sent.');
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
    console.error('Failed to send email:', error);
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

