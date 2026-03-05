'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

type Tab = 'keywords' | 'content' | 'technical';

const keywords = [
  { keyword: 'best fitness app', volume: 18200, pos: 4, change: 2, intent: 'Commercial', opportunity: 'High' },
  { keyword: 'workout tracker app', volume: 12400, pos: 7, change: -1, intent: 'Transactional', opportunity: 'High' },
  { keyword: 'home workout routine', volume: 48000, pos: 14, change: 3, intent: 'Informational', opportunity: 'Medium' },
  { keyword: 'gym app subscription', volume: 6200, pos: 2, change: 0, intent: 'Commercial', opportunity: 'Low' },
  { keyword: 'fitness tracking wearable', volume: 9100, pos: 22, change: 5, intent: 'Informational', opportunity: 'High' },
  { keyword: 'calorie counter free', volume: 74000, pos: 31, change: 8, intent: 'Informational', opportunity: 'Medium' },
];

const contentBriefs = [
  { title: '10 Best Fitness Apps in 2025', cluster: 'best fitness app', status: 'In Review', est: '4,200/mo', score: 87 },
  { title: 'How to Track Your Workouts Like a Pro', cluster: 'workout tracker', status: 'Assigned', est: '6,800/mo', score: 74 },
  { title: 'Home Workout Routine Without Equipment', cluster: 'home workout', status: 'Draft', est: '9,200/mo', score: 61 },
];

const technicalIssues = [
  { issue: 'Core Web Vitals: LCP > 4s on /pricing', severity: 'Critical' as const, pages: 1 },
  { issue: 'Missing meta description', severity: 'High' as const, pages: 12 },
  { issue: 'Broken internal links to /old-blog', severity: 'Medium' as const, pages: 6 },
  { issue: 'Duplicate H1 tags', severity: 'Medium' as const, pages: 4 },
  { issue: 'Images missing alt text', severity: 'Low' as const, pages: 28 },
];

export default function SEOPage() {
  const [tab, setTab] = useState<Tab>('keywords');
  const tabs = [{ id: 'keywords' as Tab, label: 'Keyword Tracker' }, { id: 'content' as Tab, label: 'Content Briefs' }, { id: 'technical' as Tab, label: 'Technical Audit' }];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Organic Sessions" value="48.2K" sub="+18% MoM" trend="up" />
        <KPIBlock label="Keywords in Top 10" value="84" sub="+12 MoM" trend="up" />
        <KPIBlock label="Domain Authority" value="52" sub="+2 this month" trend="up" />
        <KPIBlock label="Backlinks" value="1,840" sub="+120 MoM" trend="up" />
      </div>

      <div className="flex gap-1 rounded-lg border border-brand-border bg-brand-sidebar-hover p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-md px-4 py-2 text-[12px] font-medium transition-all ${tab === t.id ? 'bg-blue-500 text-white' : 'text-brand-text-muted hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'keywords' && (
        <Card>
          <CardHeader><CardTitle>Keyword Rankings</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>{['Keyword', 'Volume', 'Position', 'Change', 'Intent', 'Opportunity'].map(h => (
                  <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {keywords.map((kw, i) => (
                  <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                    <td className="py-3 font-medium text-white text-[12px]">{kw.keyword}</td>
                    <td className="py-3 text-[12px] text-brand-text-muted">{kw.volume.toLocaleString()}</td>
                    <td className="py-3 text-[12px] font-bold text-white">#{kw.pos}</td>
                    <td className="py-3 text-[12px]"><span className={kw.change > 0 ? 'text-brand-success' : kw.change < 0 ? 'text-brand-danger' : 'text-brand-text-muted'}>{kw.change > 0 ? `▲${kw.change}` : kw.change < 0 ? `▼${Math.abs(kw.change)}` : '—'}</span></td>
                    <td className="py-3"><Badge variant="purple">{kw.intent}</Badge></td>
                    <td className="py-3"><Badge variant={kw.opportunity === 'High' ? 'success' : kw.opportunity === 'Medium' ? 'warn' : 'info'}>{kw.opportunity}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === 'content' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Content Briefs</CardTitle>
              <Button variant="primary" size="sm">+ New Brief</Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {contentBriefs.map((brief, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-lg border border-brand-border bg-brand-sidebar-hover p-4 sm:flex-row sm:items-center">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white text-[13px]">{brief.title}</span>
                    <Badge variant={brief.status === 'In Review' ? 'warn' : brief.status === 'Assigned' ? 'info' : 'purple'}>{brief.status}</Badge>
                  </div>
                  <div className="text-[11px] text-brand-text-muted">Cluster: {brief.cluster} · Est. traffic: {brief.est}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[12px] text-brand-text-muted">Score: <span className="font-bold text-white">{brief.score}</span></div>
                  <Button variant="ghost" size="sm" className="text-[11px]">View Brief</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'technical' && (
        <Card>
          <CardHeader><CardTitle>Technical SEO Issues</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {technicalIssues.map((issue, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-brand-border bg-brand-sidebar-hover p-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 font-medium text-white text-[13px]">{issue.issue}</div>
                  <div className="text-[11px] text-brand-text-muted">Affects {issue.pages} page{issue.pages !== 1 ? 's' : ''}</div>
                </div>
                <Badge variant={issue.severity === 'Critical' ? 'danger' : issue.severity === 'High' ? 'warn' : issue.severity === 'Medium' ? 'info' : 'purple'}>{issue.severity}</Badge>
                <Button variant="ghost" size="sm" className="shrink-0 text-[11px]">Fix</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
