/**
 * RaisoVoice Data Management Engine
 * Connects Frontend (HTML/CSS/JS) to Backend (Prisma ORM + SQL Database)
 * With client-side caching & instant offline resilience.
 * Webster 2026 Hackathon | Team ByteForge (ID: 198) | MNNIT Allahabad
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'raisovoice_mnnit_complaints_v1';
  const API_BASE =
    typeof window !== 'undefined' &&
    window.location.protocol.startsWith('http') &&
    window.location.port === '3000'
      ? '/api'
      : 'http://localhost:3000/api';

  function generateSeedComplaints() {
    const now = Date.now();
    const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();
    const hoursFromNow = (h) => new Date(now + h * 60 * 60 * 1000).toISOString();

    // 1. Complaint 1: In Review (Raman Hostel Geyser & Seepage)
    const c1Base = {
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
      slaDeadline: hoursFromNow(6),
      slaHours: 24,
      isEscalated: false,
      attachmentName: 'geyser_leakage_block_b.jpg',
    };
    const c1Genesis = window.CryptoAudit.createGenesisBlock(c1Base);
    const c1Assigned = window.CryptoAudit.appendAuditBlock(
      [c1Genesis],
      'Department Assigned',
      'Administrative Triage Bot',
      'Admin',
      'Assigned',
      'Ticket categorized as Urgent Infrastructure. Assigned to Chief Warden Office and Estate Maintenance Cell.',
      'Chief Warden Office / Hostel Maintenance'
    );
    const c1InReview = window.CryptoAudit.appendAuditBlock(
      c1Assigned,
      'Physical Inspection Underway',
      'Dr. R. K. Srivastava (Warden)',
      'Department Head',
      'In Review',
      'Plumber and electrician inspected the geyser element on 2nd floor. Replacement heating coils requisitioned from central store.',
      'Chief Warden Office / Hostel Maintenance'
    );
    const c1 = { ...c1Base, auditChain: c1InReview };

    // 2. Complaint 2: Overdue & Auto-Escalated (Tilak Hostel Mess Dal Hygiene)
    const c2Base = {
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
      slaDeadline: hoursAgo(12),
      slaHours: 24,
      isEscalated: true,
      attachmentName: 'mess_dal_photo.jpg',
    };
    const c2Genesis = window.CryptoAudit.createGenesisBlock(c2Base);
    const c2Assigned = window.CryptoAudit.appendAuditBlock(
      [c2Genesis],
      'Assigned to Mess Warden',
      'Student Welfare Portal',
      'Admin',
      'Assigned',
      'Forwarded to Mess Committee Warden for immediate vendor inspection.',
      'Mess Management Committee & DSW'
    );
    const c2Escalated = window.CryptoAudit.appendAuditBlock(
      c2Assigned,
      'Automated SLA Escalation',
      'SLA Monitor Daemon',
      'Automated SLA System',
      'Escalated',
      'SLA timer expired (24h SLA breached). No resolution logged by hostel mess manager. Complaint escalated directly to Dean of Student Welfare (DSW) and Chief Proctor.',
      'Dean of Student Welfare (DSW) & Mess Committee'
    );
    const c2 = { ...c2Base, auditChain: c2Escalated };

    // 3. Complaint 3: Resolved (Library Wi-Fi Connectivity)
    const c3Base = {
      id: 'RV-2026-1003',
      trackingCode: 'VSH-1109-W4',
      category: 'Internet & LAN',
      subject: 'Central Library 1st Floor Wi-Fi Access Points Disconnecting Constantly',
      description: 'During peak preparation hours (5 PM to 10 PM), students on the 1st floor reading hall lose connection to MNNIT-WiFi every 3-5 minutes with DNS resolution timeouts.',
      location: 'Central Library, 1st Floor Reading Hall',
      priority: 'Medium',
      isAnonymous: false,
      studentName: 'Ayush Verma',
      studentRegNo: '20264012',
      studentEmail: 'ayush.20264012@mnnit.ac.in',
      status: 'Resolved',
      department: 'Computer Center (CC) & Network Operations',
      assignedOfficer: 'Er. Sandeep Mishra (Network Admin, CC)',
      createdAt: hoursAgo(54),
      updatedAt: hoursAgo(8),
      slaDeadline: hoursAgo(6),
      slaHours: 72,
      isEscalated: false,
      resolutionNotes: 'Expanded DHCP pool to /21 and replaced PoE injector on AP-LIB-104. Verified 180 concurrent devices with 0 packet drops.',
      resolvedAt: hoursAgo(8),
    };
    const c3Genesis = window.CryptoAudit.createGenesisBlock(c3Base);
    const c3Assigned = window.CryptoAudit.appendAuditBlock(
      [c3Genesis],
      'Assigned to CC Network NOC',
      'Helpdesk Dispatcher',
      'Admin',
      'Assigned',
      'Referred to Er. Sandeep Mishra for Cisco AP reboot and channel re-allocation.',
      'Computer Center (CC) & Network Operations'
    );
    const c3InReview = window.CryptoAudit.appendAuditBlock(
      c3Assigned,
      'Channel Re-tuning & DHCP Pool Expansion',
      'Er. Sandeep Mishra',
      'Department Head',
      'In Review',
      'Diagnosed IP lease exhaustion on 172.16.48.0/22 subnet. Expanded DHCP pool to /21 and replaced faulty PoE injector on AP-LIB-104.',
      'Computer Center (CC) & Network Operations'
    );
    const c3Resolved = window.CryptoAudit.appendAuditBlock(
      c3InReview,
      'Grievance Formally Resolved',
      'Head, Computer Center',
      'Department Head',
      'Resolved',
      'Stress-tested with 180 concurrent devices over 6 hours with 0 packet drops. Grievance resolved and sealed on cryptographic ledger.',
      'Computer Center (CC) & Network Operations'
    );
    const c3 = { ...c3Base, auditChain: c3Resolved };

    // 4. Complaint 4: Assigned (Streetlights near Girls Hostel Malviya)
    const c4Base = {
      id: 'RV-2026-1004',
      trackingCode: 'VSH-9031-S2',
      category: 'Proctorial & Safety',
      subject: 'Complete blackout of streetlights along the path behind Malviya Hostel',
      description: 'The three halogen streetlights along the pedestrian corridor connecting Malviya Hostel backgate to the Academic Block have been non-functional for three nights, creating serious safety concerns after dark.',
      location: 'Pedestrian corridor behind Malviya Hostel',
      priority: 'High',
      isAnonymous: true,
      status: 'Assigned',
      department: 'Chief Proctorial Board & Security',
      assignedOfficer: 'Security Officer (Shift In-charge)',
      createdAt: hoursAgo(10),
      updatedAt: hoursAgo(9),
      slaDeadline: hoursFromNow(38),
      slaHours: 48,
      isEscalated: false,
    };
    const c4Genesis = window.CryptoAudit.createGenesisBlock(c4Base);
    const c4Assigned = window.CryptoAudit.appendAuditBlock(
      [c4Genesis],
      'Assigned & Night Patrol Alerted',
      'Chief Proctor Desk',
      'Admin',
      'Assigned',
      'Security guards notified to increase patrols until Estate Electrical team repairs underground cable breaker.',
      'Chief Proctorial Board & Security'
    );
    const c4 = { ...c4Base, auditChain: c4Assigned };

    // 5. Complaint 5: Filed (Classroom Projector LH-3)
    const c5Base = {
      id: 'RV-2026-1005',
      trackingCode: 'VSH-6250-A5',
      category: 'Campus Infrastructure',
      subject: 'Projector display in Lecture Hall Complex LH-3 flickers and shuts down',
      description: 'During Department lectures in LH-3, the central ceiling HDMI projector shuts down every 15 minutes due to thermal overheating indicator flashing red.',
      location: 'Lecture Hall Complex (LHC), Hall LH-3',
      priority: 'Medium',
      isAnonymous: true,
      status: 'Filed',
      department: 'Estate & Civil Maintenance Cell',
      assignedOfficer: 'Pending Assignment',
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
      slaDeadline: hoursFromNow(70),
      slaHours: 72,
      isEscalated: false,
    };
    const c5Genesis = window.CryptoAudit.createGenesisBlock(c5Base);
    const c5 = { ...c5Base, auditChain: [c5Genesis] };

    return [c1, c2, c3, c4, c5];
  }

  function getStoredComplaints() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = generateSeedComplaints();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn('LocalStorage error, fallback to memory seed:', err);
      return generateSeedComplaints();
    }
  }

  function saveComplaints(complaints) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  // Sync state from Prisma SQL backend
  async function syncWithServer() {
    try {
      const res = await fetch(`${API_BASE}/complaints`);
      if (res.ok) {
        const serverComplaints = await res.json();
        if (Array.isArray(serverComplaints) && serverComplaints.length > 0) {
          saveComplaints(serverComplaints);
          return serverComplaints;
        }
      }
    } catch (err) {
      // Backend not running or offline, fallback smoothly to local cache
      console.debug('Prisma SQL API not reachable; operating on client cache mode:', err.message);
    }
    return getStoredComplaints();
  }

  function getComplaintById(id) {
    if (!id) return null;
    const complaints = getStoredComplaints();
    return complaints.find((c) => c.id.toUpperCase() === id.trim().toUpperCase()) || null;
  }

  function getComplaintByTracking(id, trackingCode) {
    if (!id || !trackingCode) return null;
    const complaints = getStoredComplaints();
    return (
      complaints.find(
        (c) =>
          c.id.trim().toUpperCase() === id.trim().toUpperCase() &&
          c.trackingCode.trim().toUpperCase() === trackingCode.trim().toUpperCase()
      ) || null
    );
  }

  function generateUniqueIds() {
    const complaints = getStoredComplaints();
    const nextNum = 1000 + complaints.length + 1;
    const ticketId = `RV-2026-${nextNum}`;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand1 = '';
    let rand2 = '';
    for (let i = 0; i < 4; i++) rand1 += chars[Math.floor(Math.random() * chars.length)];
    for (let i = 0; i < 2; i++) rand2 += chars[Math.floor(Math.random() * chars.length)];
    const trackingCode = `VSH-${rand1}-${rand2}`;

    return { ticketId, trackingCode };
  }

  function createComplaint(payload) {
    const { ticketId, trackingCode } = generateUniqueIds();
    const now = new Date().toISOString();
    const slaHours = window.StateMachine.getSlaHoursForPriority(payload.priority);
    const slaDeadline = window.StateMachine.calculateSlaDeadline(payload.priority);
    const defaultDept = payload.department || window.StateMachine.getDefaultDepartment(payload.category);

    const complaintBase = {
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
      assignedOfficer: 'Pending Assignment',
      createdAt: now,
      updatedAt: now,
      slaDeadline,
      slaHours,
      isEscalated: false,
      attachmentName: payload.attachmentName,
    };

    const genesisBlock = window.CryptoAudit.createGenesisBlock(complaintBase);
    const newComplaint = {
      ...complaintBase,
      auditChain: [genesisBlock],
    };

    const current = getStoredComplaints();
    saveComplaints([newComplaint, ...current]);

    // Asynchronously commit to Prisma SQL Database
    fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.ok ? r.json() : null)
      .then(serverItem => {
        if (serverItem && serverItem.id) {
          console.log('✅ Complaint persisted in Prisma SQL database:', serverItem.id);
        }
      })
      .catch(e => console.debug('Offline sync scheduled for SQL database:', e.message));

    return newComplaint;
  }

  function updateComplaint(id, newStatus, actor, actorRole, notes, department, assignedOfficer) {
    const list = getStoredComplaints();
    const index = list.findIndex((c) => c.id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;

    const target = list[index];
    const updatedChain = window.CryptoAudit.appendAuditBlock(
      target.auditChain,
      `Status transitioned to ${newStatus}`,
      actor,
      actorRole,
      newStatus,
      notes,
      department || target.department
    );

    const updatedComplaint = {
      ...target,
      status: newStatus,
      department: department || target.department,
      assignedOfficer: assignedOfficer !== undefined ? assignedOfficer : target.assignedOfficer,
      updatedAt: new Date().toISOString(),
      isEscalated: newStatus === 'Escalated' ? true : target.isEscalated,
      resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : target.resolvedAt,
      resolutionNotes: newStatus === 'Resolved' ? notes : target.resolutionNotes,
      auditChain: updatedChain,
    };

    list[index] = updatedComplaint;
    saveComplaints([...list]);

    // Sync action with Prisma SQL Database
    const adminToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('raisovoice_admin_token') : null;
    const reqHeaders = { 'Content-Type': 'application/json' };
    if (adminToken) reqHeaders['Authorization'] = `Bearer ${adminToken}`;

    fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/action`, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({
        action: `Status transitioned to ${newStatus}`,
        actor,
        role: actorRole,
        targetStatus: newStatus,
        notes,
        department: department || target.department,
        assignedOfficer: assignedOfficer !== undefined ? assignedOfficer : target.assignedOfficer,
      }),
    })
      .then(r => r.ok ? r.json() : null)
      .catch(e => console.debug('Action offline buffered:', e.message));

    return updatedComplaint;
  }

  function triggerAutoEscalate(id) {
    return updateComplaint(
      id,
      'Escalated',
      'Automated SLA Daemon',
      'Automated SLA System',
      'SLA expired without timely resolution. Auto-escalated to higher administrative authority (Dean Student Welfare / Director Office).',
      'Dean of Student Welfare (DSW) & Mess Committee'
    );
  }

  function simulateTamperBlock(id, blockIndex, maliciousNote) {
    const list = getStoredComplaints();
    const target = list.find((c) => c.id.toUpperCase() === id.toUpperCase());
    if (!target || !target.auditChain || !target.auditChain[blockIndex]) return false;

    target.auditChain[blockIndex].notes = maliciousNote;
    saveComplaints([...list]);

    // Also inject rogue tamper in Prisma SQL database for live judges verification
    fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/tamper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIndex, tamperedNote: maliciousNote }),
    }).catch(e => console.debug('Tamper sync note:', e.message));

    return true;
  }

  function resetToSeedComplaints() {
    const initial = generateSeedComplaints();
    saveComplaints(initial);

    // Call server reset endpoint
    fetch(`${API_BASE}/complaints/reset`, { method: 'POST' })
      .catch(e => console.debug('Reset synced locally:', e.message));

    return initial;
  }

  function findSimilarComplaints(category, subject) {
    if (!subject || subject.trim().length < 4) return [];
    const words = subject
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    if (words.length === 0) return [];

    const list = getStoredComplaints();
    return list.filter((c) => {
      if (c.status === 'Resolved') return false;
      const sameCat = c.category === category;
      const subLower = c.subject.toLowerCase();
      const matchCount = words.filter((w) => subLower.includes(w)).length;
      return (sameCat && matchCount >= 1) || matchCount >= 2;
    });
  }

  // Initialize and auto-sync on page load
  syncWithServer().then(() => {
    // If the active page has a callback or refresh method, trigger it
    if (typeof window.onComplaintsLoaded === 'function') {
      window.onComplaintsLoaded();
    }
  });

  window.ComplaintStorage = {
    getStoredComplaints,
    saveComplaints,
    syncWithServer,
    getComplaintById,
    getComplaintByTracking,
    generateUniqueIds,
    createComplaint,
    updateComplaint,
    triggerAutoEscalate,
    simulateTamperBlock,
    resetToSeedComplaints,
    findSimilarComplaints,
  };
})(window);
