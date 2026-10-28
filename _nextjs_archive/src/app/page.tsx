'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Layers,
  FileCheck2,
  Users,
} from 'lucide-react';
import { getStoredComplaints } from '../lib/storage';
import { Complaint } from '../types';

export default function HomePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setComplaints(getStoredComplaints());
  }, []);

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const pending = complaints.filter(
    (c) => c.status === 'Filed' || c.status === 'Assigned' || c.status === 'In Review'
  ).length;
  const escalated = complaints.filter((c) => c.status === 'Escalated').length;

  return (
    <div className="space-y-16 py-4">
      {/* Hackathon Badge Notice */}
      <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200/80 px-4 py-2.5 rounded-lg text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <span className="font-bold bg-blue-600 text-white px-2 py-0.5 rounded text-[11px]">
            Webster 2026
          </span>
          <span className="font-medium">
            Team <strong>ByteForge</strong> (ID: 198) • MNNIT Allahabad
          </span>
        </div>
        <Link
          href="/admin"
          className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2 flex items-center gap-1 hidden sm:inline-flex"
        >
          Admin Portal Demo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          The Vishanti Petition — Corrupt-Proof Student Grievance System
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Your Voice. Your Rights.{' '}
          <span className="text-blue-600">No Silence.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
          A transparent, student-first grievance website for MNNIT Allahabad. 
          File petitions anonymously without fear of academic backlash, track progress with tamper-evident 
          cryptographic audit chains, and watch college authorities resolve issues on deadline.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/submit"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center justify-center gap-2 text-base"
          >
            <PlusCircle className="w-5 h-5" />
            Submit a Complaint
          </Link>
          <Link
            href="/track"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors duration-150 inline-flex items-center justify-center gap-2 text-base"
          >
            <Search className="w-5 h-5 text-slate-500" />
            Track Complaint
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            100% Anonymous Entry
          </span>
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-4 h-4 text-blue-600" />
            SHA-256 Cryptographic Chain
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Automated SLA Escalation
          </span>
        </div>
      </section>

      {/* Live Impact Counters */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Live Campus Redressal Tracker</h2>
            <p className="text-xs text-slate-500">
              Real-time grievance metrics across hostels, mess, academics, and infrastructure.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
          >
            View Public Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Filed
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {mounted ? total : 5}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Active across MNNIT</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
              Resolved
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              {mounted ? resolved : 1}
            </div>
            <span className="text-[11px] text-emerald-600/80 mt-1 block">Verified fixed</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              Under Review
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">
              {mounted ? pending : 3}
            </div>
            <span className="text-[11px] text-blue-600/80 mt-1 block">With departments</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-medium text-rose-600 uppercase tracking-wide">
              Escalated (SLA)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
              {mounted ? escalated : 1}
            </div>
            <span className="text-[11px] text-rose-600/80 mt-1 block">Breached deadline</span>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars (From ByteForge Hackathon Spec) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered to Solve Campus Silence & Administrative Inaction
          </h2>
          <p className="text-sm text-slate-500">
            Traditional student complaint boxes fail because records disappear and students fear retribution. RaisoVoice eliminates both.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">True Anonymous Entry</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Report delicate problems without submitting your roll number, name, or email. 
              The system generates a private tracking key (e.g., <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-xs font-mono">VSH-7892</code>) 
              so only you can track replies.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Fraud-Proof SHA-256 Ledger</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every status update, comment, and inspection note is mathematically hashed and linked to the previous record. 
              If any corrupt official attempts to edit past logs in the database, the cryptographic hash breaks on the spot.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Strict SLA Auto-Escalation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every ticket gets a countdown timer based on urgency. If staff ignores a problem past the deadline, 
              the system automatically re-routes the ticket directly to the Dean of Student Welfare and Chief Proctor.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (Step-by-step for First-Year Students & Judges) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Process Flow
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            How The Vishanti Petition Works
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            A transparent 4-stage lifecycle governed by state machines and cryptographic locks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-slate-200 rounded-xl p-5 relative space-y-2 bg-slate-50/50">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">File Anonymously</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select category (Hostel, Mess, Academics, LAN). System creates Genesis Block #1 and generates your private tracking key.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 relative space-y-2 bg-slate-50/50">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Department Routing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ticket assigned to the appropriate warden, engineer, or head. A countdown SLA timer starts immediately.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 relative space-y-2 bg-slate-50/50">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Action & Review</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every inspection note or status change appends a new SHA-256 block. Staff cannot skip steps or jump straight to solved.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 relative space-y-2 bg-slate-50/50">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Resolution or Escalation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Problem fixed on time with verifiable resolution proof; or auto-escalated to senior management if ignored.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Call to Action Banner */}
      <section className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-white text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Have an issue on campus? Speak up safely today.
        </h3>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          No sign-in required for anonymous submissions. Keep your private key safe to track updates.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/submit"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
          >
            Submit Anonymous Complaint
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-sm transition-colors border border-slate-700"
          >
            Explore Public Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
