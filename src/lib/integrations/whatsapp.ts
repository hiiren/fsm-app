/**
 * WhatsApp Business API Integration
 * 
 * This module handles WhatsApp messaging for:
 * - Task notifications to clients
 * - Status updates
 * - Appointment confirmations
 * 
 * Setup Instructions:
 * 1. Create a WhatsApp Business Account
 * 2. Set up a Business App in Meta Developer Console
 * 3. Get your Phone Number ID and Access Token
 * 4. Create and submit message templates for approval
 */

const WHATSAPP_CONFIG = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  apiVersion: 'v18.0',
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
};

export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template' | 'text' | 'image' | 'document';
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
  text?: {
    body: string;
    preview_url?: boolean;
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    filename: string;
    caption?: string;
  };
}

export interface WhatsAppTemplateMessage {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
}

export const MESSAGE_TEMPLATES: Record<string, WhatsAppTemplateMessage> = {
  service_confirmed: {
    name: 'service_confirmed',
    language: 'en',
    category: 'UTILITY',
  },
  technician_en_route: {
    name: 'technician_en_route',
    language: 'en',
    category: 'UTILITY',
  },
  task_started: {
    name: 'task_started',
    language: 'en',
    category: 'UTILITY',
  },
  task_completed: {
    name: 'task_completed',
    language: 'en',
    category: 'UTILITY',
  },
  task_delayed: {
    name: 'task_delayed',
    language: 'en',
    category: 'UTILITY',
  },
  feedback_request: {
    name: 'feedback_request',
    language: 'en',
    category: 'UTILITY',
  },
  appointment_reminder: {
    name: 'appointment_reminder',
    language: 'en',
    category: 'UTILITY',
  },
};

/**
 * Send WhatsApp message via API
 */
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!WHATSAPP_CONFIG.accessToken || !WHATSAPP_CONFIG.phoneNumberId) {
    console.warn('WhatsApp API credentials not configured');
    return { success: false, error: 'WhatsApp API not configured' };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Failed to send message' };
    }

    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Send template message for service confirmation
 */
export async function sendServiceConfirmation(
  phoneNumber: string,
  data: {
    customerName: string;
    technicianName: string;
    serviceDate: string;
    serviceTime: string;
    serviceType: string;
  }
): Promise<boolean> {
  const message: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: phoneNumber.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: 'service_confirmed',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.customerName },
            { type: 'text', text: data.technicianName },
            { type: 'text', text: data.serviceDate },
            { type: 'text', text: data.serviceTime },
            { type: 'text', text: data.serviceType },
          ],
        },
      ],
    },
  };

  const result = await sendWhatsAppMessage(message);
  return result.success;
}

/**
 * Send technician en route notification
 */
export async function sendTechnicianEnRoute(
  phoneNumber: string,
  data: {
    customerName: string;
    technicianName: string;
    eta: string;
    trackingUrl?: string;
  }
): Promise<boolean> {
  const message: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: phoneNumber.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: 'technician_en_route',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.customerName },
            { type: 'text', text: data.technicianName },
            { type: 'text', text: data.eta },
          ],
        },
      ],
    },
  };

  const result = await sendWhatsAppMessage(message);
  return result.success;
}

/**
 * Send task completed notification
 */
export async function sendTaskCompleted(
  phoneNumber: string,
  data: {
    customerName: string;
    serviceType: string;
    completionTime: string;
    feedbackUrl?: string;
  }
): Promise<boolean> {
  const message: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: phoneNumber.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: 'task_completed',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.customerName },
            { type: 'text', text: data.serviceType },
            { type: 'text', text: data.completionTime },
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            { type: 'text', text: data.feedbackUrl || '' },
          ],
        },
      ],
    },
  };

  const result = await sendWhatsAppMessage(message);
  return result.success;
}

/**
 * Send custom text message (only within 24-hour session window)
 */
export async function sendCustomMessage(
  phoneNumber: string,
  messageText: string
): Promise<boolean> {
  const message: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: phoneNumber.replace(/\D/g, ''),
    type: 'text',
    text: {
      body: messageText,
      preview_url: false,
    },
  };

  const result = await sendWhatsAppMessage(message);
  return result.success;
}

/**
 * Send image message
 */
export async function sendImageMessage(
  phoneNumber: string,
  imageUrl: string,
  caption?: string
): Promise<boolean> {
  const message: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: phoneNumber.replace(/\D/g, ''),
    type: 'image',
    image: {
      link: imageUrl,
      caption: caption,
    },
  };

  const result = await sendWhatsAppMessage(message);
  return result.success;
}

/**
 * Send document (like invoice PDF)
 */
export async function sendDocumentMessage(
  phoneNumber: string,
  documentUrl: string,
  filename: string,
  caption?: string
): Promise<boolean> {
  const message: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: phoneNumber.replace(/\D/g, ''),
    type: 'document',
    document: {
      link: documentUrl,
      filename: filename,
      caption: caption,
    },
  };

  const result = await sendWhatsAppMessage(message);
  return result.success;
}

/**
 * Verify WhatsApp webhook
 */
export function verifyWebhook(
  mode: string,
  token: string,
  challenge: string
): { valid: boolean; challenge?: string } {
  if (mode === 'subscribe' && token === WHATSAPP_CONFIG.webhookVerifyToken) {
    return { valid: true, challenge };
  }
  return { valid: false };
}

/**
 * Process incoming WhatsApp webhook
 */
export function processWebhook(payload: any): {
  type: string;
  from: string;
  text?: string;
} | null {
  if (payload.object !== 'whatsapp_business_account') {
    return null;
  }

  const entry = payload.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  if (!value?.messages?.[0]) {
    return null;
  }

  const message = value.messages[0];
  
  return {
    type: message.type,
    from: message.from,
    text: message.text?.body,
  };
}

export default {
  sendWhatsAppMessage,
  sendServiceConfirmation,
  sendTechnicianEnRoute,
  sendTaskCompleted,
  sendCustomMessage,
  sendImageMessage,
  sendDocumentMessage,
  verifyWebhook,
  processWebhook,
  MESSAGE_TEMPLATES,
};
