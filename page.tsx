'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Key,
  ShieldCheck,
  Clock,
  Building,
  User,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Calendar,
  Lock,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import {
  getComplaintByTracking,
  getComplaintById,
  triggerAutoEscalate,
  simulateTamperBlock,
  resetToSeedComplaints,
  getStoredComplaints,
} from '../../lib/storage';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { HashAuditViewer } from '../../components/HashAuditViewer';
import { SlaCountdown } from '../../components/SlaCountdown';

const STEP_ORDER: ComplaintStatus[] = ['Filed', 'Assigned', 'In Review', 'Resolved'];

function TrackComplaintContent() {
  const searchParams = useSearchParams();
  const [ticketId, setTicketId] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill from URL params
  useEffect(() => {
    const urlId = searchParams.get('id');
    const urlCode = searchParams.get('code');
    if (urlId && urlCode) {
      setTicketId(urlId);
      setTrackingCode(urlCode);
      lookupTicket(urlId, urlCode);
    }
  }, [searchParams]);

  const lookupTicket = (id: string, code: string) => {
    setErrorMsg('');
    setSearchAttempted(true);

    if (!id.trim() || !code.trim()) {
      setErrorMsg('Please enter both Ticket ID and Private Tracking Code.');
      setComplaint(null);
      return;
    }

    const found = getComplaintByTracking(id.trim(), code.trim());
    if (found) {
      setComplaint(found);
    } else {
      setComplaint(null);
      setErrorMsg(
        'No matching complaint found. Please check that both the Ticket ID (e.g. RV-2026-1001) and Private Tracking Code (e.g. VSH-7892-R1) match.'
      );
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupTicket(ticketId, trackingCode);
  };

  const handleAutoEscalate = () => {
    if (!complaint) return;
    const updated = triggerAutoEscalate(complaint.id);
    if (updated) {
      setComplaint({ ...updated });
    }
  };

  const handleTamperSimulate = (blockIndex: number, fakeNote: string) => {
    if (!complaint) return;
    simulateTamperBlock(complaint.id, blockIndex, fakeNote);
    const refreshed = getComplaintById(complaint.id);
    if (refreshed) {
      setComplaint({ ...refreshed });
    }
  };

  const handleRestoreOriginal = () => {
    resetToSeedComplaints();
    if (complaint) {
      const refreshed = getComplaintById(complaint.id);
      if (refreshed) {
        setComplaint({ ...refreshed });
      }
    }
  };

  // Quick Demo Fill for Judges
  const loadDemo = (id: string, code: string) => {
    setTicketId(id);
    setTrackingCode(code);
    lookupTicket(id, code);
  };

  // Determine active step index
  const getCurrentStepIndex = (status: ComplaintStatus) => {
    if (status === 'Escalated') return 2; // parallel to In Review / beyond Assigned
    return STEP_ORDER.indexOf(status);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 mb-2">
          <Search className="w-3.5 h-3.5" />
          Tamper-Evident Ticket Tracking
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Track Your Complaint
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Enter your Ticket ID and Private Tracking Key to inspect real-time progress, SLA deadlines, and cryptographic audit proofs.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Ticket ID
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g. RV-2026-1001"
              className="input-field font-mono uppercase"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Private Tracking Code (Secret Key)
            </label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="e.g. VSH-7892-R1"
              className="input-field font-mono uppercase"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full btn-primary py-2.5 text-sm justify-center shadow-sm"
            >
              <Search className="w-4 h-4" />
              Track
            </button>
          </div>
        </form>

        {/* Quick Demo Pre-sets for Hackathon Judges */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Hackathon Demo Shortcuts:</span>
          <button
            type="button"
            onClick={() => loadDemo('RV-2026-1001', 'VSH-7892-R1')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-mono transition-colors"
          >
            RV-1001 (Raman Hostel Geyser - In Review)
          </button>
          <button
            type="button"
            onClick={() => loadDemo('RV-2026-1002', 'VSH-4421-E9')}
            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-mono transition-colors"
          >
            RV-1002 (Tilak Mess - Escalated)
          </button>
          <button
            type="button"
            onClick={() => loadDemo('RV-2026-1003', 'VSH-9011-L4')}
            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-mono transition-colors"
          >
            RV-1003 (Library Wi-Fi - Resolved)
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Search Result */}
      {complaint && (
        <div className="space-y-6">
          
          {/* Main Status Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {complaint.id}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mt-1">
                  {complaint.subject}
                </h2>
              </div>
              <div className="text-xs text-slate-500 sm:text-right">
                <div>Filed on: {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}</div>
                <div className="text-slate-400 font-mono mt-0.5">
                  Key: {complaint.trackingCode}
                </div>
              </div>
            </div>

            {/* Strict State Flow Stepper */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Lifecycle Progression Flow
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {STEP_ORDER.map((step, idx) => {
                  const currentIdx = getCurrentStepIndex(complaint.status);
                  const isPassed = idx < currentIdx || (complaint.status === 'Resolved' && idx === 3);
                  const isCurrent = idx === currentIdx;

                  let barColor = 'bg-slate-200 text-slate-500';
                  if (complaint.status === 'Escalated' && idx === 2) {
                    barColor = 'bg-rose-500 text-white font-bold animate-pulse';
                  } else if (isCurrent) {
                    barColor = 'bg-blue-600 text-white font-bold';
                  } else if (isPassed) {
                    barColor = 'bg-blue-100 text-blue-900 font-semibold';
                  }

                  return (
                    <div key={step} className="space-y-1.5">
                      <div className={`h-2.5 rounded-full transition-colors ${barColor.split(' ')[0]}`} />
                      <div className="text-[11px] font-medium text-slate-700">
                        {step === 'In Review' && complaint.status === 'Escalated' ? (
                          <span className="text-rose-600 font-bold">Escalated</span>
                        ) : (
                          step
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SLA Countdown Timer */}
            <SlaCountdown
              deadlineIso={complaint.slaDeadline}
              status={complaint.status}
              showDemoButton={true}
              onAutoEscalate={handleAutoEscalate}
            />

            {/* Ticket Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Assigned Department</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {complaint.department}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Assigned Authority</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {complaint.assignedOfficer || 'Administrative Triage'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Identity Privacy</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {complaint.isAnonymous ? 'True Anonymous (Zero PII Saved)' : complaint.studentName}
                </span>
              </div>
            </div>

            {/* Full Complaint Description */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wide block">
                Complaint Statement
              </span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                {complaint.description}
              </p>
              {complaint.location && (
                <p className="text-[11px] text-slate-500 pt-1">
                  📍 Location: <strong>{complaint.location}</strong>
                </p>
              )}
              {complaint.attachmentName && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-blue-700 font-medium">
                    <FileText className="w-3.5 h-3.5" />
                    Attached Proof: {complaint.attachmentName}
                  </span>
                </div>
              )}
            </div>

            {/* Resolution Note if resolved */}
            {complaint.status === 'Resolved' && complaint.resolutionNotes && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Resolution Notice
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  {complaint.resolutionNotes}
                </p>
                {complaint.resolvedAt && (
                  <p className="text-[11px] text-emerald-700">
                    Resolved at: {new Date(complaint.resolvedAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tamper-Evident Hash Audit Ledger Component */}
          <HashAuditViewer
            auditChain={complaint.auditChain}
            ticketId={complaint.id}
            onTamperSimulate={handleTamperSimulate}
            onRestoreOriginal={handleRestoreOriginal}
          />
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading Tracker...</div>}>
      <TrackComplaintContent />
    </Suspense>
  );
}
