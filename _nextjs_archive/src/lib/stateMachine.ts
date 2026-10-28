import { ComplaintStatus, ComplaintPriority } from '../types';

export const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  'Filed': ['Assigned', 'Escalated'],
  'Assigned': ['In Review', 'Escalated'],
  'In Review': ['Resolved', 'Escalated'],
  'Escalated': ['In Review', 'Resolved'],
  'Resolved': ['In Review'], // Reopening requires administrative justification
};

/**
 * Validates if the transition from currentStatus to newStatus complies with
 * strict anti-corruption state flow requirements.
 */
export function canTransitionStatus(
  currentStatus: ComplaintStatus,
  targetStatus: ComplaintStatus
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: false, reason: `Ticket is already in '${currentStatus}' status.` };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Strict State Machine Rule: Cannot jump directly from '${currentStatus}' to '${targetStatus}'. Orderly progression required: Filed → Assigned → In Review → Resolved (or Escalated).`,
    };
  }

  return { allowed: true };
}

/**
 * Returns SLA hours based on priority
 */
export function getSlaHoursForPriority(priority: ComplaintPriority): number {
  switch (priority) {
    case 'Urgent':
      return 24; // 24 hours
    case 'High':
      return 48; // 48 hours
    case 'Medium':
      return 72; // 3 days
    case 'Low':
      return 120; // 5 days
    default:
      return 72;
  }
}

/**
 * Computes ISO deadline from starting date and priority
 */
export function calculateSlaDeadline(priority: ComplaintPriority, fromDate = new Date()): string {
  const hours = getSlaHoursForPriority(priority);
  const deadline = new Date(fromDate.getTime() + hours * 60 * 60 * 1000);
  return deadline.toISOString();
}

/**
 * Checks if a ticket is overdue relative to current time
 */
export function isTicketOverdue(deadlineIso: string, currentStatus: ComplaintStatus): boolean {
  if (currentStatus === 'Resolved') return false;
  const deadline = new Date(deadlineIso).getTime();
  const now = Date.now();
  return now > deadline;
}

/**
 * Formats time remaining or overdue duration
 */
export function formatSlaRemaining(deadlineIso: string): { text: string; isOverdue: boolean; percentage: number } {
  const deadline = new Date(deadlineIso).getTime();
  const now = Date.now();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
    const overdueMins = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60));
    return {
      text: `${overdueHours}h ${overdueMins}m Overdue`,
      isOverdue: true,
      percentage: 100,
    };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    text: `${hours}h ${mins}m left`,
    isOverdue: false,
    percentage: Math.max(5, Math.min(100, Math.round((diffMs / (72 * 3600 * 1000)) * 100))),
  };
}
