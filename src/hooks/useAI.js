import { useState, useCallback, useRef, useEffect } from 'react';

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

function buildUserMessage(formData) {
  const duration = calculateDuration(formData.detectedDate, formData.resolvedDate);
  const parts = [
    `## Incident Data`,
    '',
    `**Incident ID:** ${formData.incidentId || 'N/A'}`,
    `**Severity:** ${formData.severity || 'N/A'}`,
    `**Incident Date/Time:** ${formData.date || 'N/A'}`,
    `**Incident Detected Time:** ${formData.detectedDate || 'N/A'}`,
    `**Incident Resolved Time:** ${formData.resolvedDate || 'N/A'}`,
    duration ? `**Calculated Duration (MTTR):** ${duration}` : '',
    `**Affected Systems:** ${formData.affectedSystems || 'N/A'}`,
    `**Affected Users/Customers:** ${formData.affectedUsers || 'N/A'}`,
    '',
    `### Incident Description`,
    formData.description || 'No description provided.',
    '',
    `### Timeline of Events`,
    formData.timeline || 'No timeline provided.',
    '',
    `### Actions Taken During Incident`,
    formData.actionsTaken || 'No actions documented.',
  ];
  return parts.filter(Boolean).join('\n');
}

async function handleResponseError(response) {
  let errorMsg = '';
  try {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text);
      errorMsg = parsed.error?.message || parsed.message;
    } catch {
      // Not JSON
      errorMsg = text || response.statusText;
    }
  } catch {
    errorMsg = response.statusText;
  }

  // Format error codes nicely
  if (response.status === 401) {
    return `Unauthorized (401): The API Key you provided in Settings is invalid. Please verify it.`;
  }
  if (response.status === 429) {
    return `Rate Limit Exceeded (429): You have sent too many requests or exceeded your API quota. Please try again later.`;
  }
  if (response.status >= 500) {
    return `API Service Error (${response.status}): The LLM provider is currently experiencing issues. Please try again in a few minutes.`;
  }

  return errorMsg || `API error: ${response.status} ${response.statusText}`;
}

async function callAnthropic(settings, userMessage, signal) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: settings.model || 'claude-sonnet-4-20250514',
      max_tokens: settings.maxTokens || 4096,
      temperature: settings.temperature ?? 0.3,
      system: settings.systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorMsg = await handleResponseError(response);
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callOpenAICompatible(settings, userMessage, baseUrl = 'https://api.openai.com', signal) {
  const url = `${baseUrl.replace(/\/+$/, '')}/v1/chat/completions`;
  const headers = { 'Content-Type': 'application/json' };

  if (settings.apiKey) {
    headers['Authorization'] = `Bearer ${settings.apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    signal,
    headers,
    body: JSON.stringify({
      model: settings.model || 'gpt-4o',
      max_tokens: settings.maxTokens || 4096,
      temperature: settings.temperature ?? 0.3,
      messages: [
        { role: 'system', content: settings.systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errorMsg = await handleResponseError(response);
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const callAI = useCallback(async (settings, formData) => {
    if (!settings.apiKey && settings.provider !== 'custom') {
      throw new Error('API key is required. Please configure it in Settings.');
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const userMessage = buildUserMessage(formData);
      let result;

      switch (settings.provider) {
        case 'anthropic':
          result = await callAnthropic(settings, userMessage, controller.signal);
          break;
        case 'openai':
          result = await callOpenAICompatible(settings, userMessage, 'https://api.openai.com', controller.signal);
          break;
        case 'custom': {
          if (!settings.customBaseUrl) {
            throw new Error('Custom base URL is required for custom provider.');
          }
          result = await callOpenAICompatible(settings, userMessage, settings.customBaseUrl, controller.signal);
          break;
        }
        default:
          throw new Error(`Unknown provider: ${settings.provider}`);
      }

      setLoading(false);
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        setLoading(false);
        setError('Generation request was cancelled by the user.');
        throw err;
      }
      setLoading(false);
      setError(err.message);
      throw err;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { callAI, cancel, loading, error, clearError };
}
