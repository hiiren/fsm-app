/**
 * Email Integration Service
 * 
 * This module handles email notifications for:
 * - Admin reports (daily/weekly summaries)
 * - Task assignments
 * - Client communications
 * - Password resets
 * 
 * Setup Instructions:
 * 1. Choose an email provider:
 *    - SendGrid (Recommended - Free tier available)
 *    - AWS SES
 *    - SMTP Relay (Postmark, Mailgun, etc.)
 * 
 * 2. For SendGrid:
 *    - Create an API key in SendGrid dashboard
 *    - Verify your sender email/domain
 * 
 * 3. For SMTP:
 *    - Configure your SMTP credentials
 */

const EMAIL_CONFIG = {
  provider: process.env.EMAIL_PROVIDER || 'sendgrid', // 'sendgrid' | 'smtp'
  fromEmail: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
  fromName: process.env.EMAIL_FROM_NAME || 'D-Technician FSM',
  
  // SendGrid specific
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  
  // SMTP specific
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
  cc?: string[];
  bcc?: string[];
}

export interface Attachment {
  filename: string;
  content: string; // Base64 encoded
  contentType: string;
}

/**
 * Send email via SendGrid API
 */
async function sendViaSendGrid(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!EMAIL_CONFIG.sendgridApiKey) {
    return { success: false, error: 'SendGrid API key not configured' };
  }

  try {
    const personalizations: any[] = Array.isArray(options.to)
      ? options.to.map(email => ({ to: [{ email }] }))
      : [{ to: [{ email: options.to }] }];

    if (options.cc?.length) {
      personalizations[0].cc = options.cc.map(email => ({ email }));
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_CONFIG.sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations,
        from: { email: EMAIL_CONFIG.fromEmail, name: EMAIL_CONFIG.fromName },
        subject: options.subject,
        content: [
          { type: 'text/plain', value: options.text || options.html.replace(/<[^>]*>/g, '') },
          { type: 'text/html', value: options.html },
        ],
        attachments: options.attachments?.map(att => ({
          content: att.content,
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment',
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.errors?.[0]?.message || 'SendGrid error' };
    }

    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send email via SMTP (using Nodemailer format)
 */
async function sendViaSMTP(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // This would typically use nodemailer in a Node.js backend
  // For frontend-only, you would call a backend API
  console.warn('SMTP sending requires backend implementation');
  return { success: false, error: 'SMTP requires backend implementation' };
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (EMAIL_CONFIG.provider === 'sendgrid') {
    return sendViaSendGrid(options);
  } else {
    return sendViaSMTP(options);
  }
}

/**
 * Generate HTML email template
 */
export function generateEmailTemplate(content: {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  footer?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .highlight { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">D-Technician FSM</h1>
      </div>
      <div class="content">
        <h2 style="margin-top: 0; color: #1f2937;">${content.title}</h2>
        <div>${content.message}</div>
        ${content.actionUrl ? `<a href="${content.actionUrl}" class="button">${content.actionText || 'View Details'}</a>` : ''}
      </div>
      <div class="footer">
        <p>${content.footer || 'This is an automated message from D-Technician FSM.'}</p>
        <p>&copy; ${new Date().getFullYear()} D-Technician. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send daily summary report to admin
 */
export async function sendDailySummary(adminEmail: string, data: {
  date: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  newRequirements: number;
  topTechnicians: Array<{ name: string; completed: number }>;
}): Promise<boolean> {
  const html = generateEmailTemplate({
    title: 'Daily Summary Report',
    message: `
      <p>Here's your daily summary for <strong>${data.date}</strong>:</p>
      <div class="highlight">
        <p><strong>Total Tasks:</strong> ${data.totalTasks}</p>
        <p><strong>Completed:</strong> ${data.completedTasks}</p>
        <p><strong>Pending:</strong> ${data.pendingTasks}</p>
        <p><strong>Overdue:</strong> ${data.overdueTasks}</p>
        <p><strong>New Requirements:</strong> ${data.newRequirements}</p>
      </div>
      <h3>Top Performers Today</h3>
      <ul>
        ${data.topTechnicians.map(t => `<li>${t.name}: ${t.completed} tasks</li>`).join('')}
      </ul>
    `,
    footer: 'View full report in your admin dashboard.',
  });

  const result = await sendEmail({
    to: adminEmail,
    subject: `Daily Summary - ${data.date}`,
    html,
  });

  return result.success;
}

/**
 * Send task assignment notification
 */
export async function sendTaskAssignmentEmail(
  email: string,
  data: {
    technicianName: string;
    taskTitle: string;
    clientName: string;
    address: string;
    scheduledDate: string;
    scheduledTime: string;
    taskUrl: string;
  }
): Promise<boolean> {
  const html = generateEmailTemplate({
    title: 'New Task Assigned',
    message: `
      <p>Hello ${data.technicianName},</p>
      <p>A new task has been assigned to you:</p>
      <div class="highlight">
        <p><strong>Task:</strong> ${data.taskTitle}</p>
        <p><strong>Client:</strong> ${data.clientName}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Date:</strong> ${data.scheduledDate}</p>
        <p><strong>Time:</strong> ${data.scheduledTime}</p>
      </div>
    `,
    actionUrl: data.taskUrl,
    actionText: 'View Task Details',
    footer: 'Please accept or decline this task within 30 minutes.',
  });

  const result = await sendEmail({
    to: email,
    subject: `New Task: ${data.taskTitle}`,
    html,
  });

  return result.success;
}

/**
 * Send invoice to client
 */
export async function sendInvoiceEmail(
  email: string,
  data: {
    clientName: string;
    invoiceNumber: string;
    amount: number;
    items: Array<{ description: string; amount: number }>;
    invoiceUrl: string;
    dueDate?: string;
  }
): Promise<boolean> {
  const itemsHtml = data.items
    .map(item => `<tr><td>${item.description}</td><td style="text-align: right;">₹${item.amount.toLocaleString()}</td></tr>`)
    .join('');

  const html = generateEmailTemplate({
    title: `Invoice #${data.invoiceNumber}`,
    message: `
      <p>Dear ${data.clientName},</p>
      <p>Please find your invoice attached below.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="text-align: left; padding: 10px 0;">Description</th>
            <th style="text-align: right; padding: 10px 0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr style="border-top: 2px solid #e5e7eb; font-weight: bold;">
            <td style="padding: 10px 0;">Total</td>
            <td style="text-align: right; padding: 10px 0;">₹${data.amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      ${data.dueDate ? `<p><strong>Due Date:</strong> ${data.dueDate}</p>` : ''}
    `,
    actionUrl: data.invoiceUrl,
    actionText: 'View & Pay Invoice',
    footer: 'Thank you for your business!',
  });

  const result = await sendEmail({
    to: email,
    subject: `Invoice #${data.invoiceNumber}`,
    html,
  });

  return result.success;
}

export default {
  sendEmail,
  generateEmailTemplate,
  sendDailySummary,
  sendTaskAssignmentEmail,
  sendInvoiceEmail,
};
