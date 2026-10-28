'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X, PlusCircle, Search, BarChart3, Lock, ExternalLink } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Submit Complaint', href: '/submit', icon: PlusCircle },
    { name: 'Track Complaint', href: '/track', icon: Search },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Admin Portal', href: '/admin', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">RaisoVoice</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 hidden sm:inline-block">
                  Vishanti Petition
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium hidden sm:block">
                MNNIT Allahabad Grievance System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Team Tag & Action */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 block">Webster 2026 Hackathon</span>
              <span className="text-xs font-bold text-blue-700">Team ByteForge #198</span>
            </div>
            <Link
              href="/submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              File Petition
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/submit"
              className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md"
            >
              File
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="px-3 py-2 mb-2 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
            <strong>ByteForge (Team 198)</strong> • MNNIT Allahabad
          </div>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
