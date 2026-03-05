'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type Tab = 'overview' | 'campaigns' | 'budget' | 'attribution';

const chartOpts = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#71717a' }, grid: { display: false } },
    y: { ticks: { color: '#71717a' }, grid: { color: '#2a2a2a' } },
  },
} as const;

const doughnutOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: '#a1a1aa' } } },
} as const;

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
const channels = ['Google', 'Meta', 'TikTok', 'ASA', 'Snap', 'YouTube'];
const spendPct = [45, 28, 12, 8, 4, 3];

interface Campaign { name: string; platform: string; status: 'Active' | 'Paused'; spend: string; roas: string; ncac: string; }
const campaigns: Campaign[] = [
  { name: 'Google Search – Brand', platform: 'Google Ads', status: 'Active', spend: '$8,200', roas: '5.2x', ncac: '$18.40' },
  { name: 'Meta – Lookalike US', platform: 'Meta Ads', status: 'Active', spend: '$12,400', roas: '3.6x', ncac: '$26.80' },
  { name: 'TikTok – Spring Launch', platform: 'TikTok', status: 'Paused', spend: '$4,100', roas: '1.3x', ncac: '$48.20' },
  { name: 'Google PMax – Category', platform: 'Google Ads', status: 'Active', spend: '$15,600', roas: '4.1x', ncac: '$22.10' },
  { name: 'Meta – DPA Retargeting', platform: 'Meta Ads', status: 'Active', spend: '$6,800', roas: '6.8x', ncac: '$12.40' },
  { name: 'ASA – Brand Keywords', platform: 'Apple', status: 'Active', spend: '$3,200', roas: '5.8x', ncac: '$14.60' },
  { name: 'Snapchat – Collection', platform: 'Snapchat', status: 'Active', spend: '$2,100', roas: '1.9x', ncac: '$38.50' },
];

export default function PerformancePage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [budgetVals, setBudgetVals] = useState([45, 28, 12, 8, 4, 3]);
  const budgetTotal = budgetVals.reduce((a, b) => a + b, 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'budget', label: 'Budget Allocation' },
    { id: 'attribution', label: 'Attribution' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Blended ROAS" value="3.8x" sub="+12% MoM" trend="up" />
        <KPIBlock label="nCAC" value="$24.60" sub="-8% MoM" trend="up" />
        <KPIBlock label="Ad Spend" value="$68K" sub="+10% MoM" trend="neutral" />
        <KPIBlock label="Conversions" value="2,847" sub="+18% MoM" trend="up" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-brand-border bg-brand-sidebar-hover p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-[12px] font-medium transition-all ${tab === t.id ? 'bg-blue-500 text-white' : 'text-brand-text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>ROAS by Channel</CardTitle></CardHeader>
            <CardContent>
              <Bar data={{ labels: channels, datasets: [{ label: 'ROAS', data: [4.2, 3.6, 1.3, 5.8, 1.9, 3.2], backgroundColor: COLORS }] }} options={chartOpts} height={220} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Spend Distribution</CardTitle></CardHeader>
            <CardContent>
              <Doughnut data={{ labels: channels, datasets: [{ data: spendPct, backgroundColor: COLORS, borderWidth: 0 }] }} options={doughnutOpts} height={220} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaigns */}
      {tab === 'campaigns' && (
        <Card>
          <CardHeader><CardTitle>Active Campaigns</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Campaign', 'Platform', 'Status', 'Spend', 'ROAS', 'nCAC', 'Action'].map(h => (
                    <th key={h} className="border-b border-brand-border pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => (
                  <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                    <td className="py-3 text-[12px] font-medium text-white">{c.name}</td>
                    <td className="py-3 text-[12px] text-brand-text-muted">{c.platform}</td>
                    <td className="py-3"><Badge variant={c.status === 'Active' ? 'success' : 'danger'}>{c.status}</Badge></td>
                    <td className="py-3 text-[12px] text-brand-text-muted">{c.spend}</td>
                    <td className="py-3 text-[12px] font-semibold text-white">{c.roas}</td>
                    <td className="py-3 text-[12px] text-brand-text-muted">{c.ncac}</td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" className="text-[11px]">
                        {c.status === 'Active' ? 'Pause' : 'Resume'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Budget */}
      {tab === 'budget' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Current Allocation</CardTitle></CardHeader>
            <CardContent>
              <Doughnut data={{ labels: channels, datasets: [{ data: spendPct, backgroundColor: COLORS, borderWidth: 0 }] }} options={doughnutOpts} height={250} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Adjust Allocation</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {channels.map((ch, i) => (
                <div key={ch}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-[12px] text-brand-text-muted">{ch}</span>
                    <span className="text-[12px] text-white">{budgetVals[i]}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={budgetVals[i]}
                    onChange={e => { const v = [...budgetVals]; v[i] = Number(e.target.value); setBudgetVals(v); }}
                    className="w-full" style={{ accentColor: COLORS[i] }} />
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-brand-border pt-4">
                <span className="font-semibold text-white">Total</span>
                <span className={`font-semibold ${budgetTotal === 100 ? 'text-brand-success' : 'text-brand-danger'}`}>{budgetTotal}%</span>
              </div>
              <Button variant="primary" className="w-full justify-center">Submit for Approval</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attribution */}
      {tab === 'attribution' && (
        <Card>
          <CardHeader><CardTitle>Multi-Touch Attribution Model</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['First Touch', 'Last Touch', 'Data-Driven'].map(m => (
                <div key={m} className="cursor-pointer rounded-lg border border-brand-border bg-brand-sidebar-hover p-4 transition-colors hover:border-blue-500">
                  <div className="mb-1 text-[13px] font-semibold text-white">{m}</div>
                  <div className="text-[11px] text-brand-text-muted">
                    {m === 'First Touch' ? 'Assigns 100% credit to first interaction' : m === 'Last Touch' ? 'Assigns 100% credit to last interaction' : 'ML-weighted across all touchpoints'}
                  </div>
                </div>
              ))}
            </div>
            <Bar
              data={{
                labels: ['Google Search', 'Meta Social', 'Direct', 'Email', 'TikTok', 'Referral'],
                datasets: [
                  { label: 'First Touch', data: [35, 25, 10, 15, 10, 5], backgroundColor: '#3B82F680' },
                  { label: 'Last Touch', data: [20, 30, 20, 10, 12, 8], backgroundColor: '#8B5CF680' },
                  { label: 'Data-Driven', data: [28, 27, 14, 13, 11, 7], backgroundColor: '#10B98180' },
                ],
              }}
              options={{ ...chartOpts, plugins: { legend: { labels: { color: '#a1a1aa' } } } } as const}
              height={180} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
