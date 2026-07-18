import React, { useState, useEffect } from 'react';
import Sidebar from '../dashboard/Sidebar';
import TopNav from '../dashboard/TopNav';
import { db, type User, type Subject } from '../../utils/db';
import { apiClient } from '../../api/client';
import { Bot, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function AISettings() {
  // Auth & Core state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Settings state
  const [provider, setProvider] = useState<'gemini'>('gemini');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error' | 'not-configured'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load auth and settings
  useEffect(() => {
    const initSettings = async () => {
      const user = await db.getCurrentUserAsync();
      if (!user) {
        window.location.href = '/login';
      } else {
        setCurrentUser(user);
        const subs = await db.getSubjects(user.id);
        setSubjects(subs);
        
        // Load saved settings if any
        const stored = localStorage.getItem(`study_notes_ai_settings_${user.id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.provider) setProvider(parsed.provider);
          } catch (e) {
            console.error(e);
          }
        }
        
        // Auto test connection on mount to show initial status
        checkInitialConnection();
        setAuthChecked(true);
      }
    };
    initSettings();
  }, []);

  const checkInitialConnection = async () => {
    setConnectionStatus('testing');
    const result = await apiClient.testConnection();
    setConnectionStatus(result.status);
    if (result.status === 'connected') {
      setStatusMessage('Connected successfully. Gemini API is active.');
    } else if (result.status === 'not-configured') {
      setStatusMessage('Gemini API key not configured.');
    } else {
      setStatusMessage(result.message || 'API request failed.');
    }
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setStatusMessage('');
    const result = await apiClient.testConnection();
    setConnectionStatus(result.status);
    if (result.status === 'connected') {
      setStatusMessage('Connection successful! Gemini API is configured and operational.');
    } else if (result.status === 'not-configured') {
      setStatusMessage('Gemini API key not configured. Please set the GEMINI_API_KEY environment variable.');
    } else {
      setStatusMessage(result.message || 'API request failed. Verify your key validity and network settings.');
    }
  };

  const handleSaveSettings = () => {
    if (!currentUser) return;
    setSaveStatus('saving');
    const settings = { provider };
    localStorage.setItem(`study_notes_ai_settings_${currentUser.id}`, JSON.stringify(settings));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleLogout = async () => {
    await db.clearCurrentUser();
    window.location.href = '/login';
  };

  if (!authChecked || !currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas-soft font-mono text-xs text-mute">
        Authenticating workspace...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-canvas overflow-hidden">
      <Sidebar
        user={currentUser}
        subjects={subjects}
        activeSubjectId={null}
        activeFilter=""
        onSelectSubject={(id) => {
          if (id) window.location.href = `/dashboard?subject=${id}`;
        }}
        onSelectFilter={(filter) => {
          window.location.href = `/dashboard?filter=${filter}`;
        }}
        onAddSubject={() => {
          window.location.href = '/dashboard';
        }}
        onEditSubject={() => {
          window.location.href = '/dashboard';
        }}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-canvas-soft">
        <TopNav
          activeSubject={null}
          activeNote={null}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onTriggerSearch={() => {
            window.location.href = '/dashboard';
          }}
          onTogglePin={() => {}}
          onToggleFavorite={() => {}}
          onDeleteNote={() => {}}
          savingStatus="idle"
          activeTab="notes"
          onTabChange={() => {
            window.location.href = '/dashboard';
          }}
        />

        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="mesh-gradient-container opacity-10"></div>
          
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink flex items-center gap-2">
                <Bot size={24} className="text-violet" />
                AI Assistant Settings
              </h1>
              <p className="text-xs text-mute mt-1">
                Configure your artificial intelligence backend connection and model preferences.
              </p>
            </div>

            {/* Config Card */}
            <div className="bg-canvas border border-hairline rounded-md shadow-level-2 p-6 space-y-6">
              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-mute block">
                  API Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as 'gemini')}
                  className="w-full h-10 px-3 bg-canvas border border-hairline rounded-sm text-xs font-medium text-ink focus:outline-none focus:border-hairline-strong transition-colors"
                >
                  <option value="gemini">Google Gemini (Gemini 2.0 Flash)</option>
                </select>
                <p className="text-[10px] text-mute font-mono">
                  Currently supported: Official Google AI SDK using Gemini 2.0 Flash model.
                </p>
              </div>

              {/* API Key Status Info */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-mute block">
                  API Key Environment Variable
                </label>
                <div className="flex items-center gap-3 px-3 py-2 bg-canvas-soft-2 border border-hairline rounded-sm font-mono text-xs text-body">
                  <span>GEMINI_API_KEY</span>
                  <span className="text-[10px] bg-canvas border border-hairline px-1.5 py-0.5 rounded-xs ml-auto text-mute">
                    Required on Backend
                  </span>
                </div>
                <p className="text-[10px] text-mute leading-relaxed">
                  For security, the API key must be defined in your environment variables. The client application never accesses this key directly, ensuring full credential protection.
                </p>
              </div>

              {/* Status Section */}
              <div className="pt-4 border-t border-hairline space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">Connection Status</span>
                  
                  {connectionStatus === 'testing' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning-deep bg-warning-soft px-2 py-0.5 rounded-full border border-warning/10">
                      <RefreshCw size={12} className="animate-spin" />
                      Testing connection...
                    </span>
                  )}
                  {connectionStatus === 'connected' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-link-deep bg-link-bg-soft px-2 py-0.5 rounded-full border border-link/10">
                      <CheckCircle size={12} className="text-link" />
                      Connected
                    </span>
                  )}
                  {connectionStatus === 'not-configured' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-error-deep bg-error-soft px-2 py-0.5 rounded-full border border-error/10">
                      <AlertCircle size={12} className="text-error" />
                      Not Configured
                    </span>
                  )}
                  {connectionStatus === 'error' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-error-deep bg-error-soft px-2 py-0.5 rounded-full border border-error/10">
                      <AlertCircle size={12} className="text-error" />
                      Error Failed
                    </span>
                  )}
                  {connectionStatus === 'idle' && (
                    <span className="text-[11px] text-mute font-mono">Untested</span>
                  )}
                </div>

                {statusMessage && (
                  <div className={`p-3 rounded-sm border text-xs leading-relaxed flex items-start gap-2.5 ${
                    connectionStatus === 'connected'
                      ? 'bg-link-bg-soft/20 border-link/20 text-link-deep'
                      : 'bg-error-soft/30 border-error/20 text-error-deep'
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {connectionStatus === 'connected' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    </div>
                    <div>
                      {statusMessage}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-hairline flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={connectionStatus === 'testing'}
                  className="px-4 py-2 bg-canvas hover:bg-canvas-soft-2 text-ink border border-hairline rounded-full transition-colors cursor-pointer text-xs font-semibold shadow-level-1 disabled:opacity-50 h-9 flex items-center gap-2"
                >
                  {connectionStatus === 'testing' && <RefreshCw size={12} className="animate-spin" />}
                  Test Connection
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                  className="px-5 py-2 bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] transition-all rounded-full cursor-pointer text-xs font-semibold shadow-level-3 disabled:opacity-50 h-9 flex items-center gap-2"
                >
                  {saveStatus === 'saving' ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  {saveStatus === 'saved' ? 'Saved!' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
