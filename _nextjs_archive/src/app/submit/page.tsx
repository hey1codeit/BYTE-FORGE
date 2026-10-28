'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Upload,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ComplaintCategory, ComplaintPriority, Complaint } from '../../types';
import { createComplaint, findSimilarComplaints } from '../../lib/storage';

const CATEGORIES: ComplaintCategory[] = [
  'Hostel & Accommodation',
  'Mess & Food Quality',
  'Academics & Examination',
  'Campus Infrastructure',
  'Internet & LAN',
  'Sanitation & Hygiene',
  'Proctorial & Safety',
  'Administration & Fees',
];

const PRIORITIES: { value: ComplaintPriority; label: string; slaText: string; desc: string }[] = [
  { value: 'Low', label: 'Low', slaText: '120h SLA (5 Days)', desc: 'General feedback, routine maintenance' },
  { value: 'Medium', label: 'Medium', slaText: '72h SLA (3 Days)', desc: 'Standard service issues, non-urgent repairs' },
  { value: 'High', label: 'High', slaText: '48h SLA (2 Days)', desc: 'Disrupts academic or daily campus life' },
  { value: 'Urgent', label: 'Urgent', slaText: '24h SLA (1 Day)', desc: 'Safety hazard, severe health or harassment concern' },
];

export default function SubmitComplaintPage() {
  const [category, setCategory] = useState<ComplaintCategory>('Hostel & Accommodation');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Student non-anonymous fields
  const [studentName, setStudentName] = useState('');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // Attachment mock
  const [attachmentName, setAttachmentName] = useState<string>('');

  // Duplicate warning detection
  const [similarComplaints, setSimilarComplaints] = useState<Complaint[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Live duplicate checking on typing
  const handleSubjectChange = (val: string) => {
    setSubject(val);
    if (val.trim().length >= 4) {
      const matches = findSimilarComplaints(category, val);
      setSimilarComplaints(matches);
    } else {
      setSimilarComplaints([]);
    }
  };

  const handleCategoryChange = (cat: ComplaintCategory) => {
    setCategory(cat);
    if (subject.trim().length >= 4) {
      const matches = findSimilarComplaints(cat, subject);
      setSimilarComplaints(matches);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please fill out both the subject and description.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket = createComplaint({
        category,
        subject: subject.trim(),
        description: description.trim(),
        location: location.trim() || undefined,
        priority,
        isAnonymous,
        studentName: isAnonymous ? undefined : studentName.trim(),
        studentRegNo: isAnonymous ? undefined : studentRegNo.trim(),
        studentEmail: isAnonymous ? undefined : studentEmail.trim(),
        attachmentName: attachmentName || undefined,
      });

      setSubmittedComplaint(newTicket);
      setIsSubmitting(false);
    }, 400);
  };

  const copyCredentials = () => {
    if (!submittedComplaint) return;
    const text = `RaisoVoice Complaint Ticket\nTicket ID: ${submittedComplaint.id}\nPrivate Tracking Code: ${submittedComplaint.trackingCode}\nSubject: ${submittedComplaint.subject}\nTrack at: ${window.location.origin}/track`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // If submitted, show success receipt
  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Complaint Successfully Filed & Sealed
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Your petition has been entered into the system with Genesis Block #1.
            </p>
          </div>

          {/* Ticket Credentials Card */}
          <div className="bg-white border-2 border-dashed border-emerald-300 rounded-xl p-5 text-left space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Official Ticket ID
                </span>
                <div className="text-xl font-extrabold text-blue-700 font-mono">
                  {submittedComplaint.id}
                </div>
              </div>
              <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-2.5 py-1 rounded border border-blue-200">
                Status: {submittedComplaint.status}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Private Tracking Code (Secret Key)
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between bg-amber-50/80 border border-amber-200 rounded-lg p-2.5">
                <code className="text-base font-bold text-amber-900 font-mono tracking-wide">
                  {submittedComplaint.trackingCode}
                </code>
                <span className="text-[11px] text-amber-800 font-medium">Keep this private!</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1 pt-1">
              <p>• Category: <strong>{submittedComplaint.category}</strong></p>
              <p>• Priority: <strong>{submittedComplaint.priority}</strong> ({submittedComplaint.slaHours}h SLA)</p>
              <p>• Submission Mode: <strong>{submittedComplaint.isAnonymous ? 'True Anonymous (Zero PII Saved)' : submittedComplaint.studentName}</strong></p>
              <p className="truncate font-mono text-[10px] text-slate-400 pt-1">
                Genesis Hash: {submittedComplaint.auditChain[0]?.currentHash}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={copyCredentials}
                className="flex-1 btn-secondary text-xs py-2.5 justify-center"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedKey ? 'Copied to Clipboard!' : 'Copy Ticket Credentials'}
              </button>
              <Link
                href={`/track?id=${submittedComplaint.id}&code=${submittedComplaint.trackingCode}`}
                className="flex-1 btn-primary text-xs py-2.5 justify-center"
              >
                Track Live Status
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Please copy and save your Ticket ID and Private Tracking Code. You will need both to review replies, monitor SLA countdowns, and verify cryptographic updates.
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setSubmittedComplaint(null);
              setSubject('');
              setDescription('');
              setLocation('');
              setAttachmentName('');
            }}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
          >
            ← Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          MNNIT Student Grievance Filing
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Submit a Complaint
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Report campus concerns safely. Choose anonymous mode to protect your identity with cryptographic privacy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
        
        {/* Anonymous Mode Toggle Box */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Submit Anonymously
                </h3>
                <p className="text-xs text-slate-600">
                  No name, student roll number, or email will be recorded.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {isAnonymous ? (
            <div className="text-xs text-blue-900 bg-white/80 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Anonymous Mode Active:</strong> You will be issued a private tracking key after submission. Only whoever holds that key can see admin replies and updates.
              </span>
            </div>
          ) : (
            <div className="pt-3 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required={!isAnonymous}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Shivansh Gupta"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration / Roll No. *
                </label>
                <input
                  type="text"
                  required={!isAnonymous}
                  value={studentRegNo}
                  onChange={(e) => setStudentRegNo(e.target.value)}
                  placeholder="e.g. 20269185"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institute Email *
                </label>
                <input
                  type="email"
                  required={!isAnonymous}
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="name@mnnit.ac.in"
                  className="input-field"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as ComplaintCategory)}
              className="input-field font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
              Campus Location / Hostel
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Raman Hostel, Block C, Room 214"
              className="input-field"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
            Complaint Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="e.g. Broken geyser and electrical leakage in washroom"
            className="input-field text-base"
          />

          {/* Live Duplicate Warning (PDF requirement) */}
          {similarComplaints.length > 0 && (
            <div className="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Duplicate Detection: {similarComplaints.length} similar active {similarComplaints.length === 1 ? 'ticket' : 'tickets'} found
              </div>
              <p className="text-slate-600">
                Other students have recently reported a similar problem in this category:
              </p>
              <div className="space-y-1">
                {similarComplaints.slice(0, 2).map((sim) => (
                  <div key={sim.id} className="p-1.5 bg-white rounded border border-amber-200 flex items-center justify-between">
                    <span className="font-medium text-slate-800 truncate mr-2">
                      <strong>{sim.id}</strong>: {sim.subject}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 rounded shrink-0">
                      {sim.status}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 italic">
                You can still submit your complaint if it requires separate attention.
              </p>
            </div>
          )}
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
            Urgency / Priority *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.value;
              return (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{p.label}</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      {p.slaText}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
            Detailed Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide specific details: date/time noticed, how many students are affected, any prior verbal requests made to warden/staff..."
            className="input-field resize-y text-sm"
          />
        </div>

        {/* Photo / Evidence Attachment (Simulation) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
            Attach Evidence / Photo (Optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 text-xs font-medium transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Choose Image / PDF
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAttachmentName(file.name);
                  }
                }}
              />
            </label>
            <span className="text-xs text-slate-500">
              {attachmentName ? (
                <span className="font-medium text-blue-700">Attached: {attachmentName}</span>
              ) : (
                'No file chosen (Max 10MB)'
              )}
            </span>
          </div>
        </div>

        {/* Cryptographic Protection Note */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong>Tamper-Evident SHA-256 Assurance:</strong> Once submitted, this complaint will generate an immutable Genesis block. No administrator or database user can edit or delete this petition without breaking the cryptographic hash chain.
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3.5 text-base justify-center shadow-sm"
          >
            {isSubmitting ? (
              'Calculating SHA-256 Genesis Lock & Submitting...'
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Submit Complaint & Generate Tracking Key
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
