'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Tab = 'general' | 'team' | 'ai' | 'integrations' | 'billing';

const teamMembers = [
  { name: 'Krish Mehta', email: 'krish@acmecorp.com', role: 'Admin', status: 'Active', lastSeen: 'Now' },
  { name: 'Priya Sharma', email: 'priya@acmecorp.com', role: 'Editor', status: 'Active', lastSeen: '1h ago' },
  { name: 'Rahul Agarwal', email: 'rahul@acmecorp.com', role: 'Viewer', status: 'Active', lastSeen: '3h ago' },
  { name: 'Meera Joshi', email: 'meera@acmecorp.com', role: 'Editor', status: 'Invited', lastSeen: '—' },
];

const integrations = [
  { name: 'Google Ads', status: 'Connected', icon: '🔵', lastSync: '5m ago' },
  { name: 'Meta Ads', status: 'Connected', icon: '🟣', lastSync: '5m ago' },
  { name: 'TikTok Ads', status: 'Connected', icon: '⚫', lastSync: '12m ago' },
  { name: 'Google Analytics 4', status: 'Connected', icon: '🟠', lastSync: '1h ago' },
  { name: 'Klaviyo', status: 'Disconnected', icon: '🟢', lastSync: 'Never' },
  { name: 'Shopify', status: 'Connected', icon: '🟤', lastSync: '30m ago' },
  { name: 'Apple Search Ads', status: 'Connected', icon: '⬛', lastSync: '2h ago' },
  { name: 'Snapchat Ads', status: 'Disconnected', icon: '🟡', lastSync: 'Never' },
];

const tabs: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'team', label: 'Team' },
  { id: 'ai', label: 'AI Config' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'billing', label: 'Billing' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('general');
  const [roas, setRoas] = useState(2.0);
  const [ncac, setNcac] = useState(35);
  const [autoApprove, setAutoApprove] = useState(false);
  const [budgetGuard, setBudgetGuard] = useState(true);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex gap-1 rounded-lg border border-brand-border bg-brand-sidebar-hover p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-[12px] font-medium transition-all ${tab === t.id ? 'bg-blue-500 text-white' : 'text-brand-text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === 'general' && (
        <Card>
          <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-6">
            {[
              { label: 'Company Name', placeholder: 'Acme Corp', defaultVal: 'Acme Corp' },
              { label: 'Industry', placeholder: 'Fitness & Wellness', defaultVal: 'Fitness & Wellness' },
              { label: 'Primary Currency', placeholder: 'USD', defaultVal: 'USD' },
              { label: 'Timezone', placeholder: 'UTC-5 (Eastern)', defaultVal: 'UTC-5 (Eastern)' },
            ].map(f => (
              <div key={f.label}>
                <label className="mb-1.5 block text-[11px] font-medium text-brand-text-muted">{f.label}</label>
                <input type="text" defaultValue={f.defaultVal}
                  className="w-full max-w-md rounded-md border border-brand-border bg-brand-sidebar-hover px-3 py-2 text-[13px] text-white outline-none focus:border-blue-500" />
              </div>
            ))}
            <Button variant="primary" className="w-fit">Save Changes</Button>
          </CardContent>
        </Card>
      )}

      {/* Team */}
      {tab === 'team' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button variant="primary" size="sm">+ Invite Member</Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>{['Name', 'Email', 'Role', 'Status', 'Last Seen', ''].map(h => (
                  <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {teamMembers.map((m, i) => (
                  <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                    <td className="py-3 font-medium text-white text-[13px]">{m.name}</td>
                    <td className="py-3 text-[12px] text-brand-text-muted">{m.email}</td>
                    <td className="py-3"><Badge variant={m.role === 'Admin' ? 'danger' : m.role === 'Editor' ? 'info' : 'purple'}>{m.role}</Badge></td>
                    <td className="py-3"><Badge variant={m.status === 'Active' ? 'success' : 'warn'}>{m.status}</Badge></td>
                    <td className="py-3 text-[12px] text-brand-text-muted">{m.lastSeen}</td>
                    <td className="py-3"><Button variant="ghost" size="sm" className="text-[11px]">Edit</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* AI Config */}
      {tab === 'ai' && (
        <Card>
          <CardHeader><CardTitle>AI Agent Configuration</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-[12px] text-brand-text-muted">ROAS Floor Threshold</span>
                <span className="text-[12px] font-bold text-white">{roas.toFixed(1)}x</span>
              </div>
              <input type="range" min={0.5} max={10} step={0.1} value={roas} onChange={e => setRoas(Number(e.target.value))} className="w-full max-w-md" style={{ accentColor: '#3B82F6' }} />
              <p className="mt-1 text-[11px] text-brand-text-dim">AI will flag campaigns below this ROAS for review</p>
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-[12px] text-brand-text-muted">nCAC Ceiling (USD)</span>
                <span className="text-[12px] font-bold text-white">${ncac}</span>
              </div>
              <input type="range" min={5} max={200} step={1} value={ncac} onChange={e => setNcac(Number(e.target.value))} className="w-full max-w-md" style={{ accentColor: '#8B5CF6' }} />
              <p className="mt-1 text-[11px] text-brand-text-dim">AI will pause campaigns exceeding this nCAC ceiling</p>
            </div>

            <div className="flex flex-col gap-4 border-t border-brand-border pt-4">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <div className="text-[13px] font-medium text-white">Auto-Approve Low-Risk Actions</div>
                  <div className="text-[11px] text-brand-text-muted">Bypass approval queue for score &gt; 50, low impact</div>
                </div>
                <button onClick={() => setAutoApprove(!autoApprove)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoApprove ? 'bg-blue-500' : 'bg-brand-border'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoApprove ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <div className="text-[13px] font-medium text-white">Budget Guard Rails</div>
                  <div className="text-[11px] text-brand-text-muted">Block AI actions that exceed ±20% of monthly budget</div>
                </div>
                <button onClick={() => setBudgetGuard(!budgetGuard)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${budgetGuard ? 'bg-blue-500' : 'bg-brand-border'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${budgetGuard ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <Button variant="primary" className="w-fit">Save AI Config</Button>
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      {tab === 'integrations' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {integrations.map(intg => (
            <Card key={intg.name}>
              <CardContent className="flex items-center gap-4 pt-4">
                <div className="text-2xl shrink-0">{intg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white">{intg.name}</div>
                  <div className="text-[11px] text-brand-text-muted">Last sync: {intg.lastSync}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={intg.status === 'Connected' ? 'success' : 'danger'}>{intg.status}</Badge>
                  <Button variant="ghost" size="sm" className="text-[11px]">{intg.status === 'Connected' ? 'Manage' : 'Connect'}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Billing */}
      {tab === 'billing' && (
        <Card>
          <CardHeader><CardTitle>Billing &amp; Plan</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div>
                <div className="text-[14px] font-bold text-white">Growth Plan</div>
                <div className="text-[12px] text-brand-text-muted">$499/month · Renews April 1, 2025</div>
              </div>
              <Button variant="ghost" size="sm">Upgrade</Button>
            </div>
            {[
              ['AI Agent Actions', '12,400', '20,000 / month'],
              ['Team Seats', '4', '10 seats'],
              ['Reports Generated', '42', 'Unlimited'],
              ['Integrations', '6', 'Unlimited'],
            ].map(([label, used, limit]) => (
              <div key={label} className="flex items-center justify-between border-b border-brand-border pb-3 last:border-0 last:pb-0">
                <div className="text-[13px] text-brand-text-muted">{label}</div>
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-white">{used}</div>
                  <div className="text-[11px] text-brand-text-dim">{limit}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
