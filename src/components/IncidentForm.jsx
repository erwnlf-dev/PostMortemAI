import React, { useState, useEffect } from 'react';
import { SEVERITY_LEVELS } from '../constants/severity';

const initialForm = {
  incidentId: '',
  severity: 'P2',
  date: '',
  detectedDate: '',
  resolvedDate: '',
  affectedSystems: '',
  affectedUsers: '',
  description: '',
  timeline: '',
  actionsTaken: '',
};

function calculateDuration(start, end) {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate;
  if (isNaN(diffMs) || diffMs < 0) return '';

  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours === 0) return `${mins} minute(s)`;
  return `${hours} hour(s) ${mins} minute(s)`;
}

export default function IncidentForm({ onSubmit, loading, error, onClearError, isMobile }) {
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem('postmortem_form_draft');
      return saved ? JSON.parse(saved) : initialForm;
    } catch {
      return initialForm;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('postmortem_form_draft', JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [form]);

  const handleChange = (field) => (e) => {
    if (onClearError) onClearError();
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--accent)';
    e.target.style.boxShadow = '0 0 0 3px rgba(255,77,0,0.06)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--border-primary)';
    e.target.style.boxShadow = 'none';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    onSubmit({ ...form });
  };

  const isValid = form.description.trim().length > 0;
  const pad = isMobile ? 16 : 24;
  const duration = calculateDuration(form.detectedDate, form.resolvedDate);

  return (
    <form onSubmit={handleSubmit} style={s.container}>
      {/* Header */}
      <div style={{ padding: `${isMobile ? 16 : 20}px ${pad}px 0`, flexShrink: 0 }}>
        <div style={s.title}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: 'middle' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          New Incident Report
        </div>
        <div style={s.subtitle}>Fill in the incident details to generate an ITIL-aligned postmortem</div>
      </div>

      {/* Scrollable form body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `0 ${pad}px ${pad}px` }}>
        {error && (
          <div style={s.errorBox} className="animate-fade-in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── Identity Section ── */}
        <div style={s.sectionLabel}>
          Incident Identity
          <span style={s.sectionLine} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 14 }}>
          <div style={s.fieldGroup}>
            <label htmlFor="incident-id" style={s.label}>Incident ID</label>
            <input id="incident-id" type="text" placeholder="e.g., INC-2024-0042" value={form.incidentId} onChange={handleChange('incidentId')} onFocus={handleFocus} onBlur={handleBlur} style={s.input} />
          </div>
          <div style={s.fieldGroup}>
            <label htmlFor="incident-date" style={s.label}>Date & Time</label>
            <input id="incident-date" type="datetime-local" value={form.date} onChange={handleChange('date')} onFocus={handleFocus} onBlur={handleBlur} style={{ ...s.input, colorScheme: 'dark' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 14, marginTop: 14 }}>
          <div style={s.fieldGroup}>
            <label htmlFor="incident-detected" style={s.label}>Detected Date & Time</label>
            <input id="incident-detected" type="datetime-local" value={form.detectedDate} onChange={handleChange('detectedDate')} onFocus={handleFocus} onBlur={handleBlur} style={{ ...s.input, colorScheme: 'dark' }} />
          </div>
          <div style={s.fieldGroup}>
            <label htmlFor="incident-resolved" style={s.label}>Resolved Date & Time</label>
            <input id="incident-resolved" type="datetime-local" value={form.resolvedDate} onChange={handleChange('resolvedDate')} onFocus={handleFocus} onBlur={handleBlur} style={{ ...s.input, colorScheme: 'dark' }} />
          </div>
        </div>

        {duration && (
          <div style={{
            marginTop: 14,
            padding: '10px 14px',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-muted)',
            borderRadius: 10,
            fontSize: 12,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              Calculated MTTR (Duration): <strong>{duration}</strong>
            </span>
          </div>
        )}

        {/* ── Severity ── */}
        <div style={{ ...s.fieldGroup, marginTop: 16 }}>
          <label style={s.label}>Severity Level</label>
          <div role="radiogroup" aria-label="Severity Level" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 8 }}>
            {SEVERITY_LEVELS.map((sev) => {
              const isActive = form.severity === sev.value;
              const handleKeyDown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onClearError) onClearError();
                  setForm((prev) => ({ ...prev, severity: sev.value }));
                }
              };
              return (
                <div
                  key={sev.value}
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  style={{
                    padding: isMobile ? '10px 8px' : '8px 4px',
                    borderRadius: 10,
                    border: `1px solid ${isActive ? sev.border : 'var(--border-primary)'}`,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textAlign: 'center',
                    background: isActive ? sev.bg : 'var(--bg-primary)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onClick={() => {
                    if (onClearError) onClearError();
                    setForm((prev) => ({ ...prev, severity: sev.value }));
                  }}
                >
                  <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 600, display: 'block', color: isActive ? sev.color : 'var(--text-muted)' }}>
                    {sev.shortLabel}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, display: 'block', lineHeight: 1.3 }}>
                    {sev.value === 'P1' ? 'Critical' : sev.value === 'P2' ? 'High' : sev.value === 'P3' ? 'Medium' : 'Low'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={s.divider} />

        {/* ── Impact Section ── */}
        <div style={s.sectionLabel}>
          Impact Scope
          <span style={s.sectionLine} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 14 }}>
          <div style={s.fieldGroup}>
            <label htmlFor="affected-systems" style={s.label}>Affected Systems</label>
            <input id="affected-systems" type="text" placeholder="e.g., Payment Gateway, Auth Service" value={form.affectedSystems} onChange={handleChange('affectedSystems')} onFocus={handleFocus} onBlur={handleBlur} style={s.input} />
          </div>
          <div style={s.fieldGroup}>
            <label htmlFor="affected-users" style={s.label}>Affected Users</label>
            <input id="affected-users" type="text" placeholder="e.g., ~15,000 enterprise users" value={form.affectedUsers} onChange={handleChange('affectedUsers')} onFocus={handleFocus} onBlur={handleBlur} style={s.input} />
          </div>
        </div>

        <div style={s.divider} />

        {/* ── Details Section ── */}
        <div style={s.sectionLabel}>
          Incident Details
          <span style={s.sectionLine} />
        </div>

        <div style={s.fieldGroup}>
          <label htmlFor="incident-description" style={s.label}>Description *</label>
          <textarea
            id="incident-description"
            placeholder="Describe what happened — the observed symptoms, how the incident was detected, and the scope of the impact..."
            value={form.description}
            onChange={handleChange('description')}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ ...s.textarea, minHeight: isMobile ? 90 : 100 }}
          />
          <div style={s.hint}>Primary input for AI analysis. Be as detailed as possible.</div>
        </div>

        <div style={s.fieldGroup}>
          <label htmlFor="incident-timeline" style={s.label}>Timeline of Events</label>
          <textarea
            id="incident-timeline"
            placeholder={"09:15 — Monitoring alert triggered\n09:18 — On-call engineer acknowledged\n09:25 — Root cause identified\n09:40 — Mitigation applied\n10:00 — Full recovery confirmed"}
            value={form.timeline}
            onChange={handleChange('timeline')}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ ...s.textarea, minHeight: isMobile ? 90 : 110, fontFamily: 'var(--font-mono)', fontSize: 12 }}
          />
        </div>

        <div style={s.fieldGroup}>
          <label htmlFor="incident-actions" style={s.label}>Actions Taken</label>
          <textarea
            id="incident-actions"
            placeholder="What immediate actions were taken to restore service? Include escalation steps, rollbacks, restarts, etc."
            value={form.actionsTaken}
            onChange={handleChange('actionsTaken')}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ ...s.textarea, minHeight: isMobile ? 70 : 80 }}
          />
        </div>
      </div>

      {/* Action buttons — fixed at bottom */}
      <div style={{ padding: `${isMobile ? 12 : 16}px ${pad}px`, borderTop: '1px solid var(--border-primary)', flexShrink: 0, display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all fields? This will delete your current draft.')) {
              setForm(initialForm);
              sessionStorage.removeItem('postmortem_form_draft');
              if (onClearError) onClearError();
            }
          }}
          style={{
            padding: isMobile ? '14px 16px' : '12px 20px',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-secondary)';
            e.currentTarget.style.background = 'var(--bg-elevated)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.background = 'var(--bg-surface)';
          }}
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={loading || !isValid}
          style={{
            ...s.submitBtn,
            flex: 1,
            padding: isMobile ? '14px 24px' : '12px 24px',
            ...(loading || !isValid ? s.submitBtnDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (!loading && isValid) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(255,77,0,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && isValid) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(255,77,0,0.25)';
            }
          }}
        >
          {loading ? (
            <>
              <span style={s.spinner} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Generate Postmortem</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    background: 'var(--border-primary)',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  input: {
    padding: '10px 14px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'all 150ms ease',
  },
  textarea: {
    padding: '10px 14px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    resize: 'none',
    lineHeight: 1.5,
    transition: 'all 150ms ease',
  },
  divider: {
    height: 1,
    background: 'var(--border-primary)',
    margin: '18px 0',
  },
  hint: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 2,
    fontStyle: 'italic',
  },
  errorBox: {
    padding: '10px 14px',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.25)',
    borderRadius: 10,
    color: 'var(--error)',
    fontSize: 12,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  submitBtn: {
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    color: '#fff',
    background: 'linear-gradient(135deg, #FF4D00 0%, #FF6A2B 100%)',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 150ms ease',
    boxShadow: '0 0 12px rgba(255,77,0,0.25)',
    letterSpacing: '0.01em',
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
