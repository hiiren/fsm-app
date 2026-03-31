/**
 * Shopify Integration Service
 * 
 * This module handles integration with Shopify to sync:
 * - Orders → Service Requests
 * - Customers → Clients
 * - Products → Service Types
 * 
 * Setup Instructions:
 * 1. Create a Shopify Private App in your store admin
 * 2. Get the API key and password from the app
 * 3. Set up webhooks for order creation
 * 4. Configure this service with your credentials
 */

const SHOPIFY_CONFIG = {
  storeName: 'your-store', // Replace with your store name (e.g., 'myshop')
  apiVersion: '2024-01',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
  apiKey: process.env.SHOPIFY_API_KEY || '',
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
};

export interface ShopifyOrder {
  id: string;
  order_number: string;
  email: string;
  created_at: string;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress | null;
  billing_address: ShopifyAddress | null;
  customer: ShopifyCustomer | null;
  note: string | null;
  tags: string[];
}

export interface ShopifyLineItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  vendor: string;
}

export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  orders_count: number;
  total_spent: string;
}

export interface ShopifyWebhookPayload {
  id: string;
  topic: string;
  created_at: string;
  object_id: string;
}

/**
 * Transform Shopify order to our service requirement format
 */
export function transformShopifyOrderToRequirement(order: ShopifyOrder) {
  return {
    clientName: order.shipping_address 
      ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
      : order.customer?.first_name + ' ' + order.customer?.last_name || 'Unknown',
    clientPhone: order.shipping_address?.phone || order.customer?.phone || '',
    serviceType: order.line_items[0]?.title || 'General Service',
    preferredDate: new Date(order.created_at).toISOString().split('T')[0],
    preferredTime: '10:00',
    description: `
Order #${order.order_number}
Items: ${order.line_items.map(item => `${item.title} x${item.quantity}`).join(', ')}
${order.note ? `Notes: ${order.note}` : ''}
    `.trim(),
    attachments: [],
    status: 'new' as const,
    shopifyOrderId: order.id,
  };
}

/**
 * Get order from Shopify by ID
 */
export async function getShopifyOrder(orderId: string): Promise<ShopifyOrder | null> {
  if (!SHOPIFY_CONFIG.accessToken) {
    console.warn('Shopify access token not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.storeName}.myshopify.com/admin/api/${SHOPIFY_CONFIG.apiVersion}/orders/${orderId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error fetching Shopify order:', error);
    return null;
  }
}

/**
 * Get all orders from Shopify (for initial sync)
 */
export async function getShopifyOrders(
  status: 'any' | 'open' | 'closed' | 'cancelled' = 'any',
  limit: number = 50
): Promise<ShopifyOrder[]> {
  if (!SHOPIFY_CONFIG.accessToken) {
    console.warn('Shopify access token not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.storeName}.myshopify.com/admin/api/${SHOPIFY_CONFIG.apiVersion}/orders.json?status=${status}&limit=${limit}`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.orders;
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    return [];
  }
}

/**
 * Verify Shopify webhook signature
 */
export function verifyShopifyWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
  return hash === signature;
}

/**
 * Create a note on Shopify order
 */
export async function addOrderNote(orderId: string, note: string): Promise<boolean> {
  if (!SHOPIFY_CONFIG.accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.storeName}.myshopify.com/admin/api/${SHOPIFY_CONFIG.apiVersion}/orders/${orderId}.json`,
      {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: {
            id: orderId,
            note: note,
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error adding Shopify order note:', error);
    return false;
  }
}

/**
 * Get Shopify products (service types)
 */
export async function getShopifyProducts(): Promise<any[]> {
  if (!SHOPIFY_CONFIG.accessToken) {
    return [];
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.storeName}.myshopify.com/admin/api/${SHOPIFY_CONFIG.apiVersion}/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_CONFIG.accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return [];
  }
}

export default {
  getShopifyOrder,
  getShopifyOrders,
  transformShopifyOrderToRequirement,
  verifyShopifyWebhook,
  addOrderNote,
  getShopifyProducts,
};
