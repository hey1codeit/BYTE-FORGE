import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, GitBranch, KeyRound, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">RaisoVoice</span>
              <span className="text-xs px-2 py-0.5 bg-blue-900/60 text-blue-300 border border-blue-700/50 rounded">
                The Vishanti Petition
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              &ldquo;Your Voice. Your Rights. No Silence.&rdquo;
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              A tamper-evident, anonymous student grievance portal built for collegiate accountability. 
              Protected by SHA-256 cryptographic audit chaining and automated SLA escalation to eliminate ignored student complaints.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                Zero-Knowledge Anonymous Entry
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                SHA-256 Immutable Audit Trail
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-white transition-colors">Submit Complaint</Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">Track Status</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Resolution Dashboard</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">Admin Portal (Demo)</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hackathon & Team Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Hackathon Team</h4>
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 space-y-2 text-xs">
              <div className="font-semibold text-blue-400 text-sm">
                Team ByteForge (ID: 198)
              </div>
              <p className="text-slate-400">Webster 2026 Hackathon</p>
              <p className="text-slate-300 font-medium">Motilal Nehru National Institute of Technology (MNNIT) Allahabad</p>
              <div className="pt-2 border-t border-slate-700/80 space-y-1 text-slate-400">
                <div>• Shivansh Gupta (20269185, ME)</div>
                <div>• Shivani (20269184, ME)</div>
                <div>• Tushar Gupta (20269205, ME)</div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 RaisoVoice — Team ByteForge. Built for MNNIT Allahabad students.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Client-Side SHA-256 Native Engine</span>
            <span>•</span>
            <span className="text-slate-400">Next.js & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
