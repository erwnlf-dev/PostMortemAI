import React, { useState, useEffect, useRef } from 'react';
import { PROVIDER_OPTIONS, DEFAULT_SYSTEM_PROMPT } from '../constants/defaults';

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  overlayMobile: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'flex-end',
    background: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '100%',
    maxWidth: 580,
    maxHeight: 'calc(100vh - 80px)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalMobile: {
    width: '100%',
    height: '95dvh',
    background: 'var(--bg-secondary)',
    borderRadius: '16px 16px 0 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--border-primary)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  headerSub: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
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
  providerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  providerCard: {
    padding: '14px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textAlign: 'center',
    background: 'var(--bg-primary)',
  },
  providerActive: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-subtle)',
    boxShadow: '0 0 0 3px var(--accent-subtle)',
  },
  providerLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 2,
  },
  providerDesc: {
    fontSize: 10,
    color: 'var(--text-muted)',
    lineHeight: 1.3,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
  },
  passwordWrapper: {
    position: 'relative',
  },
  showHideBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    fontSize: 11,
    fontFamily: 'var(--font-sans)',
  },
  rangeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  rangeSlider: {
    flex: 1,
    height: 4,
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'var(--bg-elevated)',
    borderRadius: 2,
    outline: 'none',
    cursor: 'pointer',
  },
  rangeValue: {
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent)',
    minWidth: 36,
    textAlign: 'right',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    outline: 'none',
    resize: 'vertical',
    minHeight: 160,
    lineHeight: 1.6,
    transition: 'all var(--transition-fast)',
  },
  resetBtn: {
    fontSize: 11,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'color var(--transition-fast)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 24px',
    borderTop: '1px solid var(--border-primary)',
    flexShrink: 0,
  },
  cancelBtn: {
    padding: '9px 20px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-primary)',
    background: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  saveBtn: {
    padding: '9px 24px',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: 'linear-gradient(135deg, #FF4D00 0%, #FF6A2B 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-glow-sm)',
  },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
};

export default function SettingsPanel({ settings, onSave, onClose, isOpen, isMobile }) {
  const [local, setLocal] = useState({ ...settings });
  const [showKey, setShowKey] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    setLocal({ ...settings });
  }, [settings]);

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement;

    // Wait a frame for component mount
    const timeoutId = setTimeout(() => {
      const focusableElements = modalRef.current?.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const elements = Array.from(
          modalRef.current?.querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
          ) || []
        );
        if (elements.length === 0) return;

        const firstEl = elements[0];
        const lastEl = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pad = isMobile ? 16 : 24;

  const handleChange = (field) => (e) => {
    setLocal((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleProviderChange = (provider) => {
    const opt = PROVIDER_OPTIONS.find((p) => p.value === provider);
    setLocal((prev) => ({
      ...prev,
      provider,
      model: opt?.defaultModel || prev.model,
    }));
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--accent)';
    e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--border-primary)';
    e.target.style.boxShadow = 'none';
  };

  const handleSave = () => {
    onSave(local);
  };

  return (
    <div
      style={isMobile ? s.overlayMobile : s.overlay}
      className="animate-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        style={isMobile ? s.modalMobile : s.modal}
        className="animate-modal"
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-secondary)' }} />
          </div>
        )}
        {/* Header */}
        <div style={{ ...s.header, padding: `${isMobile ? 12 : 20}px ${pad}px ${isMobile ? 12 : 16}px` }}>
          <div>
            <div style={s.headerLeft}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span id="settings-dialog-title" style={s.headerTitle}>AI Settings</span>
            </div>
            <div style={s.headerSub}>Configure your AI provider and generation parameters</div>
          </div>
          <button
            style={s.closeBtn}
            onClick={onClose}
            aria-label="Close Settings"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ ...s.body, padding: `20px ${pad}px` }}>
          {/* Provider Selection */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              Provider
              <span style={s.sectionLine} />
            </div>
            <div role="radiogroup" aria-label="AI Provider" style={{ ...s.providerGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}>
              {PROVIDER_OPTIONS.map((opt) => {
                const isActive = local.provider === opt.value;
                const handleKeyDown = (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProviderChange(opt.value);
                  }
                };
                return (
                  <div
                    key={opt.value}
                    role="radio"
                    aria-checked={isActive}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    style={{
                      ...s.providerCard,
                      ...(isActive ? s.providerActive : {}),
                    }}
                    onClick={() => handleProviderChange(opt.value)}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = 'var(--border-primary)';
                    }}
                  >
                    <div style={s.providerLabel}>{opt.label}</div>
                    <div style={s.providerDesc}>{opt.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connection */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              Connection
              <span style={s.sectionLine} />
            </div>

            {/* API Key */}
            <div style={s.fieldGroup}>
              <label htmlFor="settings-api-key" style={s.label}>
                <span>API Key</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Obfuscated locally only</span>
              </label>
              <div style={s.passwordWrapper}>
                <input
                  id="settings-api-key"
                  type={showKey ? 'text' : 'password'}
                  placeholder={
                    local.provider === 'anthropic'
                      ? 'sk-ant-...'
                      : local.provider === 'openai'
                        ? 'sk-...'
                        : 'Enter API key or token'
                  }
                  value={local.apiKey}
                  onChange={handleChange('apiKey')}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={{ ...s.input, paddingRight: 60, fontFamily: 'var(--font-mono)', fontSize: 12 }}
                />
                <button
                  style={s.showHideBtn}
                  onClick={() => setShowKey(!showKey)}
                  type="button"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Custom Base URL (only for custom provider) */}
            {local.provider === 'custom' && (
              <div style={s.fieldGroup} className="animate-fade-in">
                <label htmlFor="settings-base-url" style={s.label}>
                  <span>Base URL</span>
                </label>
                <input
                  id="settings-base-url"
                  type="text"
                  placeholder="https://your-api.example.com"
                  value={local.customBaseUrl}
                  onChange={handleChange('customBaseUrl')}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={{ ...s.input, fontFamily: 'var(--font-mono)', fontSize: 12 }}
                />
              </div>
            )}

            {/* Model */}
            <div style={s.fieldGroup}>
              <label htmlFor="settings-model" style={s.label}>
                <span>Model</span>
              </label>
              <input
                id="settings-model"
                type="text"
                placeholder="e.g., gpt-4o, claude-sonnet-4-20250514"
                value={local.model}
                onChange={handleChange('model')}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{ ...s.input, fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
            </div>
          </div>

          {/* Generation Parameters */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              Generation
              <span style={s.sectionLine} />
            </div>

            <div style={{ ...s.row2, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
              <div style={s.fieldGroup}>
                <label htmlFor="settings-temp" style={s.label}>
                  <span>Temperature</span>
                </label>
                <div style={s.rangeRow}>
                  <input
                    id="settings-temp"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={local.temperature}
                    onChange={(e) =>
                      setLocal((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))
                    }
                    style={s.rangeSlider}
                  />
                  <span style={s.rangeValue}>{local.temperature.toFixed(2)}</span>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label htmlFor="settings-max-tokens" style={s.label}>
                  <span>Max Tokens</span>
                </label>
                <input
                  id="settings-max-tokens"
                  type="number"
                  min="256"
                  max="32768"
                  step="256"
                  value={local.maxTokens}
                  onChange={(e) =>
                    setLocal((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))
                  }
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={{ ...s.input, fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div style={s.section}>
            <div style={s.sectionTitle}>
              System Prompt
              <span style={s.sectionLine} />
            </div>
            <div style={s.fieldGroup}>
              <label htmlFor="settings-system-prompt" style={s.label}>
                <span>Prompt Instructions</span>
                <button
                  style={s.resetBtn}
                  onClick={() =>
                    setLocal((prev) => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }))
                  }
                  type="button"
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  ↻ Reset to default
                </button>
              </label>
              <textarea
                id="settings-system-prompt"
                value={local.systemPrompt}
                onChange={handleChange('systemPrompt')}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={s.textarea}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ ...s.footer, padding: `${isMobile ? 12 : 16}px ${pad}px env(safe-area-inset-bottom, ${isMobile ? 12 : 16}px)` }}>
          <button
            style={s.cancelBtn}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            Cancel
          </button>
          <button
            style={s.saveBtn}
            onClick={handleSave}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow-sm)';
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
