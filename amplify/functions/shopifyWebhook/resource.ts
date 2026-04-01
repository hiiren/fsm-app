import { defineFunction } from '@aws-amplify/backend';

export const shopifyWebhookFunction = defineFunction({
  name: 'shopify-webhook',
  entry: './handler.ts',
});
