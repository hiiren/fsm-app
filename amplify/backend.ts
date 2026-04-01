import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { webhookFunction } from './functions/webhook/resource';
import { shopifyWebhookFunction } from './functions/shopifyWebhook/resource';
import { FunctionUrlAuthType, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';

const backend = defineBackend({
  auth,
  data,
  webhookFunction,
  shopifyWebhookFunction
});

// Create a public, unauthenticated HTTPS endpoint specifically for this function 
// so Meta/WhatsApp can reach it directly.
const webhookUrl = backend.webhookFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE, // Meta handles authentication via verify_token inside the handler code
});

const shopifyWebhookUrl = backend.shopifyWebhookFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE, // Shopify will provide a webhook HMAC signature to verify
});

// Give the shopifyWebhookFunction access to the Task table to write the incoming orders
backend.data.resources.tables["Task"].grantWriteData(
  backend.shopifyWebhookFunction.resources.lambda
);

const shopifyLambda = backend.shopifyWebhookFunction.resources.lambda as LambdaFunction;
shopifyLambda.addEnvironment(
  "TASK_TABLE_NAME",
  backend.data.resources.tables["Task"].tableName
);

// Output the public URL to the logs so you can copy and paste it into Meta Developer Portal
backend.addOutput({
  custom: {
    webhookEndpoint: webhookUrl.url,
    shopifyWebhookEndpoint: shopifyWebhookUrl.url
  }
});
