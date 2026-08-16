import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { Project, ProjectFile, ChatMessage } from '../types';
import Editor from '@monaco-editor/react';
import { FileCode, Play, Download, Send, ArrowLeft, Terminal, FolderOpen, Sparkles, RefreshCw } from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    // Load Project details & File tree
    apiClient.get<Project>(`/api/projects/${id}`).then((res) => setProject(res.data));
    apiClient.get<ProjectFile[]>(`/api/projects/${id}/files`).then((res) => {
      setFiles(res.data);
      if (res.data.length > 0) {
        selectFile(res.data[0]);
      }
    });

    // Init or fetch Chat session
    apiClient.post(`/api/projects/${id}/chat/sessions`, { title: 'AI Workspace Chat' })
      .then((res) => setSessionId(res.data.id))
      .catch(() => null);

  }, [id]);

  const selectFile = (file: ProjectFile) => {
    setActiveFile(file);
    apiClient.get<ProjectFile>(`/api/projects/${id}/files/${file.id}`)
      .then((res) => setFileContent(res.data.content || '// Empty workspace file'))
      .catch(() => setFileContent('// Failed to load file content'));
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !id || !sessionId || streaming) return;

    const userMsg: ChatMessage = { role: 'USER', content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt('');
    setStreaming(true);

    const assistantMsg: ChatMessage = { role: 'ASSISTANT', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      // Connect to SSE Stream endpoint
      const token = localStorage.getItem('craftly_token');
      const response = await fetch(`https://craftly-api.onrender.com/api/projects/${id}/chat/sessions/${sessionId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: currentPrompt })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'ASSISTANT') {
              last.content += chunk;
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('SSE Stream error:', err);
    } finally {
      setStreaming(false);
      // Refresh files list
      apiClient.get<ProjectFile[]>(`/api/projects/${id}/files`).then((res) => setFiles(res.data));
    }
  };

  const handleDownloadProjectZip = () => {
    window.open(`https://craftly-api.onrender.com/api/projects/${id}/files/download`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* Top IDE Header Bar */}
      <header style={{ height: '48px', borderBottom: '1px solid #1f2937', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{project?.name || 'Workspace Project'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('editor')}
            style={{ padding: '0.35rem 0.75rem', background: activeTab === 'editor' ? '#1f2937' : 'transparent', border: 'none', color: activeTab === 'editor' ? '#fff' : '#9ca3af', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Code Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            style={{ padding: '0.35rem 0.75rem', background: activeTab === 'preview' ? '#1f2937' : 'transparent', border: 'none', color: activeTab === 'preview' ? '#fff' : '#9ca3af', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Play size={14} style={{ color: '#10b981' }} /> Live Preview
          </button>

          <button
            onClick={handleDownloadProjectZip}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#1f2937', color: '#60a5fa', border: '1px solid #374151', padding: '0.35rem 0.75rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <Download size={14} /> Export ZIP
          </button>
        </div>
      </header>

      {/* Main IDE Layout Split Container */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Sidebar: Workspace File Explorer */}
        <aside style={{ width: '240px', background: '#0b0f19', borderRight: '1px solid #1f2937', padding: '0.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <FolderOpen size={14} /> Files Explorer
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => selectFile(file)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.35rem 0.5rem',
                  borderRadius: '0.25rem', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem',
                  background: activeFile?.id === file.id ? '#1f2937' : 'transparent',
                  color: activeFile?.id === file.id ? '#60a5fa' : '#d1d5db'
                }}
              >
                <FileCode size={14} /> {file.fileName || file.filePath}
              </button>
            ))}
          </div>
        </aside>

        {/* Center Panel: Code Editor OR Live Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
          {activeTab === 'editor' ? (
            <Editor
              height="100%"
              theme="vs-dark"
              path={activeFile?.fileName || 'index.tsx'}
              value={fileContent}
              onChange={(val) => setFileContent(val || '')}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
              <iframe
                src={`https://craftly-api.onrender.com/api/projects/${id}/previews/live`}
                title="Container Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          )}
        </div>

        {/* Right Panel: AI Generation Chat Assistant */}
        <aside style={{ width: '360px', background: '#111827', borderLeft: '1px solid #1f2937', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
            <Sparkles size={18} style={{ color: '#3b82f6' }} /> AI Assistant
          </div>

          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'USER' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'USER' ? '#2563eb' : '#1f2937',
                  color: '#fff',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.content}
              </div>
            ))}

            {streaming && (
              <div style={{ color: '#9ca3af', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <RefreshCw size={12} className="spin" /> Generating code...
              </div>
            )}
          </div>

          {/* Prompt Form Input */}
          <form onSubmit={handlePromptSubmit} style={{ padding: '0.75rem', borderTop: '1px solid #1f2937', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI to edit code or generate component..."
              style={{ flex: 1, background: '#1f2937', border: '1px solid #374151', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', color: '#fff', outline: 'none', fontSize: '0.875rem' }}
            />
            <button
              type="submit"
              disabled={streaming || !prompt.trim()}
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              <Send size={16} />
            </button>
          </form>

        </aside>

      </div>
    </div>
  );
};
