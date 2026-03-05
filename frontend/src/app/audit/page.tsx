import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KPIBlock } from '@/components/ui/kpi-block';

const events = [
  { time: '2025-03-05 14:32', actor: 'AI Agent', action: 'Paused TikTok Spring Launch campaign', module: 'Performance', severity: 'High' },
  { time: '2025-03-05 11:08', actor: 'Krish M.', action: 'Approved win-back email sequence', module: 'Approvals', severity: 'Medium' },
  { time: '2025-03-05 09:44', actor: 'AI Agent', action: 'Submitted budget reallocation: Google → YouTube', module: 'Simulator', severity: 'High' },
  { time: '2025-03-04 17:21', actor: 'Priya S.', action: 'Exported Q1 Creative Scorecard report', module: 'Reports', severity: 'Low' },
  { time: '2025-03-04 15:55', actor: 'AI Agent', action: 'Generated 6 new SEO content briefs', module: 'SEO', severity: 'Medium' },
  { time: '2025-03-04 12:30', actor: 'Rahul A.', action: 'Updated attribution model to Data-Driven', module: 'Performance', severity: 'High' },
  { time: '2025-03-04 10:14', actor: 'AI Agent', action: 'Flagged Peloton ad spend surge as urgent threat', module: 'Intel', severity: 'Medium' },
  { time: '2025-03-03 16:40', actor: 'Krish M.', action: 'Rejected GEO schema markup update', module: 'Approvals', severity: 'Low' },
  { time: '2025-03-03 09:20', actor: 'System', action: 'Weekly performance report auto-generated', module: 'Reports', severity: 'Low' },
  { time: '2025-03-02 18:05', actor: 'AI Agent', action: 'Re-scored 8 creative assets after guideline update', module: 'Creative', severity: 'Medium' },
];

const moduleColors: Record<string, string> = {
  Performance: '#3B82F6', Approvals: '#10B981', Simulator: '#F59E0B',
  Reports: '#8B5CF6', SEO: '#06B6D4', Intel: '#EC4899', Creative: '#F97316', System: '#71717a',
};

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Total Events" value="1,284" sub="last 30 days" trend="neutral" />
        <KPIBlock label="AI Actions" value="847" sub="66% of total" trend="up" />
        <KPIBlock label="Human Approvals" value="312" sub="24% of total" trend="neutral" />
        <KPIBlock label="High Severity" value="42" sub="require review" trend="down" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Trail</CardTitle>
            <span className="text-[11px] text-brand-text-muted">Showing last 10 events</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-brand-border" />

            <div className="flex flex-col gap-0">
              {events.map((ev, i) => (
                <div key={i} className="relative flex gap-4 pb-4 last:pb-0">
                  {/* Dot */}
                  <div className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-brand-border bg-brand-bg"
                    style={{ borderColor: moduleColors[ev.module] ?? '#71717a' }} />

                  <div className="flex-1 min-w-0 rounded-lg border border-brand-border bg-brand-sidebar-hover p-3">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-brand-text-dim">{ev.time}</span>
                      <span className="text-[12px] font-semibold text-white">{ev.actor}</span>
                      <Badge variant={ev.severity === 'High' ? 'warn' : ev.severity === 'Medium' ? 'info' : 'purple'}>{ev.severity}</Badge>
                    </div>
                    <div className="mb-1 text-[12px] text-brand-text-muted">{ev.action}</div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ background: moduleColors[ev.module] ?? '#71717a' }} />
                      <span className="text-[10px] text-brand-text-dim">{ev.module}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
