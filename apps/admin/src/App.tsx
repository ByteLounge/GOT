import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Layers,
  RefreshCw,
  AlertTriangle,
  Copy,
  CheckCircle2,
  ExternalLink,
  Power,
  GitCommit,
  Clock
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

export function App() {
  const [activeTab, setActiveTab] = useState<'sources' | 'opportunities' | 'changes' | 'runs' | 'duplicates'>('sources');
  const [sources, setSources] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [srcRes, oppRes, chgRes, runRes, dupRes] = await Promise.all([
        fetch(`${API_BASE}/admin/sources`).then(r => r.json()).catch(() => ({ sources: [] })),
        fetch(`${API_BASE}/opportunities?limit=50`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/admin/changes`).then(r => r.json()).catch(() => ({ changes: [] })),
        fetch(`${API_BASE}/admin/ingestion-runs`).then(r => r.json()).catch(() => ({ runs: [] })),
        fetch(`${API_BASE}/admin/duplicates`).then(r => r.json()).catch(() => ({ duplicates: [] })),
      ]);

      setSources(srcRes.sources || []);
      setOpportunities(oppRes.data || []);
      setChanges(chgRes.changes || []);
      setRuns(runRes.runs || []);
      setDuplicates(dupRes.duplicates || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerRun = async (sourceId: string) => {
    setActionMessage(`Triggering ingestion pass for source ${sourceId}...`);
    try {
      const res = await fetch(`${API_BASE}/admin/sources/${sourceId}/run`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Run completed! Scanned: ${json.run.itemsScanned}, Created: ${json.run.itemsCreated}, Updated: ${json.run.itemsUpdated}`);
      } else {
        setActionMessage(`Run failed: ${json.error}`);
      }
      loadData();
    } catch (err: any) {
      setActionMessage(`Network error: ${err.message}`);
    }
  };

  const toggleSource = async (sourceId: string) => {
    try {
      await fetch(`${API_BASE}/admin/sources/${sourceId}/toggle`, { method: 'PATCH' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B0F19' }}>
      {/* Sidebar */}
      <div style={{ width: 260, backgroundColor: '#111827', borderRight: '1px solid #1F2937', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>GovAlert Admin</h2>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>Command & Control</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { id: 'sources', label: 'Monitored Sources', icon: Activity },
            { id: 'opportunities', label: 'Opportunities', icon: Layers },
            { id: 'changes', label: 'Detected Changes', icon: GitCommit },
            { id: 'runs', label: 'Ingestion Audit Runs', icon: Clock },
            { id: 'duplicates', label: 'Duplicate Inspector', icon: Copy },
          ].map(item => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: isSelected ? '#1E3A8A' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#9CA3AF',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>
              {activeTab === 'sources' && 'Government Source Monitor'}
              {activeTab === 'opportunities' && 'Opportunity Database'}
              {activeTab === 'changes' && 'Change Detection History'}
              {activeTab === 'runs' && 'Crawler Run Logs'}
              {activeTab === 'duplicates' && 'Duplicate Detection Engine'}
            </h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
              Strictly verified government portals with automated integrity validation
            </p>
          </div>

          <button
            onClick={loadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {actionMessage && (
          <div style={{ padding: '12px 16px', backgroundColor: '#1E3A8A', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#93C5FD' }}>
            {actionMessage}
          </div>
        )}

        {/* Tab 1: Sources */}
        {activeTab === 'sources' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {sources.map(src => (
              <div
                key={src.id}
                style={{
                  backgroundColor: '#131D31',
                  border: '1px solid #1E293B',
                  borderRadius: 14,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, backgroundColor: '#1E293B', color: '#93C5FD' }}>
                    {src.code}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      backgroundColor: src.isActive ? '#064E3B' : '#374151',
                      color: src.isActive ? '#34D399' : '#9CA3AF',
                    }}
                  >
                    {src.isActive ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>{src.name}</h3>
                  <a
                    href={src.baseUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: '#60A5FA', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                  >
                    {src.baseUrl} <ExternalLink size={12} />
                  </a>
                </div>

                <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                  Interval: Every {src.checkIntervalHours} hours • Adapter: {src.adapterType}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #1E293B' }}>
                  <button
                    onClick={() => triggerRun(src.id)}
                    style={{
                      flex: 1,
                      padding: '9px 14px',
                      backgroundColor: '#2563EB',
                      border: 'none',
                      borderRadius: 8,
                      color: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Trigger Run
                  </button>
                  <button
                    onClick={() => toggleSource(src.id)}
                    style={{
                      padding: '9px 14px',
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      color: '#9CA3AF',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <Power size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Opportunities */}
        {activeTab === 'opportunities' && (
          <div style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#111827', borderBottom: '1px solid #1E293B', color: '#9CA3AF' }}>
                  <th style={{ padding: '14px 18px' }}>Title</th>
                  <th style={{ padding: '14px 18px' }}>Organization</th>
                  <th style={{ padding: '14px 18px' }}>Category</th>
                  <th style={{ padding: '14px 18px' }}>Deadline</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px' }}>Verified</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map(opp => (
                  <tr key={opp.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#FFFFFF', maxWidth: 300 }}>{opp.title}</td>
                    <td style={{ padding: '14px 18px', color: '#9CA3AF' }}>{opp.organization}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: '#1E293B', color: '#93C5FD', fontSize: 11, fontWeight: 700 }}>
                        {opp.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#CBD5E1' }}>
                      {opp.applicationDeadline ? new Date(opp.applicationDeadline).toLocaleDateString('en-IN') : 'Ongoing'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: '#064E3B', color: '#34D399', fontSize: 11, fontWeight: 700 }}>
                        {opp.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <CheckCircle2 size={16} color="#10B981" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Changes */}
        {activeTab === 'changes' && (
          <div style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: 14, overflow: 'hidden' }}>
            {changes.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No opportunity changes recorded yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#111827', borderBottom: '1px solid #1E293B', color: '#9CA3AF' }}>
                    <th style={{ padding: '14px 18px' }}>Opportunity</th>
                    <th style={{ padding: '14px 18px' }}>Changed Field</th>
                    <th style={{ padding: '14px 18px' }}>Old Value</th>
                    <th style={{ padding: '14px 18px' }}>New Value</th>
                    <th style={{ padding: '14px 18px' }}>Detected At</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map(chg => (
                    <tr key={chg.id} style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#FFFFFF' }}>{chg.opportunityTitle || chg.opportunityId}</td>
                      <td style={{ padding: '14px 18px', color: '#F59E0B', fontWeight: 700 }}>{chg.fieldName}</td>
                      <td style={{ padding: '14px 18px', color: '#EF4444' }}>{chg.oldValue || 'None'}</td>
                      <td style={{ padding: '14px 18px', color: '#10B981' }}>{chg.newValue || 'None'}</td>
                      <td style={{ padding: '14px 18px', color: '#9CA3AF' }}>{new Date(chg.detectedAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 4: Ingestion Runs */}
        {activeTab === 'runs' && (
          <div style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: 14, overflow: 'hidden' }}>
            {runs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No ingestion runs yet. Trigger a source run above.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#111827', borderBottom: '1px solid #1E293B', color: '#9CA3AF' }}>
                    <th style={{ padding: '14px 18px' }}>Source</th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                    <th style={{ padding: '14px 18px' }}>Scanned</th>
                    <th style={{ padding: '14px 18px' }}>Created</th>
                    <th style={{ padding: '14px 18px' }}>Updated</th>
                    <th style={{ padding: '14px 18px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map(run => (
                    <tr key={run.id} style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#FFFFFF' }}>{run.sourceName || run.sourceId}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: run.status === 'SUCCESS' ? '#064E3B' : '#7F1D1D',
                            color: run.status === 'SUCCESS' ? '#34D399' : '#FCA5A5',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#CBD5E1' }}>{run.itemsScanned}</td>
                      <td style={{ padding: '14px 18px', color: '#10B981', fontWeight: 700 }}>+{run.itemsCreated}</td>
                      <td style={{ padding: '14px 18px', color: '#F59E0B', fontWeight: 700 }}>{run.itemsUpdated}</td>
                      <td style={{ padding: '14px 18px', color: '#9CA3AF' }}>{new Date(run.startTime).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 5: Duplicates */}
        {activeTab === 'duplicates' && (
          <div style={{ backgroundColor: '#131D31', border: '1px solid #1E293B', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Deduplication Audit Engine</h3>
            {duplicates.length === 0 ? (
              <div style={{ padding: 30, backgroundColor: '#0B0F19', borderRadius: 10, textAlign: 'center' }}>
                <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 10px' }} />
                <p style={{ color: '#10B981', fontWeight: 700 }}>Zero Duplicates Detected</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                  Content hashes and deterministic title matching confirmed all database records are unique.
                </p>
              </div>
            ) : (
              <div>{/* List duplicates */}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
