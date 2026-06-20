import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function translateMarkdownToJira(markdown) {
  if (!markdown) return '';
  
  // First split into lines to process tables
  const lines = markdown.split('\n');
  let inTable = false;
  let isFirstRow = true;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if it's a separator row (e.g. |---|---| or | :--- | ---: |)
      if (/^[|:\-\s]+$/.test(line)) {
        lines.splice(i, 1);
        i--; // Adjust index since we removed a line
        continue;
      }
      if (!inTable) {
        inTable = true;
        isFirstRow = true;
      }
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      if (isFirstRow) {
        lines[i] = '|| ' + cells.join(' || ') + ' ||';
        isFirstRow = false;
      } else {
        lines[i] = '| ' + cells.join(' | ') + ' |';
      }
    } else {
      inTable = false;
    }
  }
  let converted = lines.join('\n');

  // Convert code blocks first (removes triple backticks so inline code won't match them)
  converted = converted
    .replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/g, '{code}\n$1{code}');

  // Convert headers
  converted = converted
    .replace(/^# (.*?)$/gm, 'h1. $1')
    .replace(/^## (.*?)$/gm, 'h2. $1')
    .replace(/^### (.*?)$/gm, 'h3. $1')
    .replace(/^#### (.*?)$/gm, 'h4. $1');

  // Convert inline code
  converted = converted
    .replace(/`([^`]+)`/g, '{{$1}}');

  // Convert bold using temporary placeholders to prevent italic rule conflicts
  converted = converted
    .replace(/\*\*(.*?)\*\*/g, '__TEMP_BOLD_START__$1__TEMP_BOLD_END__');

  // Convert italics (matches single asterisk, excluding pipe chars for tables)
  converted = converted
    .replace(/\*([^*|]+)\*/g, '_$1_');

  // Restore bold tags to Jira's single asterisk *bold* syntax
  converted = converted
    .replace(/__TEMP_BOLD_START__/g, '*')
    .replace(/__TEMP_BOLD_END__/g, '*');

  // Other translations
  converted = converted
    // Bullet lists: - item -> * item
    .replace(/^\s*[-*]\s+(.*?)$/gm, '* $1')
    // Ordered lists: 1. item -> # item
    .replace(/^\s*\d+\.\s+(.*?)$/gm, '# $1')
    // Links: [Text](URL) -> [Text|URL]
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]')
    // Horizontal rules: --- -> ----
    .replace(/^---$/gm, '----');

  return converted;
}

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
  const [copiedJira, setCopiedJira] = useState(false);
  const [copiedConfluence, setCopiedConfluence] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const copyTimeoutRef = useRef(null);
  const copyJiraTimeoutRef = useRef(null);
  const copyConfluenceTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleCopy = useCallback(async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setExportDropdownOpen(false);
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
      setExportDropdownOpen(false);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [report]);

  const handleCopyJira = useCallback(async () => {
    if (!report) return;
    const jiraMarkup = translateMarkdownToJira(report);
    try {
      await navigator.clipboard.writeText(jiraMarkup);
      setCopiedJira(true);
      setExportDropdownOpen(false);
      if (copyJiraTimeoutRef.current) clearTimeout(copyJiraTimeoutRef.current);
      copyJiraTimeoutRef.current = setTimeout(() => setCopiedJira(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = jiraMarkup;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedJira(true);
      setExportDropdownOpen(false);
      if (copyJiraTimeoutRef.current) clearTimeout(copyJiraTimeoutRef.current);
      copyJiraTimeoutRef.current = setTimeout(() => setCopiedJira(false), 2000);
    }
  }, [report]);

  const handleCopyConfluence = useCallback(async () => {
    if (!report) return;
    try {
      const el = document.querySelector('.markdown-body');
      let htmlContent = el ? el.innerHTML : '';
      
      if (!htmlContent) {
        htmlContent = `<div style="font-family: sans-serif;">${report.replace(/\n/g, '<br/>')}</div>`;
      }
      
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([report], { type: 'text/plain' });
      
      if (typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        });
        await navigator.clipboard.write([item]);
        setCopiedConfluence(true);
        setExportDropdownOpen(false);
        if (copyConfluenceTimeoutRef.current) clearTimeout(copyConfluenceTimeoutRef.current);
        copyConfluenceTimeoutRef.current = setTimeout(() => setCopiedConfluence(false), 2000);
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      console.warn('HTML clipboard copy failed, falling back to markdown plain text:', err);
      try {
        await navigator.clipboard.writeText(report);
        setCopiedConfluence(true);
        setExportDropdownOpen(false);
        if (copyConfluenceTimeoutRef.current) clearTimeout(copyConfluenceTimeoutRef.current);
        copyConfluenceTimeoutRef.current = setTimeout(() => setCopiedConfluence(false), 2000);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = report;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopiedConfluence(true);
        setExportDropdownOpen(false);
        if (copyConfluenceTimeoutRef.current) clearTimeout(copyConfluenceTimeoutRef.current);
        copyConfluenceTimeoutRef.current = setTimeout(() => setCopiedConfluence(false), 2000);
      }
    }
  }, [report]);

  const handleDownload = useCallback(() => {
    if (!report) return;
    setExportDropdownOpen(false);
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

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (copyJiraTimeoutRef.current) clearTimeout(copyJiraTimeoutRef.current);
      if (copyConfluenceTimeoutRef.current) clearTimeout(copyConfluenceTimeoutRef.current);
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
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 220, height: 120, marginBottom: 12 }}>
            <div style={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--accent-subtle)',
              filter: 'blur(16px)',
              opacity: 0.6,
            }} />
            
            <svg width="180" height="90" viewBox="0 0 180 90" fill="none">
              <line x1="10" y1="45" x2="170" y2="45" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="45" y1="10" x2="45" y2="80" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="135" y1="10" x2="135" y2="80" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3 3" />
              
              <circle cx="90" cy="45" r="35" stroke="var(--border-secondary)" strokeWidth="1.2" strokeDasharray="2 4" />
              <circle cx="90" cy="45" r="20" stroke="var(--accent-muted)" strokeWidth="1" />
              <circle cx="90" cy="45" r="5" fill="var(--accent)" />
              
              <path d="M90 15 L90 28 M90 62 L90 75 M60 45 L73 45 M107 45 L120 45" stroke="var(--text-muted)" strokeWidth="1.5" />
              
              <path d="M20 30 L45 30 L65 50 L115 50 L135 30 L160 30" stroke="var(--border-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="30" r="3" fill="var(--text-muted)" />
              <circle cx="160" cy="30" r="3" fill="var(--text-muted)" />
              
              <circle cx="45" cy="30" r="4" fill="var(--bg-surface)" stroke="var(--accent)" strokeWidth="1.5" />
              <circle cx="135" cy="30" r="4" fill="var(--bg-surface)" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
          </div>
          
          <div style={{ ...s.emptyTitle, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.05em' }}>
            [ SYSTEM_STANDBY: AWAITING_LOGS ]
          </div>
          <div style={s.emptyDesc}>
            Fill in the incident details on the left panel and click
            <strong style={{ color: 'var(--accent)' }}> Generate Postmortem </strong>
            to run our ITIL incident analysis.
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
          {/* Consolidated Export Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              style={{
                ...s.actionBtn,
                background: exportDropdownOpen ? 'var(--bg-hover)' : 'var(--bg-surface)',
                borderColor: exportDropdownOpen ? 'var(--border-secondary)' : 'var(--border-primary)',
              }}
              onClick={() => setExportDropdownOpen(prev => !prev)}
              aria-haspopup="true"
              aria-expanded={exportDropdownOpen}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                if (!exportDropdownOpen) {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Export
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 2, transform: exportDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {exportDropdownOpen && (
              <div className="export-dropdown-menu">
                <button className="export-dropdown-item" onClick={handleCopy}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Markdown
                </button>
                <button className="export-dropdown-item" onClick={handleCopyJira}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  Copy for Jira
                </button>
                <button className="export-dropdown-item" onClick={handleCopyConfluence}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Copy for Confluence
                </button>

                <div className="export-divider" />

                <button className="export-dropdown-item" onClick={handleDownload}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download .md File
                </button>
                <button className="export-dropdown-item" onClick={() => { setExportDropdownOpen(false); handlePrint(); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print / Save as PDF
                </button>
              </div>
            )}
          </div>
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

      {(copied || copiedJira || copiedConfluence) && (
        <div style={s.copiedToast} className="animate-fade-in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {copied && 'Copied report to clipboard'}
          {copiedJira && 'Copied Jira markup to clipboard!'}
          {copiedConfluence && 'Copied rich format for Confluence!'}
        </div>
      )}
    </div>
  );
}
