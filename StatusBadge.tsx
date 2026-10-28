import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '../types';

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const getStyle = () => {
    switch (status) {
      case 'Filed':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Escalated':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          status === 'Resolved'
            ? 'bg-emerald-500'
            : status === 'Escalated'
            ? 'bg-rose-500 animate-pulse'
            : status === 'In Review'
            ? 'bg-amber-500'
            : status === 'Assigned'
            ? 'bg-blue-500'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const getStyle = () => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200 font-semibold';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyle()}`}
    >
      {priority}
    </span>
  );
}
