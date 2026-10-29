
RaisoVoice — The Vishanti Petition 🏛️
"Your Voice. Your Rights. No Silence."
A Corrupt-Proof, Tamper-Evident Anonymous Student Grievance Redressal System for MNNIT Allahabad.

🏆 Webster 2026 Hackathon Submission
Team Name: ByteForge
Team ID: 198
Institution: Motilal Nehru National Institute of Technology (MNNIT) Allahabad
Team Members:

Shivansh Gupta (Reg: 20269185, Mechanical Engineering, shivansh036052)

Shivani (Reg: 20269184, Mechanical Engineering, shivani280508)

Tushar Gupta (Reg: 20269205, Mechanical Engineering, tushargupta0831)


💡 The Problem We Solved
In colleges and university campuses, filing complaints regarding hostel infrastructure, mess food hygiene, library connectivity, or academic grievances is often slow, opaque, and intimidating:

Fear of Academic Retaliation: Students stay quiet about genuine issues because they worry about bad grades, hostel debarment, or administrative friction.
"Silently Closed" Complaints: Hostels and departments quietly mark tickets as "Resolved" without sending an electrician, plumber, or food inspector.
Tampered Records: Traditional databases allow rogue administrators or staff to delete or alter past complaint notes without leaving any audit trail.
Bureaucratic Delays: No automated enforcement exists when a complaint is ignored for days or weeks.
🚀 The RaisoVoice Solution & Key Innovations
1. 🛡️ True Anonymous Mode (Zero PII Stored)
Students can file critical grievances without submitting their name, roll number, or email address.
The system issues a Public Ticket ID (e.g. RV-2026-1001) and a cryptographically unique Private Tracking Code / Secret Key (e.g. VSH-7892-R1).
Only whoever holds the private key can track replies, view notes, and receive updates.
2. 🔗 Fraud-Proof Activity Tracking (SHA-256 Hash Chain)
Instead of slow and costly Web3 blockchains, RaisoVoice employs a high-speed, client/server native SHA-256 append-only cryptographic audit ledger.
Genesis Block: Created upon submission locking ticket parameters: SHA256(ticketId + category + subject + description + priority + timestamp + "000...000").
Linked Blocks: Every subsequent action (department assignment, inspection notes, status changes, SLA escalations) creates a new link containing SHA256(previousHash + timestamp + action + actor + status + notes).
Tamper-Evident Proof: If a database administrator secretly alters a past note, the SHA-256 signature immediately breaks, sounding a red alert in the verification viewer!
Judges Tamper Simulation: Includes an interactive button allowing hackathon judges to inject a fake DB modification and observe the mathematical break in real-time.
3. 🚦 Strict Finite State Machine (Anti-Skip Workflow)
Tickets can only move in an orderly, lawful progression:
$$\text{Filed} \longrightarrow \text{Assigned} \longrightarrow \text{In Review} \longrightarrow \text{Resolved}$$
(Or $\text{Escalated}$ at any point if SLA threshold is breached).
Staff cannot skip steps or jump straight from Filed to Resolved without assigning an officer and documenting review notes.

4. ⏱️ Automated SLA Countdown & Auto-Escalation
Urgent: 24-hour SLA
High: 48-hour SLA
Medium: 72-hour SLA
Low: 120-hour SLA
If the assigned department fails to resolve the grievance before the timer reaches zero, the system automatically tags the ticket as "Escalated" and forwards it directly to senior management (Dean of Student Welfare & Chief Proctor).
5. 🔍 Real-Time Duplicate Detection
While typing the complaint subject (e.g. "Geyser not working" or "Wi-Fi drops"), RaisoVoice performs instant fuzzy keyword matching against active petitions in that hostel or category.
Alerts the petitioner if identical complaints exist so maintenance teams can fix root causes faster.
6. 📊 Public Performance Dashboard (Zero PII Exposed)
Transparent public analytics: Total Filed, Resolved, In Review, and Overdue.
Departmental resolution speeds across Hostels, Mess Committees, Computer Center (CC), Estate Office, and Examination Section.
Public resolution feed showing resolved petitions while strictly stripping student identities.
🛠️ Technology Stack (Normal Stack)
Frontend: HTML5, Vanilla CSS3, Client-side JavaScript
Backend: Node.js & Express (server.js)
Database & ORM: Prisma ORM with SQL Database (SQLite / dev.db)
Cryptography: Pure JavaScript SHA-256 Immutable Audit Ledger Engine
Styling: Vanilla CSS Design System with dark navy typography (#0b1d30), royal blue accents (#1d4ed8), responsive layouts, and modern glass cards
Zero Heavy Frameworks: Pure HTML, CSS, JavaScript, Prisma, and SQL
🏃 Getting Started Locally
Prerequisites
Node.js (v18.x, v20.x, or v24.x)
npm (v9.x or higher)
Installation & Launch
# 1. Clone or navigate to the project directory
cd d:/BYTEFORGE

# 2. Install dependencies
npm install

# 3. Synchronize Prisma SQL database schema
npx prisma db push

# 4. Seed database with realistic MNNIT complaints & audit chains
npm run seed

# 5. Start the server
npm run dev # or npm start
Open http://localhost:3000 in your browser to view the website.

🧭 Project Routes & Navigation
Route	Page	Description
/	Home Page	Hero, tagline, core pillars, process flow, and campus redressal counters.
/submit	Submit Complaint	Anonymous grievance filing, category selector, priority SLAs, duplicate detection, and receipt card generation.
/track	Track Complaint	Ticket ID & Secret Key lookup, live progress stepper, SLA countdown timer, and interactive SHA-256 audit ledger.
/dashboard	Public Dashboard	Campus-wide KPI cards, department performance comparison bars, and anonymous resolution feed.
/admin	Authority Console	Protected admin portal with 1-click logins (Dean DSW, Chief Warden, Proctor), triage action drawer, and system-wide ledger integrity verifier.
🔐 Authorized Administrative Access & Credential Management
The Authority Portal (/admin) is strictly secured and protected. To prevent unauthorized student visibility, credentials and 1-click logins are never exposed on the client interface. Authentication is verified server-side against salted SHA-256 password hashes stored in the Prisma SQL database.

🛠️ Saving or Updating Administrator ID and Password in prisma/seed.js
You can configure, save, or update administrator IDs and passwords at any time using prisma/seed.js:

Option 1: Edit prisma/seed.js directly:
Open seed.js and update the admins array:

const admins = [
  {
    id: 'admin',
    email: 'admin@mnnit.ac.in',
    name: 'Administrative Triage Cell',
    role: 'Central Intake Officer',
    department: 'Central Triage Cell',
    password: 'YourNewPassword2026', // Update password here
  },
  // ...
];
Then run:

npm run seed
# or
node prisma/seed.js
This performs an upsert: it preserves or generates a unique salt, hashes the password with SHA-256, saves/updates the account in SQLite, and revokes any stale sessions.

Option 2: CLI Save / Update Command:
To update or create an admin credential directly without re-seeding complaints:

# Update an existing admin's password
node prisma/seed.js update admin NewSecurePassword@2026

# Save / create a new administrator account
node prisma/seed.js save warden_patel PatelPass@2026 patel.warden@mnnit.ac.in "Dr. Patel" "Hostel Warden" "Chief Warden Office"
📋 Default Seeded Administrative Authorities
Authority / Role	Administrator ID	Official Email	Demo Passwords	Department Scope
Central Intake Officer	admin	admin@mnnit.ac.in	admin or Admin@Mnnit2026	Central Triage Cell
Dean Student Welfare (DSW)	dean_dsw	dean.dsw@mnnit.ac.in	DeanDSW@2026 or dean	Dean of Student Welfare (DSW) & Mess Committee
Chief Warden (Hostels)	chief_warden	warden.chief@mnnit.ac.in	ChiefWarden@2026 or warden	Chief Warden Office / Hostel Maintenance
Chief Proctor (Campus Security)	chief_proctor	proctor@mnnit.ac.in	ChiefProctor@2026 or proctor	Chief Proctorial Board & Security
💡 Tip: On the Authority Portal (/admin), you can use the 1-Click Demo Access buttons for instant evaluation, or enter the credentials above directly.

🎤 Quick Hackathon Judges Walkthrough (3-Minute Demo)
Start on Home (/): Show the clean design, tagline, and live stats cards.
File a Complaint (/submit):
Check "Submit Anonymously".
Pick category "Hostel & Accommodation", set Priority to "Urgent".
Type "Geyser coil broken in Raman Hostel". Point out the Live Duplicate Detection notice.
Click "Submit Complaint & Generate Tracking Key".
Show the generated Ticket ID (e.g. RV-2026-1006) and Private Secret Key (e.g. VSH-7892-R1).
Track & Cryptographic Proof (/track):
Click "Track Live Status" from the receipt.
Review the Lifecycle Stepper and SLA Countdown Timer.
Scroll down to the Cryptographic Audit Chain (SHA-256):

Click "Verify Chain Integrity" ➔ Watch it turn green: "Integrity Verified: Tamper-Proof Chain Unbroken".

Click "Simulate Rogue DB Edit" in the Judges Live Test Tool.

Click "Verify Chain Integrity" again ➔ Watch it turn red: "SECURITY ALERT: Ledger Tampering Detected at Block #1!" (Explains why rogue DB edits cannot go unnoticed).

Click "Reset Ledger" to restore.


Authority Console (/admin):
Click "Dean Student Welfare (DSW) 1-Click Login".
Click "Manage" on any ticket.
Show strict state transitions: cannot jump directly from Filed to Resolved.
Select "Assigned", type an official inspection note, and click "Seal Block & Update Complaint".
Point out the newly generated SHA-256 Block in the ledger!
Public Dashboard (/dashboard):
Show how the college community can monitor resolution rates across departments without exposing student identities.
👥 Credits
Developed with ❤️ by Team ByteForge for Webster 2026 Hackathon
Motilal Nehru National Institute of Technology (MNNIT) Allahabad, Prayagraj, Uttar Pradesh.
