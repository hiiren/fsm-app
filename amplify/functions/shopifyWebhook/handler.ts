import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (event.requestContext.http.method === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('Incoming Shopify Webhook Received:', JSON.stringify(body, null, 2));

      // Extract Shopify order details
      const orderId = body.id || body.checkout_id;
      const customer = body.customer || {};
      const shippingAddress = body.shipping_address || {};
      const lineItems = body.line_items || [];
      
      const clientName = customer.first_name ? `${customer.first_name} ${customer.last_name || ''}` : 'Shopify Client';
      const clientEmail = customer.email;
      const clientPhone = shippingAddress.phone || customer.phone || 'N/A';
      
      const address = shippingAddress.address1 || '';
      const city = shippingAddress.city || '';
      const pinCode = shippingAddress.zip || '';
      const fullAddress = `${address}, ${city} - ${pinCode}`;
      
      const scopeOfWork = lineItems.map((item: any) => item.name).join(', ');

      console.log(`Parsed Order ${orderId} for ${clientName}. SOW: ${scopeOfWork}`);

      const tableName = process.env.TASK_TABLE_NAME;
      if (!tableName) {
        console.warn("TASK_TABLE_NAME not set in environment.");
      } else {
        const taskId = `task-${orderId || Date.now()}`;
        
        await docClient.send(new PutCommand({
          TableName: tableName,
          Item: {
            id: taskId,
            shopifyOrderId: (orderId || '').toString(),
            title: `Shopify Order #${body.order_number || orderId}`,
            description: scopeOfWork,
            category: 'General',
            priority: 'medium',
            status: 'new', // new unassigned ticket
            clientName,
            clientPhone,
            clientEmail: clientEmail || '',
            address: fullAddress,
            city,
            pinCode,
            zone: 'Unassigned',
            scheduledTimestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }));
        console.log(`Successfully saved task ${taskId} to DynamoDB: ${tableName}`);
      }

      return { statusCode: 200, body: 'Order Received and Saved' };

    } catch (error) {
      console.error('Failed to parse or save Shopify webhook:', error);
      return { statusCode: 500, body: 'Internal Server Error' };
    }
  }

  return { statusCode: 404, body: 'Not Found' };
};
