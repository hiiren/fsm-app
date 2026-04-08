import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * Note: custom:role attribute was added manually via AWS Console.
 * Do NOT re-declare it here to avoid CloudFormation conflicts.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
