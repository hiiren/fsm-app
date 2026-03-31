import { defineFunction } from '@aws-amplify/backend';

// Automatically bundle and deploy the webhook serverless function
export const webhookFunction = defineFunction({
  name: 'webhook',
  entry: './handler.ts',    // points to the handler we built 
});
