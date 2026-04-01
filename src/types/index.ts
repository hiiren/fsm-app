export type UserRole = 'admin' | 'technician' | 'super_admin' | 'operations_admin' | 'finance_admin';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  drivingLicense?: string;
}

export type TechnicianStatus = 'active' | 'inactive' | 'pending_verification';
export type VerificationStatus = 'verified' | 'pending' | 'rejected';

export interface TechnicianDocuments {
  aadhaarFront?: string;
  aadhaarBack?: string;
  pan?: string;
  drivingLicense?: string;
  verificationStatus: VerificationStatus;
}

export interface TechnicianStats {
  totalTasks: number;
  completedTasks: number;
  avgCompletionTime: number;
  onTimeRate: number;
}

export interface Technician {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email?: string;
  profilePhoto?: string;
  skills: string[];
  serviceZone: string;
  status: TechnicianStatus;
  rating: number;
  documents: TechnicianDocuments;
  stats: TechnicianStats;
  currentLocation?: { lat: number; lng: number };
  createdAt: string;
}

export type TaskStatus = 'new' | 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskLocation {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  pinCode?: string;
}

export interface TimelineEntry {
  status: TaskStatus;
  timestamp: string;
  note?: string;
}

export interface MaterialRequest {
  id: string;
  taskId: string;
  technicianId: string;
  itemName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  justification: string;
  status: 'pending' | 'approved' | 'partial' | 'rejected';
  approvedQuantity?: number;
  rejectionReason?: string;
  procurementNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface TaskClosure {
  summary: string;
  materialsUsed: string[];
  beforePhotos: string[];
  afterPhotos: string[];
  clientSignature: string;
  completedAt: string;
}

export interface TimeExtension {
  id: string;
  taskId: string;
  requestedTime: number;
  reason: string;
  proof?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  location: TaskLocation;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  assignedTechnicianId: string;
  timeline: TimelineEntry[];
  materials: MaterialRequest[];
  closure?: TaskClosure;
  timeExtensions: TimeExtension[];
  shopifyOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export type RequirementStatus = 'new' | 'accepted' | 'rejected' | 'info_requested';

export interface ClientRequirement {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
  attachments: string[];
  status: RequirementStatus;
  rejectionReason?: string;
  createdAt: string;
}

export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

export interface Feedback {
  id: string;
  taskId: string;
  technicianId: string;
  clientName: string;
  rating: number;
  comment?: string;
  sentiment: FeedbackSentiment;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'requirement' | 'task' | 'material' | 'document' | 'alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface WhatsAppMessage {
  id: string;
  clientId: string;
  clientName: string;
  content: string;
  type: 'template' | 'custom';
  templateName?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  timestamp: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  zone?: string;
}

export interface Leave {
  id: string;
  technicianId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  errorMessage: string;
  stackTrace: string;
  userId?: string;
  pageName: string;
  source: 'dashboard' | 'tech-tasks';
}
