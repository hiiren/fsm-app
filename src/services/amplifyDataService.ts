/**
 * Amplify Data Service
 * 
 * This service bridges the Amplify Data backend (DynamoDB) with the frontend Zustand store.
 * It uses the Amplify `generateClient` to perform CRUD operations on the Task table.
 * 
 * When amplify_outputs.json is not available (local dev without sandbox),
 * operations gracefully fail and the app uses local Zustand state.
 */

let amplifyClient: any = null;
let isAmplifyConfigured = false;

/**
 * Initialize the Amplify client. 
 * Call this once in main.tsx after Amplify.configure().
 */
export async function initAmplifyDataClient() {
  try {
    const { generateClient } = await import('aws-amplify/data');
    amplifyClient = generateClient();
    isAmplifyConfigured = true;
    console.log('[AmplifyData] Client initialized successfully');
  } catch (err) {
    console.warn('[AmplifyData] Failed to initialize client. Running in local-only mode.', err);
    isAmplifyConfigured = false;
  }
}

/**
 * Fetch all tasks from the Amplify Data (DynamoDB) backend.
 * Returns an empty array if Amplify is not configured.
 */
export async function fetchCloudTasks(): Promise<any[]> {
  if (!isAmplifyConfigured || !amplifyClient) {
    console.warn('[AmplifyData] Not configured. Returning empty task list.');
    return [];
  }

  try {
    const { data: tasks, errors } = await amplifyClient.models.Task.list({
      selectionSet: ['id', 'title', 'description', 'clientName', 'clientPhone', 'clientEmail', 'address', 'city', 'pinCode', 'zone', 'category', 'priority', 'status', 'scheduledTimestamp', 'assignedTechnicianId', 'shopifyOrderId', 'createdAt', 'updatedAt']
    });
    if (errors) {
      console.error('[AmplifyData] Errors fetching tasks:', errors);
      return [];
    }
    console.log(`[AmplifyData] Fetched ${tasks.length} tasks from cloud`);
    return tasks;
  } catch (err) {
    console.error('[AmplifyData] Failed to fetch tasks:', err);
    return [];
  }
}

/**
 * Create a task in the Amplify Data (DynamoDB) backend.
 */
export async function createCloudTask(taskData: Record<string, any>): Promise<any | null> {
  if (!isAmplifyConfigured || !amplifyClient) {
    console.warn('[AmplifyData] Not configured. Task not saved to cloud.');
    return null;
  }

  try {
    const { data: newTask, errors } = await amplifyClient.models.Task.create(taskData);
    if (errors) {
      console.error('[AmplifyData] Errors creating task:', errors);
      return null;
    }
    console.log(`[AmplifyData] Task created in cloud: ${newTask.id}`);
    return newTask;
  } catch (err) {
    console.error('[AmplifyData] Failed to create task:', err);
    return null;
  }
}

/**
 * Update a task in the Amplify Data (DynamoDB) backend.
 */
export async function updateCloudTask(id: string, updates: Record<string, any>): Promise<any | null> {
  if (!isAmplifyConfigured || !amplifyClient) {
    console.warn('[AmplifyData] Not configured. Task not updated in cloud.');
    return null;
  }

  try {
    const { data: updatedTask, errors } = await amplifyClient.models.Task.update({
      id,
      ...updates,
    });
    if (errors) {
      console.error('[AmplifyData] Errors updating task:', errors);
      return null;
    }
    console.log(`[AmplifyData] Task updated in cloud: ${id}`);
    return updatedTask;
  } catch (err) {
    console.error('[AmplifyData] Failed to update task:', err);
    return null;
  }
}

/**
 * Check if the Amplify Data backend is available.
 */
export function isCloudAvailable(): boolean {
  return isAmplifyConfigured;
}
