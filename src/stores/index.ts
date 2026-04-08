import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Technician, Task, ClientRequirement, Feedback, Notification, AuditLog, MaterialRequest, WhatsAppMessage, Holiday, Leave, ErrorLog, TaskStatus } from '../types';
import { generateId } from '../lib/utils';
import { logError, logInfo, setUserContext, clearUserContext } from '../lib/logger';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Cognito auth is handled in authService.ts — this is called after successful Cognito signIn
        // This fallback exists only for cases where the Login page directly calls login()
        try {
          const { cognitoSignIn, fetchCurrentUser } = await import('../services/authService');
          const result = await cognitoSignIn(email, password);
          
          if (result.success) {
            const userInfo = await fetchCurrentUser();
            if (userInfo) {
              const user: User = {
                id: userInfo.userId,
                email: userInfo.email,
                password: '',
                role: userInfo.role,
                name: userInfo.name,
                createdAt: new Date().toISOString(),
              };
              set({ user, isAuthenticated: true });
              setUserContext(user.id, user.role);
              logInfo('login', `Login successful: ${email}`, { userId: user.id });
              return true;
            }
          }
          logError('login', `Login failed: ${result.message}`, { email });
          return false;
        } catch (err: any) {
          logError('login', `Login error: ${err?.message}`, { email });
          return false;
        }
      },
      logout: () => {
        // Sign out from Cognito (fire-and-forget)
        import('../services/authService').then(({ cognitoSignOut }) => {
          cognitoSignOut().catch(console.error);
        }).catch(() => {});
        
        clearUserContext();
        logInfo('login', 'User logged out');
        set({ user: null, isAuthenticated: false });
      },
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
          setUserContext(user.id, user.role);
        } else {
          clearUserContext();
        }
      },
    }),
    { name: 'fsm-auth' }
  )
);

interface AppState {
  technicians: Technician[];
  tasks: Task[];
  requirements: ClientRequirement[];
  feedbacks: Feedback[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  materials: MaterialRequest[];
  whatsappMessages: WhatsAppMessage[];
  holidays: Holiday[];
  leaves: Leave[];
  errorLogs: ErrorLog[];
  
  addTechnician: (tech: Omit<Technician, 'id' | 'createdAt'>) => void;
  updateTechnician: (id: string, data: Partial<Technician>) => void;
  deleteTechnician: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'materials' | 'timeExtensions'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus, note?: string) => void;
  assignTechnician: (taskId: string, technicianId: string) => void;
  deleteTask: (id: string) => void;
  
  addRequirement: (req: Omit<ClientRequirement, 'id' | 'createdAt'>) => void;
  updateRequirement: (id: string, data: Partial<ClientRequirement>) => void;
  
  addFeedback: (fb: Omit<Feedback, 'id' | 'createdAt'>) => void;
  
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  
  addMaterialRequest: (req: Omit<MaterialRequest, 'id' | 'createdAt'>) => void;
  updateMaterialRequest: (id: string, data: Partial<MaterialRequest>) => void;
  
  sendWhatsAppMessage: (msg: Omit<WhatsAppMessage, 'id' | 'timestamp' | 'status'>) => void;
  
  syncCloudTasks: () => Promise<void>;
  
  logError: (error: Omit<ErrorLog, 'id' | 'timestamp'>) => void;
  clearErrorLogs: () => void;
}

// Production: All data starts empty.
// Tasks arrive via Shopify webhook → DynamoDB → syncCloudTasks()
// Technicians register via /register or are added by admin.
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      technicians: [],
      tasks: [],
      requirements: [],
      feedbacks: [],
      notifications: [],
      auditLogs: [],
      materials: [],
      whatsappMessages: [],
      holidays: [],
      leaves: [],
      errorLogs: [],

      addTechnician: (tech) => {
        const newTech: Technician = {
          ...tech,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ technicians: [...state.technicians, newTech] }));
      },

      updateTechnician: (id, data) => {
        set((state) => ({
          technicians: state.technicians.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }));
      },

      deleteTechnician: (id) => {
        set((state) => ({
          technicians: state.technicians.filter((t) => t.id !== id),
        }));
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          timeline: [{ status: 'pending', timestamp: new Date().toISOString() }],
          materials: [],
          timeExtensions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t)),
        }));
      },

      updateTaskStatus: (id, status, note) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  timeline: [...t.timeline, { status, timestamp: new Date().toISOString(), note }],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      assignTechnician: (taskId, technicianId) => {
        const state = get();
        const tech = state.technicians.find(t => t.id === technicianId);
        const task = state.tasks.find(t => t.id === taskId);
        
        if (tech && task) {
          state.updateTask(taskId, { assignedTechnicianId: technicianId, status: 'assigned' });
          state.updateTaskStatus(taskId, 'assigned', `Assigned to ${tech.fullName}`);
          state.addNotification({
            type: 'task',
            title: 'Task Assigned',
            message: `${task.title} has been assigned to ${tech.fullName}`,
          });
          state.sendWhatsAppMessage({
            clientId: `tech-${tech.id}`,
            clientName: tech.fullName,
            content: `New Task Assigned: ${task.title} at ${task.location.address}. Scheduled for ${task.scheduledDate} ${task.scheduledTime}.`,
            type: 'template',
            templateName: 'task_assignment',
          });
        }
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      addRequirement: (req) => {
        const newReq: ClientRequirement = {
          ...req,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ requirements: [...state.requirements, newReq] }));
      },

      updateRequirement: (id, data) => {
        set((state) => ({
          requirements: state.requirements.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }));
      },

      addFeedback: (fb) => {
        const newFb: Feedback = {
          ...fb,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ feedbacks: [...state.feedbacks, newFb] }));
      },

      addNotification: (notif) => {
        const now = new Date().toISOString();
        set((state) => {
          const recentNotification = state.notifications.find(n => 
            n.title === notif.title && 
            n.message === notif.message &&
            new Date(n.createdAt).getTime() > Date.now() - 5000
          );
          if (recentNotification) {
            return state;
          }
          const newNotif: Notification = {
            ...notif,
            id: generateId(),
            read: false,
            createdAt: now,
          };
          return { notifications: [newNotif, ...state.notifications] };
        });
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      addAuditLog: (log) => {
        const newLog: AuditLog = {
          ...log,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }));
      },

      addMaterialRequest: (req) => {
        const newReq: MaterialRequest = {
          ...req,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ materials: [...state.materials, newReq] }));
      },

      updateMaterialRequest: (id, data) => {
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...data, resolvedAt: new Date().toISOString() } : m
          ),
        }));
      },

      sendWhatsAppMessage: (msg) => {
        const newMsg: WhatsAppMessage = {
          ...msg,
          id: generateId(),
          status: 'sent',
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ whatsappMessages: [...state.whatsappMessages, newMsg] }));
      },

      syncCloudTasks: async () => {
        try {
          const { fetchCloudTasks } = await import('../services/amplifyDataService');
          const cloudTasks = await fetchCloudTasks();
          if (cloudTasks.length === 0) return;

          const existingIds = new Set(get().tasks.map(t => t.id));
          const existingShopifyIds = new Set(get().tasks.map(t => t.shopifyOrderId).filter(Boolean));

          const newTasks: Task[] = cloudTasks
            .filter(ct => !existingIds.has(ct.id) && !existingShopifyIds.has(ct.shopifyOrderId))
            .map(ct => ({
              id: ct.id,
              title: ct.title || 'Untitled Task',
              description: ct.description || '',
              clientName: ct.clientName || 'Unknown',
              clientEmail: ct.clientEmail || '',
              clientPhone: ct.clientPhone || '',
              location: {
                address: ct.address || '',
                city: ct.city || '',
                pinCode: ct.pinCode || '',
                lat: 0,
                lng: 0,
              },
              category: ct.category || 'General',
              priority: (ct.priority || 'medium') as any,
              status: (ct.status || 'new') as any,
              scheduledDate: ct.scheduledTimestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
              scheduledTime: '10:00',
              estimatedDuration: 60,
              assignedTechnicianId: ct.assignedTechnicianId || '',
              timeline: [{ status: ct.status || 'new', timestamp: ct.createdAt || new Date().toISOString() }],
              materials: [],
              timeExtensions: [],
              shopifyOrderId: ct.shopifyOrderId || '',
              createdAt: ct.createdAt || new Date().toISOString(),
              updatedAt: ct.updatedAt || new Date().toISOString(),
            }));

          if (newTasks.length > 0) {
            logInfo('syncCloudTasks', `Synced ${newTasks.length} new tasks from cloud`);
            set((state) => ({
              tasks: [...newTasks, ...state.tasks],
            }));
          }
        } catch (err) {
          console.warn('[SyncCloudTasks] Failed to sync:', err);
        }
      },

      logError: (error) => {
        const newLog: ErrorLog = {
          ...error,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ errorLogs: [newLog, ...state.errorLogs] }));
      },

      clearErrorLogs: () => {
        set({ errorLogs: [] });
      },
    }),
    { name: 'fsm-app-state', version: 3 }
  )
);
