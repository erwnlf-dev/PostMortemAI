import React from 'react';
import { PROVIDER_OPTIONS } from '../constants/defaults';

export default function TopBar({ settings, onOpenSettings, isMobile }) {
  const provider = PROVIDER_OPTIONS.find((p) => p.value === settings.provider);

  if (isMobile) {
    return (
      <header style={mobile.topbar}>
        <div style={mobile.logoSection}>
          <div style={shared.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span style={mobile.logoText}>PostMortem</span>
            <span style={mobile.logoSub}> AI</span>
          </div>
        </div>

        <div style={mobile.right}>
          <div style={mobile.providerBadge}>
            <span style={shared.providerDot} />
            <span style={{ fontSize: 11 }}>{provider?.label || '—'}</span>
          </div>
          <button style={mobile.settingsBtn} onClick={onOpenSettings}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>
    );
  }

  /* ── Desktop TopBar ── */
  return (
    <header style={desktop.topbar}>
      <div style={desktop.logoSection}>
        <div style={shared.logoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <span style={desktop.logoText}>PostMortem</span>
          <span style={desktop.logoSub}> AI</span>
        </div>
      </div>

      <div style={desktop.center}>
        <div style={desktop.providerBadge}>
          <span style={shared.providerDot} />
          {provider?.label || 'Not configured'}
        </div>
        {settings.model && (
          <span style={desktop.modelTag}>{settings.model}</span>
        )}
      </div>

      <div style={desktop.rightSection}>
        <button
          style={desktop.settingsBtn}
          onClick={onOpenSettings}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.borderColor = 'var(--border-secondary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface)';
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Settings
        </button>
      </div>
    </header>
  );
}

/* ── Shared ── */
const shared = {
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #FF4D00 0%, #FF7A33 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px rgba(255,77,0,0.25)',
    flexShrink: 0,
  },
  providerDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 6px rgba(255,77,0,0.4)',
    flexShrink: 0,
  },
};

/* ── Mobile ── */
const mobile = {
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: 52,
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-primary)',
    flexShrink: 0,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  logoSub: {
    fontSize: 15,
    fontWeight: 300,
    color: 'var(--text-muted)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  providerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 9999,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-primary)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

/* ── Desktop ── */
const desktop = {
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 56,
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-primary)',
    flexShrink: 0,
    zIndex: 50,
    position: 'relative',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  },
  logoSub: {
    fontSize: 16,
    fontWeight: 300,
    color: 'var(--text-muted)',
    marginLeft: 2,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  providerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 12px',
    borderRadius: 9999,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-primary)',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  modelTag: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-muted)',
    padding: '3px 8px',
    borderRadius: 9999,
    background: 'var(--bg-elevated)',
    fontFamily: 'var(--font-mono)',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  settingsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    borderRadius: 10,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    transition: 'all 150ms ease',
  },
};
