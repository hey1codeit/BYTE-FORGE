/**
 * Prisma SQL Database Seeder for RaisoVoice
 * Seeds authentic MNNIT Allahabad student grievances and SHA-256 cryptographic audit chains.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function calculateGenesisHash(ticket) {
  const payload = [
    ticket.id,
    ticket.category,
    ticket.subject,
    ticket.description,
    ticket.priority,
    ticket.isAnonymous ? 'ANONYMOUS' : `${ticket.studentName}_${ticket.studentRegNo}`,
    ticket.createdAt,
    '0000000000000000000000000000000000000000000000000000000000000000',
  ].join('|');
  return sha256(payload);
}

function calculateBlockHash(prevHash, block) {
  const payload = [
    prevHash,
    block.timestamp,
    block.action,
    block.actor,
    block.status,
    block.notes,
    block.department || '',
  ].join('|');
  return sha256(payload);
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + ':' + salt).digest('hex');
}

// Authorized Administrator Directory seeded in Prisma SQL Database
// Edit IDs and Passwords here; running `npm run seed` or `node prisma/seed.js` will save/update them in SQL.
const admins = [
  {
    id: 'dean_dsw',
    email: 'dean.dsw@mnnit.ac.in',
    name: 'Prof. Rajeev Tripathi',
    role: 'Dean of Student Welfare (DSW)',
    department: 'Dean of Student Welfare (DSW) & Mess Committee',
    salt: 'salt_dean_mnnit_2026',
    password: 'DeanDSW@2026',
  },
  {
    id: 'chief_warden',
    email: 'warden.chief@mnnit.ac.in',
    name: 'Dr. R. K. Srivastava',
    role: 'Chief Warden (Hostel Affairs)',
    department: 'Chief Warden Office / Hostel Maintenance',
    salt: 'salt_warden_mnnit_2026',
    password: 'ChiefWarden@2026',
  },
  {
    id: 'chief_proctor',
    email: 'proctor@mnnit.ac.in',
    name: 'Dr. S. K. Duggal',
    role: 'Chief Proctor',
    department: 'Chief Proctorial Board & Security',
    salt: 'salt_proctor_mnnit_2026',
    password: 'ChiefProctor@2026',
  },
  {
    id: 'admin',
    email: 'admin@mnnit.ac.in',
    name: 'Administrative Triage Cell',
    role: 'Central Intake Officer',
    department: 'Central Triage Cell',
    salt: 'salt_triage_mnnit_2026',
    password: 'Admin@Mnnit2026',
  },
];

/**
 * Save or update an administrator ID and password in the Prisma SQL database.
 * Uses Prisma upsert with cryptographic salting and SHA-256 password hashing.
 *
 * @param {Object} adminData
 * @param {string} adminData.id - Administrator ID (e.g. 'admin', 'dean_dsw')
 * @param {string} adminData.password - Plain-text password to hash and store
 * @param {string} [adminData.email] - Official MNNIT email address
 * @param {string} [adminData.name] - Administrator full name
 * @param {string} [adminData.role] - Administrative role
 * @param {string} [adminData.department] - Associated department
 * @param {string} [adminData.salt] - Optional salt (generated if not provided)
 * @returns {Promise<Object>} The saved or updated AdminAuthority record
 */
async function saveOrUpdateAdmin(adminData) {
  if (!adminData || !adminData.id) {
    throw new Error('Administrator ID is required.');
  }
  if (!adminData.password) {
    throw new Error(`Password is required for administrator "${adminData.id}".`);
  }

  const id = adminData.id.trim();
  const rawPassword = adminData.password.trim();

  // Find existing administrator if already registered
  const existing = await prisma.adminAuthority.findUnique({
    where: { id },
  });

  // Preserve existing salt or generate a secure fresh salt
  const salt = adminData.salt || (existing && existing.salt) || `salt_${id}_${crypto.randomBytes(8).toString('hex')}`;
  const passwordHash = hashPassword(rawPassword, salt);

  const adminPayload = {
    id: id,
    email: (adminData.email || (existing ? existing.email : `${id}@mnnit.ac.in`)).trim().toLowerCase(),
    name: adminData.name || (existing ? existing.name : `${id.toUpperCase()} Administrator`),
    role: adminData.role || (existing ? existing.role : 'Administrative Officer'),
    department: adminData.department || (existing ? existing.department : 'Central Administration'),
    salt: salt,
    passwordHash: passwordHash,
  };

  const saved = await prisma.adminAuthority.upsert({
    where: { id: adminPayload.id },
    update: {
      email: adminPayload.email,
      name: adminPayload.name,
      role: adminPayload.role,
      department: adminPayload.department,
      salt: adminPayload.salt,
      passwordHash: adminPayload.passwordHash,
    },
    create: adminPayload,
  });

  // Invalidate any active sessions for this admin so the updated password takes effect
  await prisma.adminSession.deleteMany({
    where: { adminId: id },
  }).catch(() => { });

  console.log(`🔐 Admin Authority [${saved.id}] (${saved.name} • ${saved.role}) saved/updated in database.`);
  return saved;
}

async function seed() {
  console.log('🌱 Starting RaisoVoice Prisma SQL Database Seeding...');

  // Clear existing complaint records to ensure fresh authentic demo state
  await prisma.adminSession.deleteMany({});
  await prisma.auditBlock.deleteMany({});
  await prisma.complaint.deleteMany({});
  // Note: We use upsert for adminAuthority so existing/custom accounts are preserved or updated safely.

  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);
  const hoursFromNow = (h) => new Date(now + h * 60 * 60 * 1000);

  // 1. Complaint 1: In Review (Raman Hostel Geyser & Seepage)
  const c1Created = hoursAgo(18);
  const c1Deadline = hoursFromNow(6);
  const c1Data = {
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
    slaHours: 24,
    slaDeadline: c1Deadline,
    isEscalated: false,
    attachmentName: 'geyser_leakage_block_b.jpg',
    createdAt: c1Created,
    updatedAt: hoursAgo(4),
  };

  const c1GenesisHash = calculateGenesisHash({
    ...c1Data,
    createdAt: c1Created.toISOString(),
  });

  const b1_0 = {
    blockIndex: 0,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: c1GenesisHash,
    action: 'Petition Submitted (Genesis Block)',
    actor: 'Anonymous Student (Tokenized)',
    role: 'Student',
    status: 'Filed',
    notes: 'Official grievance cryptographically registered with Zero-PII sanitation.',
    department: 'Central Triage Cell',
    timestamp: c1Created,
  };

  const b1_1_time = hoursAgo(17);
  const b1_1_hash = calculateBlockHash(b1_0.blockHash, {
    timestamp: b1_1_time.toISOString(),
    action: 'Department Assigned',
    actor: 'Administrative Triage Bot',
    status: 'Assigned',
    notes: 'Ticket categorized as Urgent Infrastructure. Assigned to Chief Warden Office and Estate Maintenance Cell.',
    department: 'Chief Warden Office / Hostel Maintenance',
  });
  const b1_1 = {
    blockIndex: 1,
    previousHash: b1_0.blockHash,
    blockHash: b1_1_hash,
    action: 'Department Assigned',
    actor: 'Administrative Triage Bot',
    role: 'Admin',
    status: 'Assigned',
    notes: 'Ticket categorized as Urgent Infrastructure. Assigned to Chief Warden Office and Estate Maintenance Cell.',
    department: 'Chief Warden Office / Hostel Maintenance',
    timestamp: b1_1_time,
  };

  const b1_2_time = hoursAgo(4);
  const b1_2_hash = calculateBlockHash(b1_1.blockHash, {
    timestamp: b1_2_time.toISOString(),
    action: 'Physical Inspection Underway',
    actor: 'Dr. R. K. Srivastava (Warden)',
    status: 'In Review',
    notes: 'Plumber and electrician inspected the geyser element on 2nd floor. Replacement heating coils requisitioned from central store.',
    department: 'Chief Warden Office / Hostel Maintenance',
  });
  const b1_2 = {
    blockIndex: 2,
    previousHash: b1_1.blockHash,
    blockHash: b1_2_hash,
    action: 'Physical Inspection Underway',
    actor: 'Dr. R. K. Srivastava (Warden)',
    role: 'Department Head',
    status: 'In Review',
    notes: 'Plumber and electrician inspected the geyser element on 2nd floor. Replacement heating coils requisitioned from central store.',
    department: 'Chief Warden Office / Hostel Maintenance',
    timestamp: b1_2_time,
  };

  await prisma.complaint.create({
    data: {
      ...c1Data,
      auditChain: {
        create: [b1_0, b1_1, b1_2],
      },
    },
  });

  // 2. Complaint 2: Overdue & Auto-Escalated (Tilak Hostel Mess Dal Hygiene)
  const c2Created = hoursAgo(36);
  const c2Deadline = hoursAgo(12);
  const c2Data = {
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
    slaHours: 24,
    slaDeadline: c2Deadline,
    isEscalated: true,
    attachmentName: 'mess_dal_photo.jpg',
    createdAt: c2Created,
    updatedAt: hoursAgo(12),
  };

  const c2GenesisHash = calculateGenesisHash({
    ...c2Data,
    createdAt: c2Created.toISOString(),
  });

  const b2_0 = {
    blockIndex: 0,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: c2GenesisHash,
    action: 'Petition Submitted (Genesis Block)',
    actor: 'Anonymous Student (Tokenized)',
    role: 'Student',
    status: 'Filed',
    notes: 'Severe hygiene violation reported under whistleblower protection.',
    department: 'Mess Committee Central Cell',
    timestamp: c2Created,
  };

  const b2_1_time = hoursAgo(35);
  const b2_1_hash = calculateBlockHash(b2_0.blockHash, {
    timestamp: b2_1_time.toISOString(),
    action: 'Assigned to Mess Warden',
    actor: 'Student Welfare Portal',
    status: 'Assigned',
    notes: 'Forwarded to Mess Committee Warden for immediate vendor inspection.',
    department: 'Mess Management Committee & DSW',
  });
  const b2_1 = {
    blockIndex: 1,
    previousHash: b2_0.blockHash,
    blockHash: b2_1_hash,
    action: 'Assigned to Mess Warden',
    actor: 'Student Welfare Portal',
    role: 'Admin',
    status: 'Assigned',
    notes: 'Forwarded to Mess Committee Warden for immediate vendor inspection.',
    department: 'Mess Management Committee & DSW',
    timestamp: b2_1_time,
  };

  const b2_2_time = hoursAgo(12);
  const b2_2_hash = calculateBlockHash(b2_1.blockHash, {
    timestamp: b2_2_time.toISOString(),
    action: 'Automated SLA Escalation',
    actor: 'SLA Monitor Daemon',
    status: 'Escalated',
    notes: 'SLA timer expired (24h SLA breached). No resolution logged by hostel mess manager. Complaint escalated directly to Dean of Student Welfare (DSW) and Chief Proctor.',
    department: 'Dean of Student Welfare (DSW) & Mess Committee',
  });
  const b2_2 = {
    blockIndex: 2,
    previousHash: b2_1.blockHash,
    blockHash: b2_2_hash,
    action: 'Automated SLA Escalation',
    actor: 'SLA Monitor Daemon',
    role: 'Automated SLA System',
    status: 'Escalated',
    notes: 'SLA timer expired (24h SLA breached). No resolution logged by hostel mess manager. Complaint escalated directly to Dean of Student Welfare (DSW) and Chief Proctor.',
    department: 'Dean of Student Welfare (DSW) & Mess Committee',
    timestamp: b2_2_time,
  };

  await prisma.complaint.create({
    data: {
      ...c2Data,
      auditChain: {
        create: [b2_0, b2_1, b2_2],
      },
    },
  });

  // 3. Complaint 3: Resolved (Library Wi-Fi Connectivity)
  const c3Created = hoursAgo(54);
  const c3Deadline = hoursAgo(6);
  const c3Data = {
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
    slaHours: 72,
    slaDeadline: c3Deadline,
    isEscalated: false,
    createdAt: c3Created,
    updatedAt: hoursAgo(8),
  };

  const c3GenesisHash = calculateGenesisHash({
    ...c3Data,
    createdAt: c3Created.toISOString(),
  });

  const b3_0 = {
    blockIndex: 0,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: c3GenesisHash,
    action: 'Petition Submitted (Genesis Block)',
    actor: 'Ayush Verma (Reg: 20264012)',
    role: 'Student',
    status: 'Filed',
    notes: 'Wi-Fi connectivity petition submitted with verified campus credentials.',
    department: 'Computer Center Helpdesk',
    timestamp: c3Created,
  };

  const b3_1_time = hoursAgo(48);
  const b3_1_hash = calculateBlockHash(b3_0.blockHash, {
    timestamp: b3_1_time.toISOString(),
    action: 'Assigned to CC Network NOC',
    actor: 'Helpdesk Dispatcher',
    status: 'Assigned',
    notes: 'Referred to Er. Sandeep Mishra for Cisco AP reboot and channel re-allocation.',
    department: 'Computer Center (CC) & Network Operations',
  });
  const b3_1 = {
    blockIndex: 1,
    previousHash: b3_0.blockHash,
    blockHash: b3_1_hash,
    action: 'Assigned to CC Network NOC',
    actor: 'Helpdesk Dispatcher',
    role: 'Admin',
    status: 'Assigned',
    notes: 'Referred to Er. Sandeep Mishra for Cisco AP reboot and channel re-allocation.',
    department: 'Computer Center (CC) & Network Operations',
    timestamp: b3_1_time,
  };

  const b3_2_time = hoursAgo(24);
  const b3_2_hash = calculateBlockHash(b3_1.blockHash, {
    timestamp: b3_2_time.toISOString(),
    action: 'Channel Re-tuning & DHCP Pool Expansion',
    actor: 'Er. Sandeep Mishra (Network Admin)',
    status: 'In Review',
    notes: 'Diagnosed IP lease exhaustion on 172.16.48.0/22 subnet. Expanded DHCP pool to /21 and replaced faulty PoE injector on AP-LIB-104.',
    department: 'Computer Center (CC) & Network Operations',
  });
  const b3_2 = {
    blockIndex: 2,
    previousHash: b3_1.blockHash,
    blockHash: b3_2_hash,
    action: 'Channel Re-tuning & DHCP Pool Expansion',
    actor: 'Er. Sandeep Mishra (Network Admin)',
    role: 'Department Head',
    status: 'In Review',
    notes: 'Diagnosed IP lease exhaustion on 172.16.48.0/22 subnet. Expanded DHCP pool to /21 and replaced faulty PoE injector on AP-LIB-104.',
    department: 'Computer Center (CC) & Network Operations',
    timestamp: b3_2_time,
  };

  const b3_3_time = hoursAgo(8);
  const b3_3_hash = calculateBlockHash(b3_2.blockHash, {
    timestamp: b3_3_time.toISOString(),
    action: 'Grievance Formally Resolved',
    actor: 'Head, Computer Center',
    status: 'Resolved',
    notes: 'Stress-tested with 180 concurrent devices over 6 hours with 0 packet drops. Grievance resolved and sealed on cryptographic ledger.',
    department: 'Computer Center (CC) & Network Operations',
  });
  const b3_3 = {
    blockIndex: 3,
    previousHash: b3_2.blockHash,
    blockHash: b3_3_hash,
    action: 'Grievance Formally Resolved',
    actor: 'Head, Computer Center',
    role: 'Department Head',
    status: 'Resolved',
    notes: 'Stress-tested with 180 concurrent devices over 6 hours with 0 packet drops. Grievance resolved and sealed on cryptographic ledger.',
    department: 'Computer Center (CC) & Network Operations',
    timestamp: b3_3_time,
  };

  await prisma.complaint.create({
    data: {
      ...c3Data,
      auditChain: {
        create: [b3_0, b3_1, b3_2, b3_3],
      },
    },
  });

  // 4. Complaint 4: Assigned (Streetlights near Girls Hostel Malviya)
  const c4Created = hoursAgo(10);
  const c4Deadline = hoursFromNow(38);
  const c4Data = {
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
    slaHours: 48,
    slaDeadline: c4Deadline,
    isEscalated: false,
    createdAt: c4Created,
    updatedAt: hoursAgo(9),
  };

  const c4GenesisHash = calculateGenesisHash({
    ...c4Data,
    createdAt: c4Created.toISOString(),
  });

  const b4_0 = {
    blockIndex: 0,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: c4GenesisHash,
    action: 'Petition Submitted (Genesis Block)',
    actor: 'Anonymous Student (Tokenized)',
    role: 'Student',
    status: 'Filed',
    notes: 'Urgent security and night corridor lighting petition logged.',
    department: 'Proctorial Control Desk',
    timestamp: c4Created,
  };

  const b4_1_time = hoursAgo(9);
  const b4_1_hash = calculateBlockHash(b4_0.blockHash, {
    timestamp: b4_1_time.toISOString(),
    action: 'Assigned & Night Patrol Alerted',
    actor: 'Chief Proctor Desk',
    status: 'Assigned',
    notes: 'Security guards notified to increase patrols until Estate Electrical team repairs underground cable breaker.',
    department: 'Chief Proctorial Board & Security',
  });
  const b4_1 = {
    blockIndex: 1,
    previousHash: b4_0.blockHash,
    blockHash: b4_1_hash,
    action: 'Assigned & Night Patrol Alerted',
    actor: 'Chief Proctor Desk',
    role: 'Admin',
    status: 'Assigned',
    notes: 'Security guards notified to increase patrols until Estate Electrical team repairs underground cable breaker.',
    department: 'Chief Proctorial Board & Security',
    timestamp: b4_1_time,
  };

  await prisma.complaint.create({
    data: {
      ...c4Data,
      auditChain: {
        create: [b4_0, b4_1],
      },
    },
  });

  // 5. Complaint 5: Filed (Newly submitted classroom projector malfunction)
  const c5Created = hoursAgo(2);
  const c5Deadline = hoursFromNow(70);
  const c5Data = {
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
    slaHours: 72,
    slaDeadline: c5Deadline,
    isEscalated: false,
    createdAt: c5Created,
    updatedAt: c5Created,
  };

  const c5GenesisHash = calculateGenesisHash({
    ...c5Data,
    createdAt: c5Created.toISOString(),
  });

  const b5_0 = {
    blockIndex: 0,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    blockHash: c5GenesisHash,
    action: 'Petition Submitted (Genesis Block)',
    actor: 'Anonymous Student (Tokenized)',
    role: 'Student',
    status: 'Filed',
    notes: 'Genesis block sealed with SHA-256 parameter commitment.',
    department: 'Central Triage Cell',
    timestamp: c5Created,
  };

  await prisma.complaint.create({
    data: {
      ...c5Data,
      auditChain: {
        create: [b5_0],
      },
    },
  });

  // Save or update authorized admin accounts with salted SHA-256 passwords

  // Save or update authorized admin accounts with salted SHA-256 passwords
  console.log('🔐 Saving / Updating Administrator accounts in SQL database...');
  for (const a of admins) {
    await saveOrUpdateAdmin(a);
  }

  console.log('✅ RaisoVoice Prisma SQL database successfully populated with realistic MNNIT complaints and cryptographically verified audit chains!');
}

/**
 * CLI Entrypoint:
 * - Run full seed: node prisma/seed.js
 * - Save or update specific admin: node prisma/seed.js save <id> <password> [email] [name] [role] [department]
 * - Update password: node prisma/seed.js update <id> <password>
 */
async function main() {
  const args = process.argv.slice(2);

  // CLI Command: node prisma/seed.js save <id> <password> [email] [name] [role] [department]
  // CLI Command: node prisma/seed.js update <id> <password>
  if (args.length >= 2 && ['save', 'update', '--save-admin', '--update-admin', '-u', '-s'].includes(args[0].toLowerCase())) {
    const id = args[1];
    const password = args[2];
    const email = args[3];
    const name = args[4];
    const role = args[5];
    const department = args[6];

    if (!id || !password) {
      console.error('Usage: node prisma/seed.js save <id> <password> [email] [name] [role] [department]');
      process.exit(1);
    }

    console.log(`🔧 Executing save/update for administrator "${id}"...`);
    await saveOrUpdateAdmin({ id, password, email, name, role, department });
    console.log(`✅ Administrator "${id}" ID and password successfully saved/updated in database!`);
    return;
  }

  // Direct CLI invocation: node prisma/seed.js <id> <password>
  if (args.length === 2 && !args[0].startsWith('-')) {
    const [id, password] = args;
    console.log(`🔧 Direct save/update for administrator "${id}"...`);
    await saveOrUpdateAdmin({ id, password });
    console.log(`✅ Administrator "${id}" password successfully saved/updated in database!`);
    return;
  }

  // Default: Run full database seed with save/update on all defined admins
  await seed();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Seeding/Admin update failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  prisma,
  seed,
  saveOrUpdateAdmin,
  hashPassword,
  admins,
};
