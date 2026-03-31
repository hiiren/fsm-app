import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { webhookFunction } from './functions/webhook/resource';

const backend = defineBackend({
  auth,
  data,
  webhookFunction
});

// Create a public, unauthenticated HTTPS endpoint specifically for this function 
// so Meta/WhatsApp can reach it directly.
const webhookUrl = backend.webhookFunction.resources.lambda.addFunctionUrl({
  authType: 'NONE', // Meta handles authentication via verify_token inside the handler code
});

// Output the public URL to the logs so you can copy and paste it into Meta Developer Portal
backend.addOutput({
  custom: {
    webhookEndpoint: webhookUrl.url
  }
});
