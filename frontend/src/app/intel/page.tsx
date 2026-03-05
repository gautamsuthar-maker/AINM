import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

const competitors = [
  { name: 'Peloton', adSpend: '$2.1M', roas: '2.4x', channels: ['Meta', 'YouTube', 'TikTok'], sentiment: 72, threat: 'high' },
  { name: 'Mirror', adSpend: '$820K', roas: '1.9x', channels: ['Meta', 'Google'], sentiment: 58, threat: 'medium' },
  { name: 'Tonal', adSpend: '$1.2M', roas: '3.1x', channels: ['Meta', 'Instagram', 'YouTube'], sentiment: 81, threat: 'high' },
  { name: 'Whoop', adSpend: '$640K', roas: '4.2x', channels: ['Meta', 'TikTok'], sentiment: 66, threat: 'medium' },
  { name: 'Hydrow', adSpend: '$380K', roas: '2.8x', channels: ['Meta', 'Google'], sentiment: 74, threat: 'low' },
];

const threatBadge: Record<string, React.ReactNode> = {
  high: <Badge variant="danger">HIGH</Badge>,
  medium: <Badge variant="warn">MEDIUM</Badge>,
  low: <Badge variant="info">LOW</Badge>,
};

const insights = [
  { icon: '🎯', title: 'Peloton launching post-acquisition push', desc: 'Detected 40% spend increase across Meta + YouTube in the past 14 days. New creative emphasizes subscription bundling.', urgency: 'urgent' as const },
  { icon: '💡', title: 'Tonal ROAS surge — creative theme detected', desc: "High-performing themes: 'gym at home' + 'no commute'. AI recommends similar messaging test.", urgency: 'opportunity' as const },
  { icon: '📉', title: 'Mirror reducing TikTok budget', desc: 'Mirror cut TikTok spend 60% this week. Opportunity to capture their audience with strategic overbid.', urgency: 'info' as const },
];

export default function IntelPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Competitors Tracked" value="12" sub="5 active threats" trend="neutral" />
        <KPIBlock label="Your Share of Voice" value="34%" sub="+6pp MoM" trend="up" />
        <KPIBlock label="AI Insights Today" value="8" sub="3 actionable" trend="up" />
        <KPIBlock label="Avg Competitor ROAS" value="2.9x" sub="vs your 3.8x" trend="up" />
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader><CardTitle>AI-Generated Intel Alerts</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg border border-brand-border bg-brand-sidebar-hover p-4">
              <div className="shrink-0 text-2xl">{ins.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white text-[13px]">{ins.title}</span>
                  {ins.urgency === 'urgent' && <Badge variant="danger">URGENT</Badge>}
                  {ins.urgency === 'opportunity' && <Badge variant="success">OPPORTUNITY</Badge>}
                  {ins.urgency === 'info' && <Badge variant="info">INFO</Badge>}
                </div>
                <p className="text-[12px] text-brand-text-muted">{ins.desc}</p>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 text-[11px]">Act on this</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Competitor table */}
      <Card>
        <CardHeader><CardTitle>Competitor Landscape</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Brand', 'Est. Ad Spend', 'Est. ROAS', 'Active Channels', 'Sentiment', 'Threat'].map(h => (
                  <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((c, i) => (
                <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                  <td className="py-3 font-semibold text-white text-[13px]">{c.name}</td>
                  <td className="py-3 text-[12px] text-brand-text-muted">{c.adSpend}</td>
                  <td className="py-3 text-[12px] text-white font-medium">{c.roas}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.channels.map(ch => <Badge key={ch} variant="info">{ch}</Badge>)}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-brand-border">
                        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${c.sentiment}%` }} />
                      </div>
                      <span className="text-[12px] text-brand-text-muted">{c.sentiment}</span>
                    </div>
                  </td>
                  <td className="py-3">{threatBadge[c.threat]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
