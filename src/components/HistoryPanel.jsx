import React from 'react';
import { SEVERITY_LEVELS } from '../constants/severity';

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 16px',
    borderBottom: '1px solid var(--border-primary)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  count: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-muted)',
    background: 'var(--bg-elevated)',
    padding: '2px 7px',
    borderRadius: 'var(--radius-full)',
  },
  clearBtn: {
    fontSize: 11,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: 8,
  },
  item: {
    padding: '12px 12px',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    marginBottom: 4,
    border: '1px solid transparent',
    position: 'relative',
  },
  itemActive: {
    background: 'var(--accent-subtle)',
    borderColor: 'var(--accent-muted)',
  },
  itemHover: {
    background: 'var(--bg-hover)',
  },
  itemTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemId: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
  },
  severityBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 'var(--radius-xs)',
    letterSpacing: '0.03em',
  },
  itemDate: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  itemBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
    opacity: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 8,
    padding: 20,
  },
  emptyIcon: {
    color: 'var(--text-muted)',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};

function formatDate(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HistoryPanel({ history, selectedId, onSelect, onDelete, onClear }) {
  if (!history || history.length === 0) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerLeft}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={s.title}>History</span>
          </div>
        </div>
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div style={s.emptyText}>
            Generated reports will<br />appear here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={s.title}>History</span>
          <span style={s.count}>{history.length}</span>
        </div>
        <button
          style={s.clearBtn}
          onClick={onClear}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--error)';
            e.currentTarget.style.background = 'var(--error-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'none';
          }}
        >
          Clear
        </button>
      </div>

      <div style={s.list}>
        {history.map((item, idx) => {
          const isActive = item.id === selectedId;
          const sev = SEVERITY_LEVELS.find((l) => l.value === item.severity);

          const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(item.id);
            }
          };

          return (
            <div
              key={item.id}
              className={`animate-fade-in history-item ${isActive ? 'active' : ''}`}
              style={{
                ...s.item,
                ...(isActive ? s.itemActive : {}),
                animationDelay: `${idx * 40}ms`,
              }}
              onClick={() => onSelect(item.id)}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={0}
              aria-label={`Select report for incident ${item.incidentId || 'N/A'}`}
            >
              <div style={s.itemTop}>
                <span style={s.itemId}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10, marginRight: 4, fontWeight: 500 }}>ID:</span>
                  {item.incidentId || 'UNNAMED'}
                </span>
                {sev && (
                  <span
                    style={{
                      ...s.severityBadge,
                      color: sev.color,
                      background: sev.bg,
                      border: `1px solid ${sev.border}`,
                    }}
                  >
                    {sev.shortLabel}
                  </span>
                )}
              </div>
              <div style={s.itemBottom}>
                <span style={{ ...s.itemDate, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.02em' }}>
                  {formatDate(item.timestamp).toUpperCase()}
                </span>
              </div>
              <button
                className="delete-btn"
                style={s.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--error-bg)';
                  e.currentTarget.style.color = 'var(--error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
                aria-label="Delete report"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
