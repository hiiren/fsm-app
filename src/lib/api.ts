import { logError, logInfo } from './logger';
import type { PageName } from './logger';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export async function apiCall<T>(
  page: PageName,
  operation: string,
  fetchFn: () => Promise<T>,
  onError?: (error: ApiError) => void
): Promise<ApiResponse<T>> {
  try {
    logInfo(page, `API call started: ${operation}`);
    const data = await fetchFn();
    logInfo(page, `API call succeeded: ${operation}`);
    return { data, success: true };
  } catch (err) {
    const error: ApiError = err instanceof Error 
      ? { message: err.message, code: err.name }
      : { message: String(err), code: 'UNKNOWN' };
    
    logError(page, `API call failed: ${operation}`, { error }, err instanceof Error ? err : undefined);
    
    if (onError) {
      onError(error);
    }
    
    return { error, success: false };
  }
}

export function createApiHandler(page: PageName) {
  return {
    async try_<T>(operation: string, fetchFn: () => Promise<T>): Promise<ApiResponse<T>> {
      return apiCall(page, operation, fetchFn);
    },
  };
}
