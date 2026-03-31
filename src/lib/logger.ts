export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  page: string;
  panel: 'admin' | 'technician' | 'login';
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  userId?: string;
  userRole?: string;
}

export type PageName = 
  | 'admin-dashboard'
  | 'admin-tasks'
  | 'admin-technicians'
  | 'admin-requirements'
  | 'admin-profile'
  | 'admin-settings'
  | 'admin-monitoring'
  | 'admin-analytics'
  | 'admin-materials'
  | 'admin-whatsapp'
  | 'admin-logs'
  | 'technician-dashboard'
  | 'technician-tasks'
  | 'technician-materials'
  | 'technician-profile'
  | 'technician-messages'
  | 'technician-location'
  | 'technician-settings'
  | 'login';

const LOG_STORAGE_KEY = 'fsm_error_logs';

function getPanelFromPage(page: string): 'admin' | 'technician' | 'login' {
  if (page.startsWith('admin-')) return 'admin';
  if (page.startsWith('technician-')) return 'technician';
  return 'login';
}

function getLogs(): LogEntry[] {
  try {
    const stored = localStorage.getItem(LOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLogs(logs: LogEntry[]): void {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    console.error('Failed to save logs to localStorage');
  }
}

function generateLogId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function logError(
  page: PageName,
  message: string,
  details?: Record<string, unknown>,
  error?: Error
): LogEntry {
  const panel = getPanelFromPage(page);
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    page,
    panel,
    message,
    details,
    stack: error?.stack,
    userId: sessionStorage.getItem('fsm_user_id') || undefined,
    userRole: sessionStorage.getItem('fsm_user_role') || undefined,
  };

  const logs = getLogs();
  logs.unshift({ ...entry, message: `[${generateLogId()}] ${message}` });
  
  const maxLogs = 1000;
  const trimmedLogs = logs.slice(0, maxLogs);
  saveLogs(trimmedLogs);

  if (import.meta.env.DEV) {
    console.error(`[${page}] ${message}`, details, error);
  }

  return entry;
}

export function logWarn(
  page: PageName,
  message: string,
  details?: Record<string, unknown>
): LogEntry {
  const panel = getPanelFromPage(page);
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'warn',
    page,
    panel,
    message,
    details,
    userId: sessionStorage.getItem('fsm_user_id') || undefined,
    userRole: sessionStorage.getItem('fsm_user_role') || undefined,
  };

  const logs = getLogs();
  logs.unshift({ ...entry, message: `[${generateLogId()}] ${message}` });
  
  const maxLogs = 1000;
  const trimmedLogs = logs.slice(0, maxLogs);
  saveLogs(trimmedLogs);

  if (import.meta.env.DEV) {
    console.warn(`[${page}] ${message}`, details);
  }

  return entry;
}

export function logInfo(
  page: PageName,
  message: string,
  details?: Record<string, unknown>
): LogEntry {
  const panel = getPanelFromPage(page);
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    page,
    panel,
    message,
    details,
    userId: sessionStorage.getItem('fsm_user_id') || undefined,
    userRole: sessionStorage.getItem('fsm_user_role') || undefined,
  };

  const logs = getLogs();
  logs.unshift(entry);
  
  const maxLogs = 1000;
  const trimmedLogs = logs.slice(0, maxLogs);
  saveLogs(trimmedLogs);

  if (import.meta.env.DEV) {
    console.info(`[${page}] ${message}`, details);
  }

  return entry;
}

export function getPageLogs(page?: PageName, panel?: 'admin' | 'technician' | 'login'): LogEntry[] {
  const logs = getLogs();
  
  if (page) {
    return logs.filter(log => log.page === page);
  }
  
  if (panel) {
    return logs.filter(log => log.panel === panel);
  }
  
  return logs;
}

export function getErrorLogs(panel?: 'admin' | 'technician' | 'login'): LogEntry[] {
  const logs = getLogs();
  const errorLogs = logs.filter(log => log.level === 'error');
  
  if (panel) {
    return errorLogs.filter(log => log.panel === panel);
  }
  
  return errorLogs;
}

export function clearLogs(): void {
  saveLogs([]);
}

export function exportLogs(): string {
  const logs = getLogs();
  return JSON.stringify(logs, null, 2);
}

export function downloadLogs(page?: PageName): void {
  const logs = page ? getPageLogs(page) : getLogs();
  const content = JSON.stringify(logs, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fsm-logs-${page || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function setUserContext(userId: string, userRole: string): void {
  sessionStorage.setItem('fsm_user_id', userId);
  sessionStorage.setItem('fsm_user_role', userRole);
}

export function clearUserContext(): void {
  sessionStorage.removeItem('fsm_user_id');
  sessionStorage.removeItem('fsm_user_role');
}
