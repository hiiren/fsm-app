import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Technician, Task, ClientRequirement, Feedback, Notification, AuditLog, MaterialRequest, WhatsAppMessage, Holiday, Leave, ErrorLog, TaskStatus } from '../types';
import { generateId } from '../lib/utils';
import { logError, logInfo, setUserContext, clearUserContext } from '../lib/logger';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email, password) => {
        if (email === 'admin@fsm.com' && password === 'admin123') {
          const user: User = {
            id: 'admin-001',
            email,
            password,
            role: 'admin',
            name: 'Admin User',
            createdAt: new Date().toISOString(),
          };
          set({ user, isAuthenticated: true });
          setUserContext(user.id, user.role);
          logInfo('login', `Admin login successful: ${email}`, { userId: user.id });
          return true;
        }
        if (email === 'tech@fsm.com' && password === 'tech123') {
          const user: User = {
            id: 'tech-001',
            email,
            password,
            role: 'technician',
            name: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            address: 'Flat 201, Green Park CHS, Andheri East, Mumbai 400069',
            aadhaarNumber: '1234 5678 9012',
            panNumber: 'ABCDE1234F',
            createdAt: new Date().toISOString(),
          };
          set({ user, isAuthenticated: true });
          setUserContext(user.id, user.role);
          logInfo('login', `Technician login successful: ${email}`, { userId: user.id });
          return true;
        }
        logError('login', `Login failed: invalid credentials for ${email}`, { email });
        return false;
      },
      logout: () => {
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
  
  simulateShopifyWebhook: () => void;
  syncCloudTasks: () => Promise<void>;
  
  logError: (error: Omit<ErrorLog, 'id' | 'timestamp'>) => void;
  clearErrorLogs: () => void;
}

const initialTechnicians: Technician[] = [
  {
    id: 'tech-001',
    userId: 'user-tech-001',
    fullName: 'Rajesh Kumar',
    mobile: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    skills: ['Electrical', 'AC Repair'],
    serviceZone: 'North Mumbai',
    status: 'active',
    rating: 4.8,
    documents: { verificationStatus: 'verified' },
    stats: { totalTasks: 156, completedTasks: 152, avgCompletionTime: 45, onTimeRate: 94 },
    currentLocation: { lat: 19.076, lng: 72.877 },
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'tech-002',
    userId: 'user-tech-002',
    fullName: 'Priya Sharma',
    mobile: '+91 98765 43211',
    email: 'priya.sharma@email.com',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    skills: ['Plumbing', 'Appliance Repair'],
    serviceZone: 'South Mumbai',
    status: 'active',
    rating: 4.6,
    documents: { verificationStatus: 'verified' },
    stats: { totalTasks: 134, completedTasks: 128, avgCompletionTime: 52, onTimeRate: 89 },
    currentLocation: { lat: 18.921, lng: 72.833 },
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 'tech-003',
    userId: 'user-tech-003',
    fullName: 'Amit Patel',
    mobile: '+91 98765 43212',
    email: 'amit.patel@email.com',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    skills: ['Electrical', 'General'],
    serviceZone: 'Central Mumbai',
    status: 'active',
    rating: 4.9,
    documents: { verificationStatus: 'verified' },
    stats: { totalTasks: 178, completedTasks: 175, avgCompletionTime: 38, onTimeRate: 97 },
    currentLocation: { lat: 19.001, lng: 72.850 },
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'tech-004',
    userId: 'user-tech-004',
    fullName: 'Sneha Reddy',
    mobile: '+91 98765 43213',
    email: 'sneha.reddy@email.com',
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    skills: ['AC Repair', 'Appliance Repair'],
    serviceZone: 'West Mumbai',
    status: 'pending_verification',
    rating: 0,
    documents: { aadhaarFront: 'aadhaar-front.jpg', aadhaarBack: 'aadhaar-back.jpg', verificationStatus: 'pending' },
    stats: { totalTasks: 0, completedTasks: 0, avgCompletionTime: 0, onTimeRate: 0 },
    createdAt: '2024-03-25T10:00:00Z',
  },
  {
    id: 'tech-005',
    userId: 'user-tech-005',
    fullName: 'Vikram Singh',
    mobile: '+91 98765 43214',
    email: 'vikram.singh@email.com',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    skills: ['Plumbing', 'Electrical', 'General'],
    serviceZone: 'East Mumbai',
    status: 'active',
    rating: 4.5,
    documents: { verificationStatus: 'verified' },
    stats: { totalTasks: 98, completedTasks: 94, avgCompletionTime: 48, onTimeRate: 91 },
    currentLocation: { lat: 19.045, lng: 72.890 },
    createdAt: '2024-02-05T10:00:00Z',
  },
];

const today = new Date().toISOString().split('T')[0];

const initialTasks: Task[] = [
  {
    id: 'task-001',
    title: 'AC Not Cooling - Room 101',
    description: 'Split AC unit in conference room not cooling properly. Customer reports warm air blowing.',
    clientName: 'Tech Corp Solutions',
    clientPhone: '+91 22 1234 5678',
    location: { address: '101, Tech Park, Andheri East, Mumbai 400069', lat: 19.113, lng: 72.869 },
    category: 'AC Repair',
    priority: 'high',
    status: 'in_progress',
    scheduledDate: today,
    scheduledTime: '10:00',
    estimatedDuration: 60,
    assignedTechnicianId: 'tech-001',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
      { status: 'accepted', timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString() },
      { status: 'in_progress', timestamp: new Date(Date.now() - 1800000).toISOString(), note: 'Technician arrived at location' },
    ],
    materials: [],
    timeExtensions: [],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'task-002',
    title: 'Water Leakage in Bathroom',
    description: 'Tap in master bathroom leaking continuously. Water dripping under sink.',
    clientName: 'John Dsouza',
    clientPhone: '+91 22 9876 5432',
    location: { address: 'Flat 502, Sunrise Apartments, Bandra West, Mumbai 400050', lat: 19.054, lng: 72.840 },
    category: 'Plumbing',
    priority: 'medium',
    status: 'accepted',
    scheduledDate: today,
    scheduledTime: '14:00',
    estimatedDuration: 60,
    assignedTechnicianId: 'tech-002',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { status: 'accepted', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
    materials: [],
    timeExtensions: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'task-003',
    title: 'Wiring Issue - Office Floor 3',
    description: 'Multiple power outlets not working on floor 3. Possible wiring fault.',
    clientName: 'Global Services Ltd',
    clientPhone: '+91 22 5555 6666',
    location: { address: 'Floor 3, Business Center, Worli, Mumbai 400018', lat: 18.998, lng: 72.818 },
    category: 'Electrical',
    priority: 'urgent',
    status: 'pending',
    scheduledDate: today,
    scheduledTime: '16:00',
    estimatedDuration: 90,
    assignedTechnicianId: 'tech-003',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 1800000).toISOString() },
    ],
    materials: [],
    timeExtensions: [],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'task-004',
    title: 'Refrigerator Not Working',
    description: 'Samsung double-door fridge not cooling. Lights are on but compressor not running.',
    clientName: 'Maria Fernandez',
    clientPhone: '+91 98 7654 3210',
    location: { address: 'A-12, Green Park CHS, Powai, Mumbai 400076', lat: 19.117, lng: 72.897 },
    category: 'Appliance Repair',
    priority: 'high',
    status: 'completed',
    scheduledDate: today,
    scheduledTime: '09:00',
    estimatedDuration: 60,
    assignedTechnicianId: 'tech-005',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'accepted', timestamp: new Date(Date.now() - 86400000 + 1800000).toISOString() },
      { status: 'in_progress', timestamp: new Date(Date.now() - 28800000).toISOString() },
      { status: 'completed', timestamp: new Date(Date.now() - 25200000).toISOString(), note: 'Replaced faulty compressor. Cooling restored.' },
    ],
    materials: [{
      id: 'mat-001',
      taskId: 'task-004',
      technicianId: 'tech-005',
      itemName: 'Compressor',
      quantity: 1,
      unit: 'piece',
      estimatedCost: 8500,
      justification: 'Original compressor faulty',
      status: 'approved',
      approvedQuantity: 1,
      createdAt: new Date(Date.now() - 27000000).toISOString(),
      resolvedAt: new Date(Date.now() - 26000000).toISOString(),
    }],
    closure: {
      summary: 'Replaced the faulty compressor with a new one. Refrigerator is now cooling properly.',
      materialsUsed: ['Compressor', 'Refrigerant gas', 'Connectors'],
      beforePhotos: ['before-1.jpg'],
      afterPhotos: ['after-1.jpg'],
      clientSignature: 'signature-1.png',
      completedAt: new Date(Date.now() - 25200000).toISOString(),
    },
    timeExtensions: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    id: 'task-005',
    title: 'AC Installation - New Office',
    description: 'Install 3 new split AC units in newly constructed office space.',
    clientName: 'StartUp Hub',
    clientPhone: '+91 22 3333 4444',
    location: { address: 'Unit 7, Innovation Center, Malad West, Mumbai 400064', lat: 19.187, lng: 72.849 },
    category: 'AC Repair',
    priority: 'low',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '10:00',
    estimatedDuration: 180,
    assignedTechnicianId: 'tech-001',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    ],
    materials: [],
    timeExtensions: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-006',
    title: 'Geyser Repair',
    description: 'Water heater not heating water. Pilot light issue suspected.',
    clientName: 'Ramesh Iyer',
    clientPhone: '+91 98 7654 3211',
    location: { address: 'Flat 201, Harmony Towers, Kandivali East, Mumbai 400101', lat: 19.205, lng: 72.867 },
    category: 'Plumbing',
    priority: 'medium',
    status: 'overdue',
    scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    scheduledTime: '11:00',
    estimatedDuration: 60,
    assignedTechnicianId: 'tech-002',
    timeline: [
      { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { status: 'accepted', timestamp: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString() },
      { status: 'in_progress', timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString() },
    ],
    materials: [{
      id: 'mat-002',
      taskId: 'task-006',
      technicianId: 'tech-002',
      itemName: 'Thermostat',
      quantity: 1,
      unit: 'piece',
      estimatedCost: 1200,
      justification: 'Faulty thermostat needs replacement',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    }],
    timeExtensions: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const initialRequirements: ClientRequirement[] = [
  {
    id: 'req-001',
    clientName: 'Alpha Industries',
    clientPhone: '+91 22 1111 2222',
    serviceType: 'Electrical',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredTime: '14:00',
    description: 'Need annual electrical safety inspection for our manufacturing unit.',
    attachments: [],
    status: 'new',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'req-002',
    clientName: 'Beta Healthcare',
    clientPhone: '+91 22 3333 4444',
    serviceType: 'AC Repair',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '09:00',
    description: 'Multiple AC units in patient rooms showing error codes. Need immediate attention.',
    attachments: [],
    status: 'new',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'req-003',
    clientName: 'Gamma Solutions',
    clientPhone: '+91 98 7654 5678',
    serviceType: 'Plumbing',
    preferredDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    preferredTime: '11:00',
    description: 'Sewage pipe blockage in basement. Water backup observed.',
    attachments: ['photo-1.jpg'],
    status: 'new',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

const initialFeedbacks: Feedback[] = [
  {
    id: 'fb-001',
    taskId: 'task-004',
    technicianId: 'tech-005',
    clientName: 'Maria Fernandez',
    rating: 5,
    comment: 'Excellent service! Very professional and completed the work quickly.',
    sentiment: 'positive',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'fb-002',
    taskId: 'task-003',
    technicianId: 'tech-001',
    clientName: 'Raj Mehta',
    rating: 4,
    comment: 'Good work but took longer than expected.',
    sentiment: 'positive',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'fb-003',
    taskId: 'task-002',
    technicianId: 'tech-003',
    clientName: 'Sunita Rao',
    rating: 3,
    comment: 'Work was done but technician was late.',
    sentiment: 'neutral',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const initialNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'task',
    title: 'New Task Assigned',
    message: 'AC Not Cooling - Room 101 has been assigned to Rajesh Kumar',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'notif-002',
    type: 'material',
    title: 'Material Request',
    message: 'Vikram Singh has requested approval for Thermostat',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-003',
    type: 'alert',
    title: 'Task Overdue',
    message: 'Geyser Repair task is past its scheduled time',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'notif-004',
    type: 'requirement',
    title: 'New Requirement',
    message: 'Alpha Industries has submitted a new service request',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    actorId: 'admin-001',
    actorName: 'Admin User',
    actorRole: 'admin',
    action: 'created_task',
    entityType: 'task',
    entityId: 'task-001',
    after: { title: 'AC Not Cooling - Room 101', status: 'pending' },
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'log-002',
    actorId: 'admin-001',
    actorName: 'Admin User',
    actorRole: 'admin',
    action: 'assigned_task',
    entityType: 'task',
    entityId: 'task-001',
    after: { assignedTechnicianId: 'tech-001' },
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'log-003',
    actorId: 'tech-001',
    actorName: 'Rajesh Kumar',
    actorRole: 'technician',
    action: 'accepted_task',
    entityType: 'task',
    entityId: 'task-001',
    after: { status: 'accepted' },
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
];

const initialMaterials: MaterialRequest[] = [
  {
    id: 'mat-001',
    taskId: 'task-004',
    technicianId: 'tech-005',
    itemName: 'Compressor',
    quantity: 1,
    unit: 'piece',
    estimatedCost: 8500,
    justification: 'Original compressor faulty',
    status: 'approved',
    approvedQuantity: 1,
    createdAt: new Date(Date.now() - 27000000).toISOString(),
    resolvedAt: new Date(Date.now() - 26000000).toISOString(),
  },
  {
    id: 'mat-002',
    taskId: 'task-006',
    technicianId: 'tech-002',
    itemName: 'Thermostat',
    quantity: 1,
    unit: 'piece',
    estimatedCost: 1200,
    justification: 'Faulty thermostat needs replacement',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mat-003',
    taskId: 'task-001',
    technicianId: 'tech-001',
    itemName: 'Refrigerant Gas R410A',
    quantity: 2,
    unit: 'kg',
    estimatedCost: 2000,
    justification: 'Low refrigerant levels detected',
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

const initialWhatsappMessages: WhatsAppMessage[] = [
  {
    id: 'wa-001',
    clientId: 'client-001',
    clientName: 'Tech Corp Solutions',
    content: 'Your service request has been received. Technician Rajesh Kumar will visit on ' + today + ' at 10:00 AM.',
    type: 'template',
    templateName: 'service_confirmed',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'wa-002',
    clientId: 'client-001',
    clientName: 'Tech Corp Solutions',
    content: 'Your technician Rajesh Kumar is on the way. ETA: 15 minutes.',
    type: 'template',
    templateName: 'technician_en_route',
    status: 'delivered',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'wa-003',
    clientId: 'client-002',
    clientName: 'John Dsouza',
    content: 'Thank you for choosing our service. Your appointment is confirmed for ' + today + ' at 2:00 PM.',
    type: 'template',
    templateName: 'appointment_confirmed',
    status: 'read',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      technicians: initialTechnicians,
      tasks: initialTasks,
      requirements: initialRequirements,
      feedbacks: initialFeedbacks,
      notifications: initialNotifications,
      auditLogs: initialAuditLogs,
      materials: initialMaterials,
      whatsappMessages: initialWhatsappMessages,
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

      simulateShopifyWebhook: () => {
        const orderId = `SHOP-${Math.floor(Math.random() * 10000)}`;
        const newTask: Task = {
          id: generateId(),
          title: `Shopify Booking - ${orderId}`,
          description: 'AC Servicing and Filter Replacement',
          clientName: 'Rahul Verma',
          clientEmail: 'rahul.v@email.com',
          clientPhone: '+91 98765 00001',
          location: {
            address: '101, Horizon Towers',
            city: 'Mumbai',
            pinCode: '400050',
            lat: 19.054,
            lng: 72.840,
          },
          category: 'AC Repair',
          priority: 'medium',
          status: 'new',
          scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          scheduledTime: '10:00',
          estimatedDuration: 60,
          assignedTechnicianId: '',
          timeline: [{ status: 'new', timestamp: new Date().toISOString() }],
          materials: [],
          timeExtensions: [],
          shopifyOrderId: orderId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => {
          const newNotif: Notification = {
            id: generateId(),
            type: 'task',
            title: 'New Shopify Booking',
            message: `Order ${orderId} received for AC Repair.`,
            read: false,
            createdAt: new Date().toISOString(),
          };
          return { 
            tasks: [newTask, ...state.tasks],
            notifications: [newNotif, ...state.notifications]
          };
        });

        // Also try to persist to cloud (fire-and-forget)
        import('../services/amplifyDataService').then(({ createCloudTask }) => {
          createCloudTask({
            title: newTask.title,
            description: newTask.description,
            category: newTask.category,
            priority: newTask.priority,
            status: 'new',
            shopifyOrderId: orderId,
            clientName: newTask.clientName,
            clientPhone: newTask.clientPhone,
            clientEmail: newTask.clientEmail || '',
            address: newTask.location.address,
            city: newTask.location.city || '',
            pinCode: newTask.location.pinCode || '',
            zone: 'Unassigned',
            scheduledTimestamp: newTask.scheduledDate,
          }).catch(console.error);
        }).catch(() => {});
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
    { name: 'fsm-app-state' }
  )
);
