/**
 * State Machine and SLA Engine for RaisoVoice
 * Enforces strict anti-corruption status transitions and real-time SLA tracking.
 */

(function (window) {
  'use strict';

  const ALLOWED_TRANSITIONS = {
    'Filed': ['Assigned', 'Escalated'],
    'Assigned': ['In Review', 'Escalated'],
    'In Review': ['Resolved', 'Escalated'],
    'Escalated': ['In Review', 'Resolved'],
    'Resolved': ['In Review'], // Reopening requires administrative justification
  };

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

  const CATEGORIES = [
    'Hostel & Accommodation',
    'Mess & Food Quality',
    'Academics & Examination',
    'Campus Infrastructure',
    'Internet & LAN',
    'Sanitation & Hygiene',
    'Proctorial & Safety',
    'Administration & Fees',
  ];

  function canTransitionStatus(currentStatus, targetStatus) {
    if (currentStatus === targetStatus) {
      return { allowed: false, reason: `Ticket is already in '${currentStatus}' status.` };
    }

    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(targetStatus)) {
      return {
        allowed: false,
        reason: `Strict State Machine Rule: Cannot jump directly from '${currentStatus}' to '${targetStatus}'. Progression required: Filed → Assigned → In Review → Resolved (or Escalated).`,
      };
    }

    return { allowed: true };
  }

  function getSlaHoursForPriority(priority) {
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

  function calculateSlaDeadline(priority, fromDate) {
    const base = fromDate ? new Date(fromDate) : new Date();
    const hours = getSlaHoursForPriority(priority);
    const deadline = new Date(base.getTime() + hours * 60 * 60 * 1000);
    return deadline.toISOString();
  }

  function isTicketOverdue(deadlineIso, currentStatus) {
    if (currentStatus === 'Resolved') return false;
    const deadline = new Date(deadlineIso).getTime();
    return Date.now() > deadline;
  }

  function formatSlaRemaining(deadlineIso) {
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

  function getDefaultDepartment(category) {
    switch (category) {
      case 'Hostel & Accommodation':
        return 'Chief Warden Office / Hostel Maintenance';
      case 'Mess & Food Quality':
        return 'Mess Management Committee & DSW';
      case 'Academics & Examination':
        return 'Dean Academics / Examination Section';
      case 'Campus Infrastructure':
        return 'Estate & Civil Maintenance Cell';
      case 'Internet & LAN':
        return 'Computer Center (CC) & Network Operations';
      case 'Sanitation & Hygiene':
        return 'Chief Sanitation Inspector Office';
      case 'Proctorial & Safety':
        return 'Chief Proctorial Board & Security';
      case 'Administration & Fees':
        return 'Registrar Office / Accounts Section';
      default:
        return 'Student Grievance Redressal Cell';
    }
  }

  window.StateMachine = {
    ALLOWED_TRANSITIONS,
    DEPARTMENTS,
    CATEGORIES,
    canTransitionStatus,
    getSlaHoursForPriority,
    calculateSlaDeadline,
    isTicketOverdue,
    formatSlaRemaining,
    getDefaultDepartment,
  };
})(window);
