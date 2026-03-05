import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

const citations = [
  { source: 'ChatGPT', query: 'best fitness apps', mentioned: true, rank: 2 },
  { source: 'Google SGE', query: 'home workout apps', mentioned: true, rank: 1 },
  { source: 'Perplexity', query: 'workout tracker app', mentioned: false, rank: null },
  { source: 'Claude', query: 'calorie counting app', mentioned: true, rank: 4 },
  { source: 'Gemini', query: 'fitness subscription app', mentioned: false, rank: null },
];

const schema = [
  { page: '/pricing', type: 'PriceSpecification', status: 'Active', citations: 42 },
  { page: '/features', type: 'Product', status: 'Active', citations: 28 },
  { page: '/reviews', type: 'Review', status: 'Missing', citations: 0 },
  { page: '/faq', type: 'FAQPage', status: 'Active', citations: 91 },
  { page: '/blog/best-apps', type: 'Article', status: 'Draft', citations: 0 },
];

export default function GeoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="AI Citations" value="184" sub="+28 this month" trend="up" />
        <KPIBlock label="LLM Mention Rate" value="62%" sub="+8pp MoM" trend="up" />
        <KPIBlock label="Avg Citation Rank" value="2.4" sub="-0.6 MoM" trend="up" />
        <KPIBlock label="Schema Coverage" value="71%" sub="+12pp MoM" trend="up" />
      </div>

      {/* LLM Citation Tracker */}
      <Card>
        <CardHeader><CardTitle>LLM Citation Tracker</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{['AI Source', 'Query', 'Mentioned?', 'Citation Rank', ''].map(h => (
                <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {citations.map((c, i) => (
                <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                  <td className="py-3 font-semibold text-white text-[13px]">{c.source}</td>
                  <td className="py-3 text-[12px] text-brand-text-muted">&ldquo;{c.query}&rdquo;</td>
                  <td className="py-3"><Badge variant={c.mentioned ? 'success' : 'danger'}>{c.mentioned ? 'Yes' : 'No'}</Badge></td>
                  <td className="py-3 text-[12px] text-white">{c.rank ? `#${c.rank}` : '—'}</td>
                  <td className="py-3">
                    {!c.mentioned && <Button variant="ghost" size="sm" className="text-[11px]">Optimize</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Schema Coverage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Schema Markup Coverage</CardTitle>
            <Button variant="primary" size="sm">+ Add Schema</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{['Page', 'Schema Type', 'Status', 'AI Citations'].map(h => (
                <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {schema.map((s, i) => (
                <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                  <td className="py-3 font-mono text-[12px] text-brand-text-muted">{s.page}</td>
                  <td className="py-3"><Badge variant="purple">{s.type}</Badge></td>
                  <td className="py-3"><Badge variant={s.status === 'Active' ? 'success' : s.status === 'Missing' ? 'danger' : 'warn'}>{s.status}</Badge></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-brand-border">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(s.citations, 100)}%` }} />
                      </div>
                      <span className="text-[12px] text-brand-text-muted">{s.citations}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
