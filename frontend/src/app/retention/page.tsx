import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

const segments = [
  { name: 'VIP Loyalists', size: 1840, churnRisk: 'Low', ltv: '$420', lastActive: '2d ago', status: 'Healthy' },
  { name: 'At-Risk 30d+', size: 3200, churnRisk: 'High', ltv: '$180', lastActive: '35d ago', status: 'At Risk' },
  { name: 'Lapsed 90d', size: 4100, churnRisk: 'Critical', ltv: '$240', lastActive: '92d ago', status: 'Lapsed' },
  { name: 'New (0-30d)', size: 920, churnRisk: 'Low', ltv: '$45', lastActive: '8d ago', status: 'New' },
  { name: 'Re-activated', size: 640, churnRisk: 'Medium', ltv: '$185', lastActive: '14d ago', status: 'Improving' },
];

const playbooks = [
  { name: 'Trigger Re-Engagement Email', segment: 'Lapsed 90d', impact: 'High', status: 'Ready' },
  { name: 'Send VIP Loyalty Reward', segment: 'VIP Loyalists', impact: 'Medium', status: 'Running' },
  { name: 'Launch Win-Back Offer — 25% Off', segment: 'At-Risk 30d+', impact: 'High', status: 'Pending Approval' },
  { name: 'Personalized Restock Alert', segment: 'Lapsed 90d', impact: 'Medium', status: 'Ready' },
];

export default function RetentionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="30d Retention" value="68%" sub="+3pp MoM" trend="up" />
        <KPIBlock label="90d Retention" value="42%" sub="+5pp MoM" trend="up" />
        <KPIBlock label="Avg LTV" value="$218" sub="+$18 MoM" trend="up" />
        <KPIBlock label="Churn Rate" value="3.2%" sub="-0.4pp MoM" trend="up" />
      </div>

      {/* Segment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Retention Segments</CardTitle>
            <Button variant="ghost" size="sm">Refresh Segments</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Segment', 'Size', 'Churn Risk', 'Avg LTV', 'Last Active', 'Status'].map(h => (
                  <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, i) => (
                <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                  <td className="py-3 font-medium text-white text-[13px]">{seg.name}</td>
                  <td className="py-3 text-[12px] text-brand-text-muted">{seg.size.toLocaleString()}</td>
                  <td className="py-3">
                    <Badge variant={seg.churnRisk === 'Low' ? 'success' : seg.churnRisk === 'High' ? 'warn' : seg.churnRisk === 'Critical' ? 'danger' : 'info'}>{seg.churnRisk}</Badge>
                  </td>
                  <td className="py-3 text-[12px] text-white font-medium">{seg.ltv}</td>
                  <td className="py-3 text-[12px] text-brand-text-muted">{seg.lastActive}</td>
                  <td className="py-3">
                    <Badge variant={seg.status === 'Healthy' || seg.status === 'Improving' ? 'success' : seg.status === 'At Risk' ? 'warn' : seg.status === 'Lapsed' ? 'danger' : 'info'}>{seg.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Playbooks */}
      <Card>
        <CardHeader><CardTitle>Automated Retention Playbooks</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {playbooks.map((pb, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-brand-border bg-brand-sidebar-hover p-4 sm:flex-row sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white text-[13px]">{pb.name}</span>
                  <Badge variant="purple">{pb.segment}</Badge>
                </div>
                <div className="flex gap-2">
                  <Badge variant={pb.impact === 'High' ? 'warn' : 'info'}>Impact: {pb.impact}</Badge>
                  <Badge variant={pb.status === 'Running' ? 'success' : pb.status === 'Ready' ? 'info' : 'warn'}>{pb.status}</Badge>
                </div>
              </div>
              {pb.status !== 'Running' && (
                <Button variant="primary" size="sm" className="shrink-0">
                  {pb.status === 'Ready' ? 'Launch' : 'Submit'}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
