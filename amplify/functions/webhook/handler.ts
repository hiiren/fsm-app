import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

// Security Token that Meta uses to verify your server.
// Do not share this with anyone! When setting up Meta, you'll paste this identical token.
const VERIFY_TOKEN = 'MY_SUPER_SECRET_TOKEN_123';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // --------------------------------------------------------------------------
  // 1. WhatsApp Webhook Verification (GET Request)
  // When you add the webhook URL in Meta Dashboard, Meta will send a GET request here.
  // --------------------------------------------------------------------------
  if (event.requestContext.http.method === 'GET') {
    const queryParams = event.queryStringParameters || {};
    const mode = queryParams['hub.mode'];
    const token = queryParams['hub.verify_token'];
    const challenge = queryParams['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED SUCCESSFULLY!');
      return {
        statusCode: 200,
        body: challenge, // We must bounce back the challenge code to Meta
      };
    } else {
      console.log('WEBHOOK VERIFICATION FAILED. Token mismatch.');
      return { statusCode: 403, body: 'Forbidden' };
    }
  }

  // --------------------------------------------------------------------------
  // 2. Incoming Messages from WhatsApp (POST Request)
  // When someone messages your WhatsApp Business Number, Meta sends the data here.
  // --------------------------------------------------------------------------
  if (event.requestContext.http.method === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('Incoming WhatsApp Webhook Received:', JSON.stringify(body, null, 2));

      // Validate that this is from a WhatsApp Business Account
      if (body.object === 'whatsapp_business_account') {
        const changes = body.entry?.[0]?.changes?.[0]?.value;
        const messages = changes?.messages;

        // Extract the message details if they exist
        if (messages && messages.length > 0) {
          const fromPhone = messages[0].from; 
          const textMsg = messages[0].text?.body; 
          
          console.log(`SUCCESS! Received message from phone number ${fromPhone}: "${textMsg}"`);
          
          // --> LATER: You can write logic here to save to database or send an automated reply!
        }
      }

      // WhatsApp REQUIRES a 200 OK response within 20 seconds, otherwise they will retry sending.
      return { statusCode: 200, body: 'EVENT_RECEIVED' };

    } catch (error) {
      console.error('Failed to parse incoming webhook payload:', error);
      return { statusCode: 500, body: 'Internal Server Error' };
    }
  }

  return { statusCode: 404, body: 'Not Found' };
};
