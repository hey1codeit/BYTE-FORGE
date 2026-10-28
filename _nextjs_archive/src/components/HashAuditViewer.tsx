'use client';

import React, { useState } from 'react';
import { AuditBlock } from '../types';
import { verifyAuditChain, VerificationResult } from '../lib/crypto';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Key, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface HashAuditViewerProps {
  auditChain: AuditBlock[];
  ticketId: string;
  onTamperSimulate?: (blockIndex: number, fakeNote: string) => void;
  onRestoreOriginal?: () => void;
}

export function HashAuditViewer({
  auditChain,
  ticketId,
  onTamperSimulate,
  onRestoreOriginal,
}: HashAuditViewerProps) {
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const result = verifyAuditChain(auditChain);
      setVerification(result);
      setIsVerifying(false);
    }, 250);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Cryptographic Audit Chain (SHA-256)
            </h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
              {auditChain.length} {auditChain.length === 1 ? 'Block' : 'Blocks'} Linked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every update is mathematically chained using SHA-256. Any database modification breaks the chain signature.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="btn-primary text-xs py-2 px-3.5 shadow-sm"
          >
            {isVerifying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-blue-100" />
            )}
            Verify Chain Integrity
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verification && (
        <div
          className={`p-4 border-b text-xs flex items-start gap-3 transition-all ${
            verification.isValid
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/90 border-rose-200 text-rose-900'
          }`}
        >
          {verification.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-bold text-sm">
              {verification.isValid
                ? 'Integrity Verified: Tamper-Proof Chain Unbroken'
                : 'SECURITY ALERT: Ledger Tampering Detected!'}
            </div>
            <p className="mt-0.5 text-xs opacity-90">{verification.message}</p>
            {verification.brokenBlockIndex && (
              <div className="mt-2 p-2 bg-white rounded border border-rose-200 font-mono text-[11px] space-y-1">
                <div>
                  <span className="font-semibold text-rose-700">Violation at:</span> Block #{verification.brokenBlockIndex}
                </div>
                {verification.expectedHash && (
                  <div className="truncate">
                    <span className="text-slate-500">Expected: </span>
                    <span className="text-emerald-700 font-semibold">{verification.expectedHash}</span>
                  </div>
                )}
                {verification.actualHash && (
                  <div className="truncate">
                    <span className="text-slate-500">Actual in Record: </span>
                    <span className="text-rose-700 font-semibold">{verification.actualHash}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chain Timeline Visualization */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="relative border-l-2 border-blue-200 ml-4 sm:ml-6 space-y-6">
          {auditChain.map((block, idx) => {
            const isGenesis = block.blockNumber === 1;
            const isLatest = idx === auditChain.length - 1;

            return (
              <div key={block.blockNumber} className="relative pl-6 sm:pl-8 group">
                {/* Node icon on vertical line */}
                <div
                  className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-transform ${
                    isGenesis
                      ? 'bg-blue-600 border-white text-white shadow'
                      : isLatest
                      ? 'bg-emerald-600 border-white text-white shadow'
                      : 'bg-white border-blue-400 text-blue-700'
                  }`}
                >
                  #{block.blockNumber}
                </div>

                {/* Block Content Card */}
                <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-lg p-3.5 sm:p-4 text-xs transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {block.action}
                      </span>
                      <StatusBadge status={block.status} />
                      {isGenesis && (
                        <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                          Genesis Block
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(block.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Actor & Department */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                    <div>
                      <span className="text-slate-400">Actor: </span>
                      <span className="font-semibold text-slate-800">{block.actor}</span>{' '}
                      <span className="text-[10px] text-slate-500">({block.actorRole})</span>
                    </div>
                    {block.department && (
                      <div>
                        <span className="text-slate-400">Department: </span>
                        <span className="font-medium text-slate-700">{block.department}</span>
                      </div>
                    )}
                  </div>

                  {/* Official Log Notes */}
                  <div className="mt-2 p-2.5 bg-white rounded border border-slate-200 text-slate-700 leading-relaxed">
                    {block.notes}
                  </div>

                  {/* Cryptographic Hash Details */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-slate-400 shrink-0">Prev Hash:</span>
                      <span className="truncate text-slate-600 select-all">
                        {block.previousHash}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-900 font-medium truncate">
                      <Key className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="text-slate-500 shrink-0">Block Hash:</span>
                      <span className="truncate text-blue-700 select-all font-semibold">
                        {block.currentHash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hackathon Judge Demo Tool (Tamper Simulation) */}
      <div className="bg-slate-100/70 border-t border-slate-200 p-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Judges Live Test Tool:</span>{' '}
              <span className="text-slate-600">
                Test tamper resistance by simulating an unauthorized database edit.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTamperSimulate && (
              <button
                onClick={() =>
                  onTamperSimulate(
                    0,
                    'MALICIOUS MODIFICATION: Database record quietly edited to hide maintenance delay.'
                  )
                }
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-medium px-3 py-1.5 rounded text-xs transition-colors"
                title="Inject unauthorized change to Block 1"
              >
                Simulate Rogue DB Edit
              </button>
            )}

            {onRestoreOriginal && (
              <button
                onClick={onRestoreOriginal}
                className="bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium px-3 py-1.5 rounded text-xs transition-colors"
              >
                Reset Ledger
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
