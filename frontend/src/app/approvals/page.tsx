'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

type Priority = 'all' | 'urgent' | 'high' | 'medium' | 'low';

interface Approval {
  id: number;
  score: number;
  scoreColor: string;
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  channel: string;
  tag: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

const initialApprovals: Approval[] = [
  { id: 1, score: 92, scoreColor: '#EF4444', title: 'Scale Meta UK by 30%', priority: 'urgent', channel: 'Performance Marketing', tag: 'budget', description: 'Shift targeting to high-LTV lookalike seed. Projected +$12.4K revenue/mo.', status: 'pending' },
  { id: 2, score: 87, scoreColor: '#EF4444', title: "Pause TikTok 'Spring Launch'", priority: 'urgent', channel: 'Performance Marketing', tag: 'kill', description: 'ROAS below 1.5x floor for 3 consecutive days. Recommend kill.', status: 'pending' },
  { id: 3, score: 78, scoreColor: '#F59E0B', title: 'Approve win-back sequence', priority: 'high', channel: 'Retention Engine', tag: 'lifecycle', description: 'Targets 2,400 lapsed buyers (90+ days). 3-touch email+push sequence.', status: 'pending' },
  { id: 4, score: 71, scoreColor: '#3B82F6', title: 'New SEO content briefs (8)', priority: 'medium', channel: 'SEO Command', tag: 'content', description: "Keyword clusters: 'best fitness app', 'workout tracker'. Est. 4,200 monthly volume.", status: 'pending' },
  { id: 5, score: 68, scoreColor: '#3B82F6', title: 'Creative pack: Summer campaign', priority: 'medium', channel: 'Creative Hub', tag: 'creative', description: '12 variants across Meta+TikTok. Scorer avg: 74/100. 2 below threshold.', status: 'pending' },
  { id: 6, score: 55, scoreColor: '#8B5CF6', title: 'GEO schema markup update', priority: 'low', channel: 'GEO Intelligence', tag: 'content', description: 'FAQ schema for 14 pages. Expected AI citation +8% within 30 days.', status: 'pending' },
  { id: 7, score: 63, scoreColor: '#3B82F6', title: 'Budget reallocation: Google → YouTube', priority: 'medium', channel: 'Performance Marketing', tag: 'budget', description: 'Shift $5K/mo from Search to YouTube pre-roll. Projected reach +40K.', status: 'pending' },
];

const priorityBadgeMap: Record<string, React.ReactNode> = {
  urgent: <Badge variant="danger">URGENT</Badge>,
  high: <Badge variant="warn">HIGH</Badge>,
  medium: <Badge variant="info">MEDIUM</Badge>,
  low: <Badge variant="purple">LOW</Badge>,
};

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<Priority>('all');
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);

  const filtered = approvals.filter(a => filter === 'all' || a.priority === filter);
  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const urgentCount = approvals.filter(a => a.priority === 'urgent' && a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  const handleApprove = (id: number) => setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
  const handleReject = (id: number) => setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Pending Actions" value={String(pendingCount)} sub={`${urgentCount} urgent`} trend="neutral" />
        <KPIBlock label="Approved Today" value={String(approvedCount)} sub="decisions made" trend="up" />
        <KPIBlock label="Rejected" value={String(rejectedCount)} sub="this session" trend="down" />
        <KPIBlock label="Avg Score" value="72" sub="+5 vs last week" trend="up" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Pending Actions</CardTitle>
            <Badge variant="danger">{urgentCount} urgent</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['all', 'urgent', 'high', 'medium', 'low'] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium capitalize transition-all ${
                  filter === p
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-brand-border bg-transparent text-brand-text-muted hover:border-brand-border-hover hover:text-white'
                }`}
              >
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`flex flex-col gap-4 rounded-lg border border-brand-border bg-brand-sidebar-hover p-4 transition-opacity sm:flex-row sm:items-center ${item.status !== 'pending' ? 'opacity-40' : ''}`}
            >
              <div className="relative shrink-0" style={{ width: 52, height: 52 }}>
                <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="26" cy="26" r="23" stroke="#2a2a2a" strokeWidth="3" fill="none" />
                  <circle cx="26" cy="26" r="23" stroke={item.scoreColor} strokeWidth="3" fill="none"
                    strokeDasharray="144.51" strokeDashoffset={144.51 * (1 - item.score / 100)} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">{item.score}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{item.title}</span>
                  {item.status === 'pending' ? priorityBadgeMap[item.priority] : (
                    <Badge variant={item.status === 'approved' ? 'success' : 'danger'}>{item.status.toUpperCase()}</Badge>
                  )}
                </div>
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge variant="info">{item.channel}</Badge>
                  <Badge variant="purple">{item.tag}</Badge>
                </div>
                <p className="text-[12px] text-brand-text-muted">{item.description}</p>
              </div>
              {item.status === 'pending' && (
                <div className="flex shrink-0 flex-col gap-2">
                  <Button variant="success" size="sm" onClick={() => handleApprove(item.id)}>✓ Approve</Button>
                  <Button variant="ghost" size="sm" className="border-red-500/20 text-brand-danger hover:bg-red-500/10" onClick={() => handleReject(item.id)}>✗ Reject</Button>
                  <Button variant="ghost" size="sm">Escalate</Button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-brand-text-muted">No {filter} priority actions found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
