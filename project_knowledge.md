# Field Service Management (FSM) App - Project Knowledge Base

This document serves as the historical record, architecture guide, and master context file for the FSM application. When an AI agent resumes work on this project, it should read this document to understand the deployment pipeline, state management design, and previously solved bugs.

## 🏗️ System Architecture

### 1. Frontend Framework
* **Tech Stack:** React, Vite, TailwindCSS, shadcn/ui.
* **State Management:** Zustand (`useAppStore` in `src/stores/index.ts`). The frontend state is the source of truth for the UI but acts as a mirror to the AWS backend. 
* **State Syncing Loop:** We use a 30-second polling mechanism (`syncCloudTasks` inside the store) to pull new tasks seamlessly from DynamoDB using `amplifyDataService.ts` bridging. 

### 2. Backend Framework (AWS Amplify Gen 2)
* **Auth:** Amazon Cognito. We use `userPool` (authenticated) for Admin/Technician data access, and `identityPool` (guest) strictly where required (such as public webhooks or initial bootstrapping).
* **Data Layer:** AppSync & DynamoDB. The schema is defined in `amplify/data/resource.ts`.
* **Deployment:** CI/CD linked to the `main` GitHub branch.

### 3. Shopify Webhook Pipeline
When a Client books an order on Shopify, the following pipeline executes:
1. **Shopify** fires a webhook to the AWS Lambda Function URL.
2. **Lambda** (`amplify/functions/shopifyWebhook/handler.ts`) catches the payload, parses the Customer string/SOW, and writes it directly into the DynamoDB `Task` table.
3. **Frontend App** calls `fetchCloudTasks` (via `syncCloudTasks`) and imports the Shopify order as a `'new'` task.

---

## 🛠️ Resolved Bugs & Critical Workarounds
When maintaining this project, watch out for these previously solved issues:

### AWS AppSync Data Synchronization
* **Symptom:** `[AmplifyData] Errors fetching tasks: Unauthorized`.
* **Fix:** When querying the `amplifyClient` inside `src/services/amplifyDataService.ts`, you **must explicitly declare `{ authMode: "userPool" }`**. By default, if the backend `defaultAuthorizationMode` is `identityPool`, missing this flag will cause token validation to fail for logged-in users.

### AWS Amplify Hosting SPA 404 Array
* **Symptom:** Refreshing any nested route (e.g., `/admin/tasks`) causes a `404 Failed to load resource`.
* **Fix:** AWS Amplify Rewrite and Redirects must be set to the Regex:  
  `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>` targeting `/index.html` with a `200 (Rewrite)`.

### Recharts UI Crashing
* **Symptom:** Recharts library throwing an error on dashboard load: `The width(-1) and height(-1) of chart should be greater than 0`.
* **Fix:** All `<ResponsiveContainer>` wrappers in the dashboard have been updated to explicitly enforce safety limits: `<ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>`.

### Task Workflow States & Visibility
* **Symptom:** Tasks disappearing when "Assigned".
* **Fix:** The `Tasks.tsx` Kanban board uses a relational array grouping mechanism (`matchStatuses`). 
  * `Pending` column matches `['pending', 'new']`
  * `Accepted` column matches `['assigned', 'accepted']`
* **Admin Overrides:** The admin Task Details sidebar currently hosts active override buttons allowing Admins to push tasks completely through the technician funnel (Accept -> Start -> Complete) directly from the `Tasks.tsx` interface. 

---

## 🚀 Workflows & Next Steps

If we are resuming work, the following areas are likely the next items of focus:
1. Building out the true Technician Dashboard portal (`src/pages/technician/...`).
2. Tying up actual backend user pools for Technicians (moving away from mock tech profiles).
3. Completing the WhatsApp integration for direct template messaging on state changes.
