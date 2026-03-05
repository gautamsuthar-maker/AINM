import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

const reports = [
  { title: 'Weekly Performance Summary', type: 'Auto', generated: '2h ago', status: 'Ready', pages: 8 },
  { title: 'Monthly Marketing Brief — Feb 2025', type: 'Auto', generated: 'Yesterday', status: 'Ready', pages: 24 },
  { title: 'Creative Scorecard Q1 2025', type: 'Manual', generated: '3d ago', status: 'Draft', pages: 12 },
  { title: 'Competitor Intelligence Report', type: 'AI Generated', generated: '1 week ago', status: 'Ready', pages: 18 },
  { title: 'SEO Quarterly Audit', type: 'Manual', generated: '2 weeks ago', status: 'Published', pages: 31 },
  { title: 'Budget Impact Analysis — TikTok Pause', type: 'AI Generated', generated: '3 weeks ago', status: 'Published', pages: 6 },
];

const briefTemplates = [
  { name: 'Exec Weekly Brief', desc: 'High-level KPIs for C-Suite', icon: '📊' },
  { name: 'Channel Performance Report', desc: 'Paid channel deep-dive', icon: '📈' },
  { name: 'Creative Scorecard', desc: 'Asset scoring & decisions', icon: '🎨' },
  { name: 'AI Recommendations Log', desc: 'All AI suggestions & outcomes', icon: '🤖' },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Total Reports" value="142" sub="Generated to date" trend="neutral" />
        <KPIBlock label="Auto-Generated" value="98" sub="this quarter" trend="up" />
        <KPIBlock label="Avg Report Score" value="82" sub="+4 vs last Q" trend="up" />
        <KPIBlock label="Stakeholders" value="14" sub="subscribed" trend="neutral" />
      </div>

      {/* Report List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reports &amp; Briefs</CardTitle>
            <Button variant="primary" size="sm">+ Generate Brief</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{['Title', 'Type', 'Generated', 'Status', 'Pages', ''].map(h => (
                <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                  <td className="py-3 font-medium text-white text-[13px]">{r.title}</td>
                  <td className="py-3"><Badge variant={r.type === 'AI Generated' ? 'purple' : r.type === 'Auto' ? 'info' : 'warn'}>{r.type}</Badge></td>
                  <td className="py-3 text-[12px] text-brand-text-muted">{r.generated}</td>
                  <td className="py-3"><Badge variant={r.status === 'Ready' || r.status === 'Published' ? 'success' : 'warn'}>{r.status}</Badge></td>
                  <td className="py-3 text-[12px] text-brand-text-muted">{r.pages}p</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-[11px]">View</Button>
                      <Button variant="ghost" size="sm" className="text-[11px]">Export</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader><CardTitle>Brief Templates</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {briefTemplates.map(t => (
            <div key={t.name} className="flex flex-col gap-3 rounded-lg border border-brand-border bg-brand-sidebar-hover p-4 cursor-pointer hover:border-blue-500 transition-colors">
              <div className="text-2xl">{t.icon}</div>
              <div>
                <div className="text-[13px] font-semibold text-white">{t.name}</div>
                <div className="text-[11px] text-brand-text-muted">{t.desc}</div>
              </div>
              <Button variant="ghost" size="sm" className="w-fit text-[11px]">Use Template</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
