'use client';

import React from 'react';
import { Clock, AlertOctagon, FastForward, CheckCircle2 } from 'lucide-react';
import { formatSlaRemaining } from '../lib/stateMachine';
import { ComplaintStatus } from '../types';

interface SlaCountdownProps {
  deadlineIso: string;
  status: ComplaintStatus;
  onAutoEscalate?: () => void;
  showDemoButton?: boolean;
}

export function SlaCountdown({
  deadlineIso,
  status,
  onAutoEscalate,
  showDemoButton = false,
}: SlaCountdownProps) {
  if (status === 'Resolved') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span className="font-medium">Resolved within SLA deadline</span>
      </div>
    );
  }

  const { text, isOverdue } = formatSlaRemaining(deadlineIso);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
      <div className="flex items-center gap-2">
        {isOverdue || status === 'Escalated' ? (
          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
        ) : (
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">SLA Resolution Window:</span>
            <span
              className={`font-bold ${
                isOverdue || status === 'Escalated' ? 'text-rose-600' : 'text-blue-700'
              }`}
            >
              {status === 'Escalated' ? 'Overdue & Escalated to Dean' : text}
            </span>
          </div>
          <p className="text-[11px] text-slate-700 mt-0.5">
            Deadline:{' '}
            {new Date(deadlineIso).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {showDemoButton && onAutoEscalate && status !== 'Escalated' && (
        <button
          onClick={onAutoEscalate}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          title="Simulate background timer hitting 0 to trigger automatic escalation"
        >
          <FastForward className="w-3.5 h-3.5 text-rose-500" />
          Demo Auto-Escalate
        </button>
      )}
    </div>
  );
}
