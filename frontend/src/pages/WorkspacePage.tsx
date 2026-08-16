import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { Project, ProjectFile, ChatMessage } from '../types';
import Editor from '@monaco-editor/react';
import {
  Sparkles, ArrowLeft, FileCode, FolderOpen,
  Download, Send, RefreshCw, ChevronRight,
  Play, Square, Terminal, Plus, X, Layers,
  Code2, Activity, Zap
} from 'lucide-react';

/* ── File type icon color ── */
const fileColor = (name: string): string => {
  if (name.endsWith('.java')) return '#f89820';
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return '#3178c6';
  if (name.endsWith('.css')) return '#264de4';
  if (name.endsWith('.yml') || name.endsWith('.yaml')) return '#cc3534';
  if (name.endsWith('.json')) return '#f59e0b';
  if (name.endsWith('.md')) return '#94a3b8';
  if (name.endsWith('.xml')) return '#e37933';
  if (name.endsWith('.sql')) return '#336791';
  return '#6366f1';
};

const fileExt = (name: string) => name.split('.').pop()?.toUpperCase() ?? 'FILE';

const monacoLang = (name: string): string => {
  if (name.endsWith('.java')) return 'java';
  if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'typescript';
  if (name.endsWith('.jsx') || name.endsWith('.js')) return 'javascript';
  if (name.endsWith('.css')) return 'css';
  if (name.endsWith('.html')) return 'html';
  if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'yaml';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.xml')) return 'xml';
  if (name.endsWith('.sql')) return 'sql';
  if (name.endsWith('.md')) return 'markdown';
  return 'plaintext';
};

/* ── AI Message bubble ── */
interface MsgProps { msg: ChatMessage; streaming?: boolean }
const MessageBubble: React.FC<MsgProps> = ({ msg, streaming }) => {
  const isUser = msg.role === 'USER';
  // Detect code blocks in assistant messages
  const parts = msg.content.split(/(```[\s\S]*?```)/g);

  return (
    <div style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '88%',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={10} color="#fff" />
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--t3)' }}>Craftly AI</span>
        </div>
      )}
      <div style={{
        background: isUser ? 'var(--primary)' : 'var(--bg-elevated)',
        color: isUser ? '#fff' : 'var(--t2)',
        border: isUser ? 'none' : '1px solid var(--border)',
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        padding: '10px 14px', fontSize: '0.85rem', lineHeight: 1.65,
        wordBreak: 'break-word',
      }}>
        {!isUser ? parts.map((part, i) => {
          if (part.startsWith('```')) {
            const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
            return (
              <pre key={i} style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', margin: '8px 0', overflowX: 'auto', color: '#94a3b8', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>
                {code}
              </pre>
            );
          }
          return <span key={i}>{part}</span>;
        }) : msg.content}
        {streaming && <span className="stream-dot" style={{ marginLeft: 4 }} />}
      </div>
    </div>
  );
};

/* ═════════════════════════════════════
   WORKSPACE PAGE
═════════════════════════════════════ */
export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['$ Craftly workspace initialized', '$ Spring Boot 3 backend ready', '$ React frontend ready']);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.get<Project>(`/api/projects/${id}`),
      apiClient.get<ProjectFile[]>(`/api/projects/${id}/files`),
    ]).then(([projRes, filesRes]) => {
      setProject(projRes.data);
      setFiles(filesRes.data);
      if (filesRes.data.length > 0) loadFile(filesRes.data[0]);
    });
    apiClient.post(`/api/projects/${id}/chat/sessions`, { title: 'Workspace' })
      .then(res => setSessionId(res.data.id))
      .catch(() => null);
  }, [id]);

  const loadFile = (file: ProjectFile) => {
    setActiveFile(file);
    apiClient.get<ProjectFile>(`/api/projects/${id}/files/${file.id}`)
      .then(res => setFileContent(res.data.content || `// ${file.fileName}`))
      .catch(() => setFileContent(`// Could not load ${file.fileName}`));
  };

  const handleSend = useCallback(async () => {
    if (!prompt.trim() || !id || !sessionId || streaming) return;
    const text = prompt.trim();
    setPrompt('');
    setMessages(prev => [...prev, { role: 'USER', content: text }]);
    setStreaming(true);
    setMessages(prev => [...prev, { role: 'ASSISTANT', content: '' }]);

    try {
      const token = localStorage.getItem('craftly_token');
      const res = await fetch(`https://craftly-api.onrender.com/api/projects/${id}/chat/sessions/${sessionId}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: text }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === 'ASSISTANT') last.content += chunk;
            return updated;
          });
        }
      }
      // Refresh files after generation
      const refreshed = await apiClient.get<ProjectFile[]>(`/api/projects/${id}/files`);
      setFiles(refreshed.data);
      setTerminalLogs(prev => [...prev, `$ AI generated ${refreshed.data.length} files`, `$ Build updated successfully`]);
    } catch (err) {
      console.error('Stream error:', err);
    } finally {
      setStreaming(false);
    }
  }, [prompt, id, sessionId, streaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font)', overflow: 'hidden' }}>

      {/* ── TOP BAR ── */}
      <header style={{
        height: 48, flexShrink: 0,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 12, zIndex: 100,
      }}>
        {/* Left: Logo + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, borderRadius: 6 }}
          >
            <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={11} color="#fff" />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--t2)' }}>Craftly</span>
          </button>
          <ChevronRight size={12} style={{ color: 'var(--t3)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project?.name || 'Loading…'}
          </span>

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--r-full)', border: '1px solid rgba(16,185,129,0.2)', flexShrink: 0 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', animation: streaming ? 'blink 0.7s infinite' : 'none' }} />
            <span style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.04em' }}>{streaming ? 'GENERATING' : 'READY'}</span>
          </div>
        </div>

        {/* Center: View tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: 3 }}>
          {[
            { key: 'editor', label: 'Editor', icon: <Code2 size={13} /> },
            { key: 'preview', label: 'Preview', icon: <Play size={13} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
                background: activeTab === tab.key ? 'var(--bg-elevated)' : 'transparent',
                color: activeTab === tab.key ? 'var(--t1)' : 'var(--t3)',
                fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font)',
                transition: 'all 0.15s',
              }}
            >{tab.icon} {tab.label}</button>
          ))}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowTerminal(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: showTerminal ? 'rgba(99,102,241,0.12)' : 'none', border: showTerminal ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)', color: showTerminal ? 'var(--primary)' : 'var(--t3)', padding: '5px 10px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font)', transition: 'all 0.15s' }}
          >
            <Terminal size={12} /> Terminal
          </button>
          <button
            onClick={() => window.open(`https://craftly-api.onrender.com/api/projects/${id}/files/download`, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', color: 'var(--t2)', padding: '5px 10px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font)' }}
          >
            <Download size={12} /> Export ZIP
          </button>
        </div>
      </header>

      {/* ── MAIN BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── FILE EXPLORER SIDEBAR ── */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FolderOpen size={12} style={{ color: 'var(--t3)' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--t3)' }}>Explorer</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--t3)' }}>{files.length}</span>
          </div>

          {/* File list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
            {files.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--t3)' }}>
                No files yet.<br />Prompt the AI to generate code.
              </div>
            ) : files.map(file => {
              const name = file.fileName || file.filePath.split('/').pop() || file.filePath;
              const isActive = activeFile?.id === file.id;
              return (
                <button
                  key={file.id}
                  onClick={() => loadFile(file)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '5px 8px', borderRadius: 'var(--r-sm)', border: 'none',
                    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <div style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileCode size={13} style={{ color: fileColor(name) }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: isActive ? 'var(--t1)' : 'var(--t2)', fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {name}
                  </span>
                  {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── CENTER: EDITOR or PREVIEW ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* File tab bar */}
          {activeFile && activeTab === 'editor' && (
            <div style={{ height: 36, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 8px', gap: 2, overflowX: 'auto' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 12px 0 10px', height: 28, borderRadius: 'var(--r-sm)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                fontSize: '0.78rem', color: 'var(--t1)', fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                <FileCode size={12} style={{ color: fileColor(activeFile.fileName || activeFile.filePath) }} />
                {activeFile.fileName || activeFile.filePath.split('/').pop()}
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--primary)', marginLeft: 4 }} />
              </div>
            </div>
          )}

          {/* Editor / Preview */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeTab === 'editor' ? (
              activeFile ? (
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={monacoLang(activeFile.fileName || activeFile.filePath)}
                  value={fileContent}
                  onChange={v => setFileContent(v || '')}
                  options={{
                    fontSize: 13.5,
                    fontFamily: '"JetBrains Mono", monospace',
                    lineHeight: 24,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    renderLineHighlight: 'gutter',
                    smoothScrolling: true,
                    padding: { top: 16 },
                  }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--t3)' }}>
                  <Code2 size={40} style={{ opacity: 0.2 }} />
                  <span style={{ fontSize: '0.875rem' }}>Select a file to start editing</span>
                </div>
              )
            ) : (
              <iframe
                src={`https://craftly-api.onrender.com/api/projects/${id}/previews/live`}
                title="Live preview"
                style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
              />
            )}
          </div>

          {/* Terminal strip */}
          {showTerminal && (
            <div style={{
              height: 180, borderTop: '1px solid var(--border)',
              background: 'var(--bg)', flexShrink: 0, display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ padding: '6px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={11} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Terminal</span>
                <button onClick={() => setShowTerminal(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>
                  <X size={12} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: '0.75rem', lineHeight: 1.7 }}>
                {terminalLogs.map((log, i) => (
                  <div key={i} style={{ color: log.startsWith('$') ? 'var(--success)' : 'var(--t3)' }}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: AI CHAT PANEL ── */}
        <aside style={{
          width: 340, flexShrink: 0,
          background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--t1)' }}>AI Assistant</span>
            {streaming && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 600 }}>
                <div className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Generating
              </div>
            )}
          </div>

          {/* Welcome (shown when no messages) */}
          {messages.length === 0 && (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--t3)', lineHeight: 1.6 }}>
                Ask me to add features, fix bugs, or refactor code. I have full context of your project files.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Add user authentication with JWT', 'Create a REST endpoint for payments', 'Refactor this to use clean architecture'].map(s => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s)}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)', padding: '8px 12px', textAlign: 'left',
                      fontSize: '0.78rem', color: 'var(--t2)', cursor: 'pointer',
                      fontFamily: 'var(--font)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--t1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--t2)'; }}
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <MessageBubble
                key={i} msg={msg}
                streaming={streaming && i === messages.length - 1 && msg.role === 'ASSISTANT'}
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streaming}
              rows={1}
              placeholder="Ask AI to edit or generate code… (⏎ to send)"
              style={{
                flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', color: 'var(--t1)',
                fontFamily: 'var(--font)', fontSize: '0.82rem',
                padding: '9px 12px', outline: 'none', resize: 'none',
                lineHeight: 1.5, maxHeight: 100, transition: 'border-color 0.18s',
              }}
              onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--primary)'; }}
              onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--border)'; }}
            />
            <button
              onClick={handleSend}
              disabled={streaming || !prompt.trim()}
              style={{
                width: 34, height: 34, borderRadius: 'var(--r-md)', border: 'none',
                background: prompt.trim() && !streaming ? 'var(--primary)' : 'var(--bg-elevated)',
                color: prompt.trim() && !streaming ? '#fff' : 'var(--t3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: prompt.trim() && !streaming ? 'pointer' : 'not-allowed',
                flexShrink: 0, transition: 'all 0.18s',
              }}
            >
              {streaming ? <div className="spinner" style={{ width: 13, height: 13 }} /> : <Send size={14} />}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
