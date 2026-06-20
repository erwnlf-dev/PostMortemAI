import React, { useState, useCallback, Suspense } from 'react';
import TopBar from './components/TopBar';
import IncidentForm from './components/IncidentForm';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';

const ResultPanel = React.lazy(() => import('./components/ResultPanel'));
import { useAI } from './hooks/useAI';
import { useHistory } from './hooks/useHistory';
import { useIsMobile, useIsTablet } from './hooks/useMediaQuery';
import { DEFAULT_SETTINGS } from './constants/defaults';

const TABS = [
  {
    id: 'form',
    label: 'Incident',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: 'report',
    label: 'Report',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

function obfuscateKey(key) {
  if (!key) return '';
  return btoa(encodeURIComponent(key));
}

function deobfuscateKey(obfuscated) {
  if (!obfuscated) return '';
  try {
    return decodeURIComponent(atob(obfuscated));
  } catch {
    return obfuscated; // fallback if stored raw
  }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('postmortem_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey) {
        parsed.apiKey = deobfuscateKey(parsed.apiKey);
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS };
}

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState('');
  const [mobileTab, setMobileTab] = useState('form');
  const { callAI, cancel, loading, error, clearError } = useAI();
  const {
    history,
    selectedReport,
    selectedId,
    addReport,
    deleteReport,
    selectReport,
    clearHistory,
  } = useHistory();

  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const handleSaveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    try {
      const settingsToSave = { ...newSettings };
      if (settingsToSave.apiKey) {
        settingsToSave.apiKey = obfuscateKey(settingsToSave.apiKey);
      }
      localStorage.setItem('postmortem_settings', JSON.stringify(settingsToSave));
    } catch {
      // ignore
    }
    setSettingsOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (formData) => {
      if (!settings.apiKey && settings.provider !== 'custom') {
        setSettingsOpen(true);
        return;
      }
      try {
        clearError();
        const markdown = await callAI(settings, formData);
        setCurrentReport(markdown);
        addReport({
          incidentId: formData.incidentId,
          severity: formData.severity,
          title: formData.incidentId
            ? `${formData.incidentId}`
            : 'Untitled Report',
          markdown,
          formData,
        });
        // Auto-switch to report tab on mobile after generation
        if (isMobile) {
          setMobileTab('report');
        }
      } catch {
        // Error is already handled in useAI hook
      }
    },
    [settings, callAI, addReport, clearError, isMobile]
  );

  const handleSelectReport = useCallback(
    (id) => {
      selectReport(id);
      const report = history.find((r) => r.id === id);
      if (report) {
        setCurrentReport(report.markdown);
      }
      // Auto-switch to report tab on mobile
      if (isMobile) {
        setMobileTab('report');
      }
    },
    [history, selectReport, isMobile]
  );

  /* ═══════ Desktop / Tablet Layout ═══════ */
  if (!isMobile) {
    return (
      <div style={desktopStyles.app}>
        <TopBar settings={settings} onOpenSettings={() => setSettingsOpen(true)} isMobile={false} />
        <div style={desktopStyles.main}>
          {/* History sidebar — hidden on tablet, visible on desktop */}
          {!isTablet && (
            <div style={desktopStyles.historyCol}>
              <HistoryPanel
                history={history}
                selectedId={selectedId}
                onSelect={handleSelectReport}
                onDelete={deleteReport}
                onClear={clearHistory}
              />
            </div>
          )}

          {/* On tablet: combined sidebar with tabs for Form/History */}
          {isTablet && (
            <div style={desktopStyles.tabletLeft}>
              <TabletSidebar
                activeTab={mobileTab === 'history' ? 'history' : 'form'}
                onTabChange={(t) => setMobileTab(t)}
                formContent={
                  <IncidentForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={error}
                    onClearError={clearError}
                  />
                }
                historyContent={
                  <HistoryPanel
                    history={history}
                    selectedId={selectedId}
                    onSelect={handleSelectReport}
                    onDelete={deleteReport}
                    onClear={clearHistory}
                  />
                }
              />
            </div>
          )}

          {/* Incident Form — desktop only (tablet uses combined sidebar) */}
          {!isTablet && (
            <div style={desktopStyles.formCol}>
              <IncidentForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                onClearError={clearError}
              />
            </div>
          )}

          {/* Result Panel */}
          <div style={desktopStyles.resultCol}>
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, border: '2px solid var(--border-secondary)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-sans)' }}>Loading workspace...</span>
                </div>
              </div>
            }>
              <ResultPanel report={currentReport} loading={loading} onCancel={cancel} />
            </Suspense>
          </div>
        </div>

        <SettingsPanel
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
          isOpen={settingsOpen}
          isMobile={false}
        />
      </div>
    );
  }

  /* ═══════ Mobile Layout ═══════ */
  return (
    <div style={mobileStyles.app}>
      <TopBar settings={settings} onOpenSettings={() => setSettingsOpen(true)} isMobile={true} />

      {/* Mobile content area — show one panel at a time */}
      <div style={mobileStyles.content}>
        {mobileTab === 'form' && (
          <div style={mobileStyles.panel} className="animate-fade-in">
            <IncidentForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              onClearError={clearError}
              isMobile={true}
            />
          </div>
        )}
        {mobileTab === 'report' && (
          <div style={mobileStyles.panel} className="animate-fade-in">
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, border: '2px solid var(--border-secondary)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-sans)' }}>Loading workspace...</span>
                </div>
              </div>
            }>
              <ResultPanel report={currentReport} loading={loading} onCancel={cancel} />
            </Suspense>
          </div>
        )}
        {mobileTab === 'history' && (
          <div style={mobileStyles.panel} className="animate-fade-in">
            <HistoryPanel
              history={history}
              selectedId={selectedId}
              onSelect={handleSelectReport}
              onDelete={deleteReport}
              onClear={clearHistory}
            />
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
      <nav style={mobileStyles.tabBar}>
        {TABS.map((tab) => {
          const isActive = mobileTab === tab.id;
          const hasReport = tab.id === 'report' && currentReport;
          return (
            <button
              key={tab.id}
              style={{
                ...mobileStyles.tabBtn,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              }}
              onClick={() => setMobileTab(tab.id)}
            >
              <span style={{ position: 'relative' }}>
                {tab.icon}
                {/* Notification dot for new report */}
                {hasReport && !isActive && (
                  <span style={mobileStyles.notifDot} />
                )}
              </span>
              <span style={{
                ...mobileStyles.tabLabel,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
              }}>
                {tab.label}
              </span>
              {isActive && <span style={mobileStyles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      <SettingsPanel
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
        isOpen={settingsOpen}
        isMobile={true}
      />
    </div>
  );
}

/* ── Tablet sidebar with form/history tabs ── */
function TabletSidebar({ activeTab, onTabChange, formContent, historyContent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={tabletTabBar}>
        <button
          style={{
            ...tabletTab,
            color: activeTab === 'form' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottomColor: activeTab === 'form' ? 'var(--accent)' : 'transparent',
          }}
          onClick={() => onTabChange('form')}
        >
          Form
        </button>
        <button
          style={{
            ...tabletTab,
            color: activeTab === 'history' ? 'var(--accent)' : 'var(--text-muted)',
            borderBottomColor: activeTab === 'history' ? 'var(--accent)' : 'transparent',
          }}
          onClick={() => onTabChange('history')}
        >
          History
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'form' ? formContent : historyContent}
      </div>
    </div>
  );
}

const tabletTabBar = {
  display: 'flex',
  borderBottom: '1px solid var(--border-primary)',
  flexShrink: 0,
};

const tabletTab = {
  flex: 1,
  padding: '10px 16px',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'var(--font-sans)',
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
};

/* ═══════ Desktop Styles ═══════ */
const desktopStyles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  historyCol: {
    width: 240,
    minWidth: 240,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-primary)',
    flexShrink: 0,
  },
  tabletLeft: {
    width: 400,
    minWidth: 360,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-primary)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  formCol: {
    flex: '0 0 420px',
    minWidth: 380,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-primary)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  resultCol: {
    flex: 1,
    minWidth: 0,
    background: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
};

/* ═══════ Mobile Styles ═══════ */
const mobileStyles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  panel: {
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  tabBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '6px 0 env(safe-area-inset-bottom, 6px)',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-primary)',
    flexShrink: 0,
  },
  tabBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '6px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    fontFamily: 'var(--font-sans)',
    transition: 'color var(--transition-fast)',
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: '0.02em',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 20,
    height: 2,
    borderRadius: 1,
    background: 'var(--accent)',
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent-glow)',
  },
};
