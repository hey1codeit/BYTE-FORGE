import { Complaint, ComplaintPriority, ComplaintCategory, ComplaintStatus, AuditBlock } from '../types';
import { createGenesisBlock, appendAuditBlock } from './crypto';
import { calculateSlaDeadline, getSlaHoursForPriority } from './stateMachine';

const STORAGE_KEY = 'raisovoice_mnnit_complaints_v1';

// Initial realistic seed complaints for Webster 2026 Hackathon (MNNIT Allahabad)
function generateSeedComplaints(): Complaint[] {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
  const hoursFromNow = (h: number) => new Date(now + h * 60 * 60 * 1000).toISOString();

  // Complaint 1: In Review
  const c1Base: Omit<Complaint, 'auditChain'> = {
    id: 'RV-2026-1001',
    trackingCode: 'VSH-7892-R1',
    category: 'Hostel & Accommodation',
    subject: 'Severe water seepage and broken geyser in Raman Hostel 2nd floor',
    description: 'During winter mornings, the 2nd floor washroom geysers in Raman Hostel have completely stopped heating, causing heavy inconvenience. Additionally, persistent ceiling water seepage is causing an electric hazard near switchboard #4.',
    location: 'Raman Hostel, Block B, 2nd Floor Washroom',
    priority: 'Urgent',
    isAnonymous: true,
    status: 'In Review',
    department: 'Chief Warden Office / Hostel Maintenance',
    assignedOfficer: 'Dr. R. K. Srivastava (Warden, Raman Hostel)',
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(4),
    slaDeadline: hoursFromNow(6), // 6 hours remaining out of 24
    slaHours: 24,
    isEscalated: false,
    attachmentName: 'geyser_leakage_block_b.jpg',
  };
  const c1Genesis = createGenesisBlock(c1Base);
  const c1Assigned = appendAuditBlock(
    [c1Genesis],
    'Department Assigned',
    'Administrative Triage Bot',
    'Admin',
    'Assigned',
    'Ticket categorized as Urgent Infrastructure. Assigned to Chief Warden Office and Estate Maintenance Cell.',
    'Chief Warden Office / Hostel Maintenance'
  );
  const c1InReview = appendAuditBlock(
    c1Assigned,
    'Physical Inspection Underway',
    'Dr. R. K. Srivastava (Warden)',
    'Department Head',
    'In Review',
    'Plumber and electrician inspected the geyser element on 2nd floor. Replacement heating coils requisitioned from central store.',
    'Chief Warden Office / Hostel Maintenance'
  );
  const c1: Complaint = { ...c1Base, auditChain: c1InReview };

  // Complaint 2: Overdue & Escalated
  const c2Base: Omit<Complaint, 'auditChain'> = {
    id: 'RV-2026-1002',
    trackingCode: 'VSH-4421-E9',
    category: 'Mess & Food Quality',
    subject: 'Unsanitary food preparation and insect found in Tilak Hostel mess dal',
    description: 'During lunch service today, multiple students noticed substandard quality oil and found insects in the dal container. Mess workers were not wearing gloves or hair nets. Repeated complaints to mess contractor were dismissed with hostility.',
    location: 'Tilak Hostel Mess Dining Hall',
    priority: 'Urgent',
    isAnonymous: true,
    status: 'Escalated',
    department: 'Dean of Student Welfare (DSW) & Mess Committee',
    assignedOfficer: 'Chief Proctor & DSW Office',
    createdAt: hoursAgo(36),
    updatedAt: hoursAgo(12),
    slaDeadline: hoursAgo(12), // Expired 12 hours ago!
    slaHours: 24,
    isEscalated: true,
    attachmentName: 'mess_dal_photo.jpg',
  };
  const c2Genesis = createGenesisBlock(c2Base);
  const c2Assigned = appendAuditBlock(
    [c2Genesis],
    'Assigned to Mess Warden',
    'Student Welfare Portal',
    'Admin',
    'Assigned',
    'Forwarded to Mess Committee Warden for immediate vendor inspection.',
    'Mess Management Committee'
  );
  const c2Escalated = appendAuditBlock(
    c2Assigned,
    'Automated SLA Escalation',
    'SLA Monitor Daemon',
    'Automated SLA System',
    'Escalated',
    'SLA timer expired (24h SLA breached). No resolution logged by hostel mess manager. Complaint escalated directly to Dean of Student Welfare (DSW) and Chief Proctor.',
    'Dean of Student Welfare (DSW)'
  );
  const c2: Complaint = { ...c2Base, auditChain: c2Escalated };

  // Complaint 3: Resolved
  const c3Base: Omit<Complaint, 'auditChain'> = {
    id: 'RV-2026-1003',
    trackingCode: 'VSH-9011-L4',
    category: 'Internet & LAN',
    subject: 'Central Library 3rd Floor Wi-Fi access points repeatedly dropping connections',
    description: 'The Wi-Fi access points (MNNIT-CAMPUS-AP302 and AP303) in the 3rd-floor reference hall drop packet connections every 2 minutes, preventing students from accessing IEEE papers and research journals.',
    location: 'Central Library, 3rd Floor Reference Section',
    priority: 'Medium',
    isAnonymous: false,
    studentName: 'Aarav Patel',
    studentRegNo: '20244109',
    studentEmail: 'aarav.20244109@mnnit.ac.in',
    status: 'Resolved',
    department: 'Computer Center (CC) & Network Operations',
    assignedOfficer: 'Er. S. Mishra (Network Engineer)',
    createdAt: hoursAgo(72),
    updatedAt: hoursAgo(6),
    slaDeadline: hoursAgo(0),
    slaHours: 72,
    isEscalated: false,
    resolutionNotes: 'Cisco PoE switch port #18 was malfunctioning. Firmware upgraded and secondary uplink configured. Latency stabilized under 8ms.',
    resolvedAt: hoursAgo(6),
  };
  const c3Genesis = createGenesisBlock(c3Base);
  const c3Assigned = appendAuditBlock(
    [c3Genesis],
    'Assigned to Computer Center',
    'IT Helpdesk Admin',
    'Admin',
    'Assigned',
    'Ticket routed to Computer Center Network Operations Center (NOC).',
    'Computer Center (CC)'
  );
  const c3InReview = appendAuditBlock(
    c3Assigned,
    'Diagnostic Tracing',
    'Er. S. Mishra',
    'Department Head',
    'In Review',
    'Conducted RF spectrum scan and verified switch port packet drops on VLAN 104.',
    'Computer Center (CC)'
  );
  const c3Resolved = appendAuditBlock(
    c3InReview,
    'Issue Fully Resolved & Verified',
    'Er. S. Mishra',
    'Department Head',
    'Resolved',
    'Replaced switch module and validated bandwidth throughput with student representative. 100 Mbps stable connectivity confirmed.',
    'Computer Center (CC)'
  );
  const c3: Complaint = { ...c3Base, auditChain: c3Resolved };

  // Complaint 4: Filed (Fresh)
  const c4Base: Omit<Complaint, 'auditChain'> = {
    id: 'RV-2026-1004',
    trackingCode: 'VSH-1109-P3',
    category: 'Campus Infrastructure',
    subject: 'Complete lighting blackout on academic pathway near Ganga Gate',
    description: 'Three consecutive high-mast solar lamps between Ganga Gate and Dean Academics building have failed. The stretch is pitch dark after 7:30 PM, creating significant safety hazard for girl students returning from computer lab.',
    location: 'Academic Corridor between Ganga Gate and Dean Office',
    priority: 'High',
    isAnonymous: true,
    status: 'Filed',
    department: 'Estate & Electrical Maintenance Section',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    slaDeadline: hoursFromNow(43), // 43 hours left out of 48
    slaHours: 48,
    isEscalated: false,
  };
  const c4Genesis = createGenesisBlock(c4Base);
  const c4: Complaint = { ...c4Base, auditChain: [c4Genesis] };

  // Complaint 5: Assigned
  const c5Base: Omit<Complaint, 'auditChain'> = {
    id: 'RV-2026-1005',
    trackingCode: 'VSH-3382-M7',
    category: 'Academics & Examination',
    subject: 'Discrepancy in Mid-Sem Answer Sheet re-evaluation portal submission',
    description: 'The ERP portal froze while submitting re-evaluation requests for Engineering Thermodynamics (ME-1301). Transaction fee was debited from bank but application displays "Unsubmitted Error 502".',
    location: 'Dean Academics / Examination Cell',
    priority: 'High',
    isAnonymous: false,
    studentName: 'Priya Verma',
    studentRegNo: '20251142',
    studentEmail: 'priya.20251142@mnnit.ac.in',
    status: 'Assigned',
    department: 'Examination Section / ERP Team',
    assignedOfficer: 'Assistant Registrar (Examinations)',
    createdAt: hoursAgo(15),
    updatedAt: hoursAgo(8),
    slaDeadline: hoursFromNow(33),
    slaHours: 48,
    isEscalated: false,
  };
  const c5Genesis = createGenesisBlock(c5Base);
  const c5Assigned = appendAuditBlock(
    [c5Genesis],
    'Assigned to Examination Section',
    'Academic Registrar Office',
    'Admin',
    'Assigned',
    'ERP transaction reference #TXN98104 forwarded to finance and examination database administrator for reconciliation.',
    'Examination Section'
  );
  const c5: Complaint = { ...c5Base, auditChain: c5Assigned };

  return [c1, c2, c3, c4, c5];
}

// In-memory cache for server rendering & fallback
let memoryStore: Complaint[] | null = null;

export function getStoredComplaints(): Complaint[] {
  if (typeof window === 'undefined') {
    if (!memoryStore) {
      memoryStore = generateSeedComplaints();
    }
    return memoryStore;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateSeedComplaints();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading from localStorage, using memory seed:', err);
    if (!memoryStore) memoryStore = generateSeedComplaints();
    return memoryStore;
  }
}

export function saveComplaints(complaints: Complaint[]): void {
  memoryStore = complaints;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }
}

export function getComplaintById(id: string): Complaint | undefined {
  const complaints = getStoredComplaints();
  return complaints.find(c => c.id.toUpperCase() === id.toUpperCase());
}

export function getComplaintByTracking(id: string, trackingCode: string): Complaint | undefined {
  const complaints = getStoredComplaints();
  return complaints.find(
    c =>
      c.id.trim().toUpperCase() === id.trim().toUpperCase() &&
      c.trackingCode.trim().toUpperCase() === trackingCode.trim().toUpperCase()
  );
}

export function generateUniqueIds(): { ticketId: string; trackingCode: string } {
  const complaints = getStoredComplaints();
  const nextNum = 1000 + complaints.length + 1;
  const ticketId = `RV-2026-${nextNum}`;
  
  // Generate random tracking code: VSH-XXXX-YY
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand1 = '';
  let rand2 = '';
  for (let i = 0; i < 4; i++) rand1 += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 2; i++) rand2 += chars[Math.floor(Math.random() * chars.length)];
  const trackingCode = `VSH-${rand1}-${rand2}`;

  return { ticketId, trackingCode };
}

export function createComplaint(payload: {
  category: ComplaintCategory;
  subject: string;
  description: string;
  location?: string;
  priority: ComplaintPriority;
  isAnonymous: boolean;
  studentName?: string;
  studentRegNo?: string;
  studentEmail?: string;
  department?: string;
  attachmentName?: string;
}): Complaint {
  const { ticketId, trackingCode } = generateUniqueIds();
  const now = new Date().toISOString();
  const slaHours = getSlaHoursForPriority(payload.priority);
  const slaDeadline = calculateSlaDeadline(payload.priority);

  const defaultDept = payload.department || getDefaultDepartment(payload.category);

  const complaintBase: Omit<Complaint, 'auditChain'> = {
    id: ticketId,
    trackingCode,
    category: payload.category,
    subject: payload.subject,
    description: payload.description,
    location: payload.location,
    priority: payload.priority,
    isAnonymous: payload.isAnonymous,
    studentName: payload.isAnonymous ? undefined : payload.studentName,
    studentRegNo: payload.isAnonymous ? undefined : payload.studentRegNo,
    studentEmail: payload.isAnonymous ? undefined : payload.studentEmail,
    status: 'Filed',
    department: defaultDept,
    createdAt: now,
    updatedAt: now,
    slaDeadline,
    slaHours,
    isEscalated: false,
    attachmentName: payload.attachmentName,
  };

  const genesisBlock = createGenesisBlock(complaintBase);
  const newComplaint: Complaint = {
    ...complaintBase,
    auditChain: [genesisBlock],
  };

  const current = getStoredComplaints();
  saveComplaints([newComplaint, ...current]);
  return newComplaint;
}

export function updateComplaint(
  id: string,
  newStatus: ComplaintStatus,
  actor: string,
  actorRole: 'Student' | 'Admin' | 'Automated SLA System' | 'Department Head',
  notes: string,
  department?: string,
  assignedOfficer?: string
): Complaint | null {
  const list = getStoredComplaints();
  const index = list.findIndex(c => c.id.toUpperCase() === id.toUpperCase());
  if (index === -1) return null;

  const target = list[index];
  const updatedChain = appendAuditBlock(
    target.auditChain,
    `Status transitioned to ${newStatus}`,
    actor,
    actorRole,
    newStatus,
    notes,
    department || target.department
  );

  const updatedComplaint: Complaint = {
    ...target,
    status: newStatus,
    department: department || target.department,
    assignedOfficer: assignedOfficer || target.assignedOfficer,
    updatedAt: new Date().toISOString(),
    isEscalated: newStatus === 'Escalated' ? true : target.isEscalated,
    resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : target.resolvedAt,
    resolutionNotes: newStatus === 'Resolved' ? notes : target.resolutionNotes,
    auditChain: updatedChain,
  };

  list[index] = updatedComplaint;
  saveComplaints([...list]);
  return updatedComplaint;
}

/**
 * Fast forward / auto-escalate ticket for hackathon live demo
 */
export function triggerAutoEscalate(id: string): Complaint | null {
  return updateComplaint(
    id,
    'Escalated',
    'Automated SLA Daemon',
    'Automated SLA System',
    'SLA expired without timely resolution. Auto-escalated to higher administrative authority (Dean Student Welfare / Director Office).',
    'Dean of Student Welfare (DSW)'
  );
}

/**
 * Live demonstration of tamper detection:
 * Deliberately alters the text of an existing block without recalculating subsequent SHA256 hashes.
 */
export function simulateTamperBlock(id: string, blockIndex: number, maliciousNote: string): boolean {
  const list = getStoredComplaints();
  const target = list.find(c => c.id.toUpperCase() === id.toUpperCase());
  if (!target || !target.auditChain[blockIndex]) return false;

  target.auditChain[blockIndex].notes = maliciousNote;
  saveComplaints([...list]);
  return true;
}

/**
 * Reset data back to default clean demo state
 */
export function resetToSeedComplaints(): Complaint[] {
  const initial = generateSeedComplaints();
  saveComplaints(initial);
  return initial;
}

/**
 * Duplicate detection algorithm:
 * Matches keywords against active complaints in the same category
 */
export function findSimilarComplaints(category: ComplaintCategory, subject: string): Complaint[] {
  if (!subject || subject.trim().length < 4) return [];
  const words = subject.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) return [];

  const list = getStoredComplaints();
  return list.filter(c => {
    if (c.status === 'Resolved') return false;
    const sameCat = c.category === category;
    const subLower = c.subject.toLowerCase();
    const matchCount = words.filter(w => subLower.includes(w)).length;
    return (sameCat && matchCount >= 1) || matchCount >= 2;
  });
}

export function getDefaultDepartment(category: ComplaintCategory): string {
  switch (category) {
    case 'Hostel & Accommodation':
      return 'Chief Warden Office / Hostel Maintenance';
    case 'Mess & Food Quality':
      return 'Mess Management Committee & DSW';
    case 'Academics & Examination':
      return 'Dean Academics / Examination Section';
    case 'Campus Infrastructure':
      return 'Estate & Civil Maintenance Cell';
    case 'Internet & LAN':
      return 'Computer Center (CC) & Network Operations';
    case 'Sanitation & Hygiene':
      return 'Chief Sanitation Inspector Office';
    case 'Proctorial & Safety':
      return 'Chief Proctorial Board & Security';
    case 'Administration & Fees':
      return 'Registrar Office / Accounts Section';
    default:
      return 'Student Grievance Redressal Cell';
  }
}
