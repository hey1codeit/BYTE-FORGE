/**
 * Common UI Utilities, Toasts, Badges, and Shared Helpers for RaisoVoice
 */

(function (window) {
  'use strict';

  // Toast Notification
  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;

    const iconMap = {
      success: '✓',
      error: '⚠',
      warning: '!',
      info: 'ℹ',
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || 'ℹ'}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(successMsg, 'success');
      })
      .catch((err) => {
        console.error('Clipboard copy failed:', err);
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showToast(successMsg, 'success');
        } catch (e) {
          showToast('Failed to copy to clipboard', 'error');
        }
        document.body.removeChild(textarea);
      });
  }

  function getStatusBadge(status) {
    const config = {
      Filed: { bg: 'badge-filed', label: 'Filed', icon: '📝' },
      Assigned: { bg: 'badge-assigned', label: 'Assigned', icon: '👤' },
      'In Review': { bg: 'badge-in-review', label: 'In Review', icon: '🔍' },
      Resolved: { bg: 'badge-resolved', label: 'Resolved', icon: '✅' },
      Escalated: { bg: 'badge-escalated', label: 'Escalated', icon: '⚡' },
    };
    const c = config[status] || { bg: 'badge-default', label: status, icon: '•' };
    return `<span class="badge ${c.bg}"><span class="badge-icon">${c.icon}</span>${c.label}</span>`;
  }

  function getPriorityBadge(priority) {
    const config = {
      Urgent: { bg: 'badge-urgent', label: 'Urgent (24h)' },
      High: { bg: 'badge-high', label: 'High (48h)' },
      Medium: { bg: 'badge-medium', label: 'Medium (72h)' },
      Low: { bg: 'badge-low', label: 'Low (120h)' },
    };
    const c = config[priority] || { bg: 'badge-default', label: priority };
    return `<span class="badge ${c.bg}">${c.label}</span>`;
  }

  function formatDate(isoStr, includeTime = true) {
    if (!isoStr) return 'N/A';
    const d = new Date(isoStr);
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return d.toLocaleDateString('en-IN', options);
  }

  // Render Cryptographic Audit Chain Blocks
  function renderAuditChain(auditChain, targetElementId) {
    const container = document.getElementById(targetElementId);
    if (!container) return;

    if (!auditChain || auditChain.length === 0) {
      container.innerHTML = '<div class="empty-state">No cryptographic blocks recorded yet.</div>';
      return;
    }

    const verification = window.CryptoAudit.verifyAuditChain(auditChain);

    let html = `
      <div class="audit-viewer-wrapper">
        <div class="audit-header">
          <div class="audit-header-title">
            <span class="audit-icon">⛓</span>
            <h3>Cryptographic SHA-256 Audit Chain</h3>
            <span class="block-count-pill">${auditChain.length} Blocks Sealed</span>
          </div>
          <div class="verification-pill ${verification.isValid ? 'valid' : 'invalid'}">
            <span>${verification.isValid ? '✓ Chain Untampered & Verified' : '⚠ Tamper Detected!'}</span>
          </div>
        </div>

        ${
          !verification.isValid
            ? `
          <div class="tamper-alert-banner">
            <div class="tamper-alert-icon">⚠</div>
            <div>
              <strong>Cryptographic Integrity Breach!</strong>
              <p>${escapeHtml(verification.message)}</p>
            </div>
          </div>
        `
            : ''
        }

        <div class="audit-chain-timeline">
    `;

    auditChain.forEach((block, idx) => {
      const isGenesis = block.blockNumber === 1;
      const isBroken = !verification.isValid && verification.brokenBlockIndex === block.blockNumber;

      html += `
        <div class="audit-block-card ${isGenesis ? 'genesis-block' : ''} ${isBroken ? 'corrupted-block' : ''}">
          <div class="block-top-row">
            <div class="block-badge-group">
              <span class="block-number-badge">Block #${block.blockNumber} ${isGenesis ? '• Genesis' : ''}</span>
              ${getStatusBadge(block.status)}
            </div>
            <span class="block-timestamp">${formatDate(block.timestamp)}</span>
          </div>

          <div class="block-action-title">${escapeHtml(block.action)}</div>

          <div class="block-actor-row">
            <span class="actor-name"><strong>Actor:</strong> ${escapeHtml(block.actor)}</span>
            <span class="actor-role-pill">${escapeHtml(block.actorRole)}</span>
            ${block.department ? `<span class="actor-dept-pill">🏢 ${escapeHtml(block.department)}</span>` : ''}
          </div>

          <div class="block-notes">
            <p>"${escapeHtml(block.notes)}"</p>
          </div>

          <div class="hash-details-box">
            <div class="hash-row">
              <span class="hash-label">Prev Hash:</span>
              <code class="hash-code" title="${escapeHtml(block.previousHash)}">${escapeHtml(block.previousHash)}</code>
            </div>
            <div class="hash-row">
              <span class="hash-label">Block Hash:</span>
              <code class="hash-code highlight" title="${escapeHtml(block.currentHash)}">${escapeHtml(block.currentHash)}</code>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // Mobile menu toggle
  document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.getElementById('mobile-nav-toggle');
    const mobileMenu = document.getElementById('mobile-nav-menu');
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-open');
        mobileBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('is-open'));
      });
    }
  });

  window.CommonUI = {
    showToast,
    escapeHtml,
    copyToClipboard,
    getStatusBadge,
    getPriorityBadge,
    formatDate,
    renderAuditChain,
  };
})(window);
