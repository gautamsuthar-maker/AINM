'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Tab = 'library' | 'scorer' | 'generate';
type AssetType = 'all' | 'image' | 'video' | 'text';

interface Asset {
  id: number; score: number; scoreColor: string; title: string; platform: string;
  type: 'image' | 'video' | 'text'; status: 'Active' | 'Review' | 'Draft';
  impressions: string; ctr: string;
}

const assets: Asset[] = [
  { id: 1, score: 82, scoreColor: '#10B981', title: 'Summer Hero – Meta', platform: 'Meta Ads', type: 'image', status: 'Active', impressions: '12,400 impr', ctr: '3.2% CTR' },
  { id: 2, score: 76, scoreColor: '#3B82F6', title: 'App Install – TikTok', platform: 'TikTok', type: 'video', status: 'Active', impressions: '8,200 views', ctr: '2.8% CTR' },
  { id: 3, score: 71, scoreColor: '#F59E0B', title: 'Brand Story – YouTube', platform: 'YouTube', type: 'video', status: 'Review', impressions: '—', ctr: '—' },
  { id: 4, score: 68, scoreColor: '#F59E0B', title: 'DPA Template – Holiday', platform: 'Meta Ads', type: 'image', status: 'Draft', impressions: '—', ctr: '—' },
  { id: 5, score: 88, scoreColor: '#10B981', title: 'Search Ad Copy – v3', platform: 'Google Ads', type: 'text', status: 'Active', impressions: '45,600 impr', ctr: '4.1% CTR' },
  { id: 6, score: 74, scoreColor: '#3B82F6', title: 'Win-back Email', platform: 'Email', type: 'text', status: 'Active', impressions: '2,100 sent', ctr: '22% open' },
];

const scoringSignals = [
  { label: 'CTR Score', desc: 'Predicted CTR vs category benchmark', pct: 30, width: 99, color: '#3B82F6' },
  { label: 'CVR Score', desc: 'Post-click conversion rate vs norms', pct: 25, width: 82.5, color: '#10B981' },
  { label: 'Competitive Differentiation', desc: 'Distinctiveness from competitor ads', pct: 15, width: 49.5, color: '#8B5CF6' },
  { label: 'Thumb-Stop Rate', desc: '3-second view rate for video', pct: 15, width: 49.5, color: '#EC4899' },
  { label: 'Sentiment Score', desc: 'NLP analysis of reactions', pct: 10, width: 33, color: '#06B6D4' },
  { label: 'Clutter-Free Score', desc: 'Visual density and clarity', pct: 5, width: 16.5, color: '#F59E0B' },
];

export default function CreativePage() {
  const [tab, setTab] = useState<Tab>('library');
  const [typeFilter, setTypeFilter] = useState<AssetType>('all');

  const filtered = assets.filter(a => typeFilter === 'all' || a.type === typeFilter);

  const tabs = [
    { id: 'library' as Tab, label: 'Asset Library' },
    { id: 'scorer' as Tab, label: 'Creative Scorer' },
    { id: 'generate' as Tab, label: 'Generate' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Total Assets" value="45" sub="+6 this month" trend="up" />
        <KPIBlock label="Avg Score" value="76" sub="+4 vs last month" trend="up" />
        <KPIBlock label="Below Threshold" value="8" sub="score &lt; 60" trend="down" />
        <KPIBlock label="Generated AI" value="12" sub="this quarter" trend="up" />
      </div>

      <div className="flex gap-1 rounded-lg border border-brand-border bg-brand-sidebar-hover p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-[12px] font-medium transition-all ${tab === t.id ? 'bg-blue-500 text-white' : 'text-brand-text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'library' && (
        <>
          <div className="flex flex-wrap gap-2">
            {(['all', 'image', 'video', 'text'] as AssetType[]).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium capitalize transition-all ${typeFilter === f ? 'border-blue-500 bg-blue-500 text-white' : 'border-brand-border text-brand-text-muted hover:text-white'}`}>
                {f === 'all' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(asset => (
              <Card key={asset.id}>
                <CardContent className="pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="relative" style={{ width: 44, height: 44 }}>
                      <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="22" cy="22" r="19" stroke="#2a2a2a" strokeWidth="3" fill="none" />
                        <circle cx="22" cy="22" r="19" stroke={asset.scoreColor} strokeWidth="3" fill="none"
                          strokeDasharray="119.38" strokeDashoffset={119.38 * (1 - asset.score / 100)} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{asset.score}</span>
                    </div>
                    <Badge variant={asset.status === 'Active' ? 'success' : asset.status === 'Review' ? 'warn' : 'info'}>{asset.status}</Badge>
                  </div>
                  <div className="mb-1 text-[13px] font-semibold text-white">{asset.title}</div>
                  <div className="mb-2 flex gap-2">
                    <Badge variant="info">{asset.platform}</Badge>
                    <Badge variant="purple">{asset.type}</Badge>
                  </div>
                  <div className="mb-3 flex justify-between text-[11px] text-brand-text-muted">
                    <span>{asset.impressions}</span>
                    <span>{asset.ctr}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 justify-center text-[11px]">Preview</Button>
                    <Button variant="primary" size="sm" className="flex-1 justify-center text-[11px]">Re-score</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === 'scorer' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Scoring Signals &amp; Weights</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {scoringSignals.map(s => (
                <div key={s.label} className="flex items-center gap-4">
                  <div className="w-12 text-center text-[16px] font-bold" style={{ color: s.color }}>{s.pct}%</div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-white">{s.label}</div>
                    <div className="text-[11px] text-brand-text-muted">{s.desc}</div>
                  </div>
                  <div className="w-40">
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-border">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.width}%`, background: s.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Score Distribution</CardTitle></CardHeader>
            <CardContent>
              <Bar data={{ labels: ['0-20', '21-40', '41-60', '61-80', '81-100'], datasets: [{ label: 'Assets', data: [2, 5, 12, 18, 8], backgroundColor: '#3B82F680' }] }}
                options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#71717a' }, grid: { display: false } }, y: { ticks: { color: '#71717a' }, grid: { color: '#2a2a2a' } } } }} height={180} />
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'generate' && (
        <Card>
          <CardHeader><CardTitle>Generate New Creative</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] text-brand-text-muted">Channel</label>
                <select className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500">
                  {['Meta Ads', 'TikTok', 'Google Ads', 'YouTube', 'Email'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-brand-text-muted">Format</label>
                <select className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500">
                  {['Static Image', 'Short-form Video', 'Ad Copy', 'Email'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-brand-text-muted">Persona</label>
                <select className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500">
                  {['Fitness Enthusiast (25-34)', 'Budget Shopper (18-24)', 'Health Pro (35-50)'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-brand-text-muted">Language</label>
                <select className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500">
                  {['English (US)', 'English (UK)', 'Spanish', 'German'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] text-brand-text-muted">Creative Brief / Instructions</label>
                <textarea rows={3} placeholder="Describe the creative direction, key messages, offers..."
                  className="w-full rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500" />
              </div>
            </div>
            <Button variant="primary" className="mt-4">🎨 Generate Creative</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
