export type ComplaintStatus = 'Filed' | 'Assigned' | 'In Review' | 'Resolved' | 'Escalated';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ComplaintCategory = 
  | 'Hostel & Accommodation'
  | 'Mess & Food Quality'
  | 'Academics & Examination'
  | 'Campus Infrastructure'
  | 'Internet & LAN'
  | 'Sanitation & Hygiene'
  | 'Proctorial & Safety'
  | 'Administration & Fees';

export interface AuditBlock {
  blockNumber: number;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: 'Student' | 'Admin' | 'Automated SLA System' | 'Department Head';
  status: ComplaintStatus;
  department?: string;
  notes: string;
  previousHash: string;
  currentHash: string;
}

export interface Complaint {
  id: string; // e.g., "RV-2026-1042"
  trackingCode: string; // Private key, e.g. "VSH-9281-K9"
  category: ComplaintCategory;
  subject: string;
  description: string;
  location?: string; // e.g. "Raman Hostel, Block C, Room 214"
  priority: ComplaintPriority;
  isAnonymous: boolean;
  studentName?: string;
  studentRegNo?: string;
  studentEmail?: string;
  status: ComplaintStatus;
  department: string;
  assignedOfficer?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string; // ISO string
  slaHours: number;
  isEscalated: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
  attachmentName?: string;
  auditChain: AuditBlock[];
}

export interface DepartmentStats {
  name: string;
  total: number;
  resolved: number;
  avgHours: number;
  slaComplianceRate: number; // percentage
}
