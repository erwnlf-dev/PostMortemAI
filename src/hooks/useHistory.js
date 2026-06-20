import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'postmortem_history';

function loadHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save history to localStorage:', e);
  }
}

export function useHistory() {
  const [history, setHistory] = useState(loadHistory);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addReport = useCallback((report) => {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      timestamp: new Date().toISOString(),
      incidentId: report.incidentId || 'N/A',
      severity: report.severity || 'P3',
      title: report.title || report.incidentId || 'Untitled Report',
      markdown: report.markdown,
      formData: report.formData || null,
    };
    setHistory((prev) => [entry, ...prev]);
    setSelectedId(entry.id);
    return entry;
  }, []);

  const deleteReport = useCallback(
    (id) => {
      setHistory((prev) => prev.filter((r) => r.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId]
  );

  const selectReport = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const selectedReport = history.find((r) => r.id === selectedId) || null;

  const clearHistory = useCallback(() => {
    setHistory([]);
    setSelectedId(null);
  }, []);

  return {
    history,
    selectedReport,
    selectedId,
    addReport,
    deleteReport,
    selectReport,
    clearHistory,
  };
}
