import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

const sequences = [
  { name: 'Welcome Series', status: 'Active', steps: 5, enrolled: 1240, openRate: '48%', convRate: '12%', revenue: '$8,400' },
  { name: 'Win-back: 90-day lapsed', status: 'Active', steps: 3, enrolled: 2400, openRate: '22%', convRate: '7%', revenue: '$5,100' },
  { name: 'Post-Purchase Upsell', status: 'Active', steps: 4, enrolled: 890, openRate: '62%', convRate: '18%', revenue: '$14,200' },
  { name: 'Cart Abandonment', status: 'Active', steps: 3, enrolled: 3100, openRate: '54%', convRate: '24%', revenue: '$22,800' },
  { name: 'Re-engagement: 180d', status: 'Paused', steps: 4, enrolled: 0, openRate: '—', convRate: '—', revenue: '$0' },
  { name: 'VIP Loyalty Rewards', status: 'Draft', steps: 6, enrolled: 0, openRate: '—', convRate: '—', revenue: '$0' },
];

const upcomingTasks = [
  { task: 'Review win-back sequence performance', due: 'Today', priority: 'high' as const },
  { task: 'Approve Welcome Series v4 copy', due: 'Tomorrow', priority: 'medium' as const },
  { task: 'A/B test subject lines for re-engagement', due: 'This week', priority: 'low' as const },
  { task: 'Segment refresh: high-LTV cohort', due: 'This week', priority: 'medium' as const },
];

export default function NurturePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Active Sequences" value="4" sub="2 paused/draft" trend="neutral" />
        <KPIBlock label="Enrolled Contacts" value="7,630" sub="+340 this week" trend="up" />
        <KPIBlock label="Avg Open Rate" value="46.5%" sub="+3pp MoM" trend="up" />
        <KPIBlock label="Sequence Revenue" value="$50.5K" sub="this month" trend="up" />
      </div>

      {/* Sequences Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email &amp; Push Sequences</CardTitle>
            <Button variant="primary" size="sm">+ New Sequence</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Sequence', 'Status', 'Steps', 'Enrolled', 'Open Rate', 'Conv. Rate', 'Revenue', ''].map(h => (
                  <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sequences.map((seq, i) => (
                <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                  <td className="py-3 font-medium text-white text-[13px]">{seq.name}</td>
                  <td className="py-3"><Badge variant={seq.status === 'Active' ? 'success' : seq.status === 'Paused' ? 'warn' : 'info'}>{seq.status}</Badge></td>
                  <td className="py-3 text-[12px] text-brand-text-muted">{seq.steps}</td>
                  <td className="py-3 text-[12px] text-white">{seq.enrolled.toLocaleString()}</td>
                  <td className="py-3 text-[12px] text-brand-text-muted">{seq.openRate}</td>
                  <td className="py-3 text-[12px] text-brand-text-muted">{seq.convRate}</td>
                  <td className="py-3 text-[12px] text-brand-success font-medium">{seq.revenue}</td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm" className="text-[11px]">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader><CardTitle>Upcoming Tasks</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {upcomingTasks.map((t, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-brand-border bg-brand-sidebar-hover p-3">
              <div className="flex-1">
                <div className="text-[13px] font-medium text-white">{t.task}</div>
                <div className="text-[11px] text-brand-text-muted">Due: {t.due}</div>
              </div>
              <Badge variant={t.priority === 'high' ? 'warn' : t.priority === 'medium' ? 'info' : 'purple'}>{t.priority.toUpperCase()}</Badge>
              <Button variant="ghost" size="sm" className="text-[11px]">Done</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
