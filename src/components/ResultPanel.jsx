import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-primary)',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  viewToggle: {
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-primary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-primary)',
    padding: 2,
  },
  toggleBtn: {
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    color: 'var(--text-muted)',
    background: 'transparent',
  },
  toggleActive: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    background: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
  },
  rawContent: {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 16,
    padding: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 'var(--radius-xl)',
    background: 'var(--accent-subtle)',
    border: '1px solid var(--accent-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  emptyDesc: {
    fontSize: 13,
    color: 'var(--text-muted)',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 1.6,
  },
  copiedToast: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    padding: '10px 20px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--success)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--success)',
    fontSize: 13,
    fontWeight: 500,
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};

export default function ResultPanel({ report, loading, onCancel }) {
  const [view, setView] = useState('rendered');
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const handleCopy = useCallback(async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = report;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [report]);

  const handleDownload = useCallback(() => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    a.download = `postmortem-${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [report]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.emptyState} className="animate-fade-in">
          <div className="spinner-glow" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              border: '3px solid var(--border-primary)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 1s linear infinite',
            }} />
            <div style={{
              position: 'absolute',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--accent-subtle)',
              filter: 'blur(4px)',
            }} />
          </div>
          <div style={s.emptyTitle}>Generating Postmortem Analysis</div>
          <div style={s.emptyDesc}>
            Our AI model is compiling incident timelines, analyzing root causes, and generating ITIL-aligned sections...
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                marginTop: 8,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--error)',
                background: 'var(--error-bg)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(248,113,113,0.15)';
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--error-bg)';
                e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)';
              }}
            >
              Cancel Generation
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={s.container}>
        <div style={s.emptyState} className="animate-fade-in">
          <div style={s.emptyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div style={s.emptyTitle}>No Report Generated Yet</div>
          <div style={s.emptyDesc}>
            Fill in the incident details on the left panel and click
            <strong style={{ color: 'var(--accent)' }}> Generate Postmortem Report </strong>
            to create an ITIL-aligned analysis.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span style={s.title}>Postmortem Report</span>
          <div style={s.viewToggle}>
            <button
              style={{ ...s.toggleBtn, ...(view === 'rendered' ? s.toggleActive : {}) }}
              onClick={() => setView('rendered')}
            >
              Rendered
            </button>
            <button
              style={{ ...s.toggleBtn, ...(view === 'raw' ? s.toggleActive : {}) }}
              onClick={() => setView('raw')}
            >
              Markdown
            </button>
          </div>
        </div>
        <div style={s.actions}>
          <button
            style={s.actionBtn}
            onClick={handleCopy}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.background = 'var(--bg-surface)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            style={s.actionBtn}
            onClick={handleDownload}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.background = 'var(--bg-surface)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download .md
          </button>
        </div>
      </div>

      <div style={s.content} className="animate-fade-in">
        {view === 'rendered' ? (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
          </div>
        ) : (
          <pre style={s.rawContent}>{report}</pre>
        )}
      </div>

      {copied && (
        <div style={s.copiedToast} className="animate-fade-in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
