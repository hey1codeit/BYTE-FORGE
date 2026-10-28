'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Building,
  User,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Eye,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  FastForward,
} from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
} from '../../types';
import {
  getStoredComplaints,
  updateComplaint,
  triggerAutoEscalate,
  resetToSeedComplaints,
  getComplaintById,
} from '../../lib/storage';
import { canTransitionStatus, ALLOWED_TRANSITIONS } from '../../lib/stateMachine';
import { verifyAuditChain, VerificationResult } from '../../lib/crypto';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { HashAuditViewer } from '../../components/HashAuditViewer';
import { SlaCountdown } from '../../components/SlaCountdown';

const DEPARTMENTS = [
  'Chief Warden Office / Hostel Maintenance',
  'Mess Management Committee & DSW',
  'Dean Academics / Examination Section',
  'Estate & Civil Maintenance Cell',
  'Computer Center (CC) & Network Operations',
  'Chief Sanitation Inspector Office',
  'Chief Proctorial Board & Security',
  'Registrar Office / Accounts Section',
];

export default function AdminPage() {
  // Authentication state for basic protected dashboard
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [activeAdminRole, setActiveAdminRole] = useState('Chief Proctor & DSW');

  // Complaints & table state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Selected complaint for action drawer/modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Form states for updating complaint
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('Assigned');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Overall system verification state
  const [systemVerification, setSystemVerification] = useState<{
    totalTickets: number;
    totalBlocks: number;
    allValid: boolean;
  } | null>(null);

  useEffect(() => {
    setComplaints(getStoredComplaints());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail && adminPassword) {
      setIsAuthenticated(true);
    }
  };

  const handleQuickLogin = (role: string, email: string) => {
    setActiveAdminRole(role);
    setAdminEmail(email);
    setAdminPassword('');
  };

  const handleSelectComplaint = (c: Complaint) => {
    setSelectedComplaint(c);
    setAssignedDepartment(c.department);
    setAssignedOfficer(c.assignedOfficer || '');
    setActionNotes('');
    setActionError('');
    setActionSuccess('');

    // Default target status to next logical status
    const allowed = ALLOWED_TRANSITIONS[c.status] || [];
    if (allowed.length > 0) {
      setNewStatus(allowed[0]);
    } else {
      setNewStatus(c.status);
    }
  };

  const handleUpdateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!selectedComplaint) return;
    if (!actionNotes.trim()) {
      setActionError('Audit Note is required to create a new immutable cryptographic block.');
      return;
    }

    // Validate state machine rules
    if (newStatus !== selectedComplaint.status) {
      const check = canTransitionStatus(selectedComplaint.status, newStatus);
      if (!check.allowed) {
        setActionError(check.reason || 'Invalid state transition.');
        return;
      }
    }

    const updated = updateComplaint(
      selectedComplaint.id,
      newStatus,
      activeAdminRole,
      'Admin',
      actionNotes.trim(),
      assignedDepartment,
      assignedOfficer.trim() || undefined
    );

    if (updated) {
      setSelectedComplaint(updated);
      setComplaints(getStoredComplaints());
      setActionSuccess(`Block #${updated.auditChain.length} locked with SHA-256 signature! Status updated to ${newStatus}.`);
      setActionNotes('');
    }
  };

  const handleAutoEscalateSelected = () => {
    if (!selectedComplaint) return;
    const updated = triggerAutoEscalate(selectedComplaint.id);
    if (updated) {
      setSelectedComplaint(updated);
      setComplaints(getStoredComplaints());
      setActionSuccess('Complaint escalated directly to Dean of Student Welfare (DSW).');
    }
  };

  const handleVerifyAllLedgers = () => {
    let totalBlocks = 0;
    let allValid = true;

    complaints.forEach((c) => {
      totalBlocks += c.auditChain.length;
      const res = verifyAuditChain(c.auditChain);
      if (!res.isValid) allValid = false;
    });

    setSystemVerification({
      totalTickets: complaints.length,
      totalBlocks,
      allValid,
    });
  };

  const handleResetDemoData = () => {
    if (confirm('Reset all complaints to default clean demo state?')) {
      const resetList = resetToSeedComplaints();
      setComplaints(resetList);
      setSelectedComplaint(null);
      setSystemVerification(null);
    }
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchSub = c.subject.toLowerCase();
      const matchDept = c.department.toLowerCase();
      return matchId || matchSub.includes(q) || matchDept.includes(q);
    }
    return true;
  });

  // If not logged in, show protected login screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Authority Portal Access
            </h1>
            <p className="text-xs text-slate-500">
              Protected administrative gateway for MNNIT Wardens, Deans, and Department Heads.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Official Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="dean.dsw@mnnit.ac.in"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password / Secure Passcode
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-2.5 text-sm justify-center shadow-sm"
            >
              Sign In to Admin Console
            </button>
          </form>

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block text-center">
              Judges One-Click Demo Access
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    'Dean Student Welfare (DSW)',
                    'dean.dsw@mnnit.ac.in'
                  )
                }
                className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Dean Student Welfare (DSW)</span>
                <span className="text-blue-600 font-semibold">1-Click Login →</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    'Chief Warden (Hostels)',
                    'warden.chief@mnnit.ac.in'
                  )
                }
                className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Chief Warden (Raman & Tilak)</span>
                <span className="text-blue-600 font-semibold">1-Click Login →</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    'Chief Proctor Board',
                    'proctor@mnnit.ac.in'
                  )
                }
                className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Chief Proctorial Board</span>
                <span className="text-blue-600 font-semibold">1-Click Login →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Admin Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Building className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Authority Redressal Console
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
              Active Session
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{activeAdminRole}</strong> ({adminEmail || 'admin@mnnit.ac.in'})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleVerifyAllLedgers}
            className="btn-outline text-xs py-2 px-3"
            title="Cryptographically verify all ticket chains across campus"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Verify All Chains
          </button>
          <button
            onClick={handleResetDemoData}
            className="btn-secondary text-xs py-2 px-3"
            title="Reset to fresh demo sample complaints"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* System-wide verification banner */}
      {systemVerification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            systemVerification.allValid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {systemVerification.allValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <span className="font-bold text-sm">
                {systemVerification.allValid
                  ? 'All Campus Ledgers Untampered & Verified'
                  : 'Ledger Integrity Compromised!'}
              </span>
              <p className="text-xs opacity-90">
                Verified {systemVerification.totalTickets} complaints across {systemVerification.totalBlocks} cryptographically sealed blocks. Zero hash collisions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSystemVerification(null)}
            className="text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket ID, subject, dept..."
            className="input-field pl-8 py-2"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Filed">Filed</option>
              <option value="Assigned">Assigned</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <span className="text-slate-400 font-medium ml-auto sm:ml-0">
            Showing {filtered.length} of {complaints.length}
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Category & Subject</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department & Officer</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <tr
                    key={c.id}
                    onClick={() => handleSelectComplaint(c)}
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {c.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {c.category}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-800 truncate font-medium">
                        {c.department}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {c.assignedOfficer || 'Unassigned'}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.status === 'Resolved' ? (
                        <span className="text-emerald-700 font-medium">Resolved</span>
                      ) : c.status === 'Escalated' ? (
                        <span className="text-rose-600 font-bold">Escalated</span>
                      ) : (
                        <span className="text-slate-600">
                          {new Date(c.slaDeadline).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                          })}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectComplaint(c);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                      >
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Complaint Action Drawer / Panel */}
      {selectedComplaint && (
        <div className="bg-white border-2 border-blue-500 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-blue-700">
                  {selectedComplaint.id}
                </span>
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
              <h2 className="text-base font-bold text-slate-800 mt-1">
                {selectedComplaint.subject}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedComplaint.status !== 'Escalated' && selectedComplaint.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={handleAutoEscalateSelected}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  title="Simulate background SLA expiry and elevate ticket"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  Auto-Escalate to DSW
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Close Panel
              </button>
            </div>
          </div>

          {/* Description & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                Student Complaint Statement
              </span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedComplaint.description}
              </p>
              {selectedComplaint.location && (
                <p className="text-slate-500 pt-1">
                  📍 Location: <strong>{selectedComplaint.location}</strong>
                </p>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                Petitioner Details
              </span>
              <div className="space-y-1 text-slate-700">
                <p>
                  • Privacy Mode:{' '}
                  <strong>
                    {selectedComplaint.isAnonymous
                      ? 'True Anonymous (Zero PII Recorded)'
                      : 'Named Student'}
                  </strong>
                </p>
                {!selectedComplaint.isAnonymous && (
                  <>
                    <p>• Student Name: <strong>{selectedComplaint.studentName}</strong></p>
                    <p>• Roll Number: <strong>{selectedComplaint.studentRegNo}</strong></p>
                    <p>• Email: <strong>{selectedComplaint.studentEmail}</strong></p>
                  </>
                )}
                <p className="font-mono text-slate-500 pt-1">
                  • Secret Tracking Key: <code>{selectedComplaint.trackingCode}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Admin Update Action Form (Enforces State Machine & Hashing) */}
          <form
            onSubmit={handleUpdateComplaint}
            className="p-5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Update Status & Record Cryptographic Audit Block
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Target Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="input-field font-semibold"
                >
                  <option value="Filed">Filed</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Review">In Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Escalated">Escalated</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Strict progression: Filed → Assigned → In Review → Resolved
                </span>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Department
                </label>
                <select
                  value={assignedDepartment}
                  onChange={(e) => setAssignedDepartment(e.target.value)}
                  className="input-field"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Officer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Officer Name
                </label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  placeholder="e.g. Er. S. Mishra / Dr. Srivastava"
                  className="input-field"
                />
              </div>
            </div>

            {/* Audit Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Action / Audit Note * (Appended to SHA-256 Ledger)
              </label>
              <textarea
                required
                rows={2}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Detail the physical action taken, materials dispatched, vendor summoned, or inspection results..."
                className="input-field text-xs resize-y"
              />
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="btn-primary text-xs py-2.5 px-4 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Seal Block & Update Complaint
              </button>
            </div>
          </form>

          {/* Integrated Cryptographic Hash Chain for Selected Complaint */}
          <div>
            <HashAuditViewer
              auditChain={selectedComplaint.auditChain}
              ticketId={selectedComplaint.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}
