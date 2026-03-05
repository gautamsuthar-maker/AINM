import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

const funnelSteps = [
  { label: 'Sessions', value: 48200, pct: 100, color: '#3B82F6' },
  { label: 'Product Views', value: 28400, pct: 58.9, color: '#8B5CF6' },
  { label: 'Add to Cart', value: 12100, pct: 25.1, color: '#F59E0B' },
  { label: 'Checkout', value: 5800, pct: 12.0, color: '#EC4899' },
  { label: 'Purchases', value: 2847, pct: 5.9, color: '#10B981' },
];

const experiments = [
  { name: 'Checkout Flow – 1-Page', variant: 'A', status: 'Running', cvr: '5.2%', lift: '+18%', confidence: 94 },
  { name: 'PDP – Social Proof Banner', variant: 'B', status: 'Running', cvr: '4.8%', lift: '+9%', confidence: 87 },
  { name: 'Cart – Urgency Timer', variant: 'A', status: 'Winner', cvr: '6.1%', lift: '+31%', confidence: 99 },
  { name: 'Sticky CTA – Mobile', variant: 'C', status: 'Running', cvr: '3.9%', lift: '+4%', confidence: 61 },
];

export default function ConversionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Overall CVR" value="5.9%" sub="+1.2pp MoM" trend="up" />
        <KPIBlock label="Cart Abandon" value="52%" sub="-4pp MoM" trend="up" />
        <KPIBlock label="Checkout CVR" value="49.1%" sub="+6pp MoM" trend="up" />
        <KPIBlock label="AOV" value="$94.20" sub="+$7.30 MoM" trend="up" />
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader><CardTitle>Conversion Funnel</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {funnelSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-28 shrink-0 text-[12px] text-brand-text-muted">{step.label}</div>
              <div className="flex-1">
                <div className="h-7 overflow-hidden rounded-md bg-brand-border">
                  <div className="flex h-full items-center px-3 text-[11px] font-semibold text-white transition-all"
                    style={{ width: `${step.pct}%`, background: step.color }}>
                    {step.value.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="w-14 shrink-0 text-right text-[12px] text-brand-text-muted">{step.pct}%</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* A/B Tests */}
      <Card>
        <CardHeader><CardTitle>Active A/B Experiments</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Experiment', 'Variant', 'Status', 'CVR', 'Lift', 'Confidence'].map(h => (
                  <th key={h} className="border-b border-brand-border pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-brand-text-dim">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp, i) => (
                <tr key={i} className="border-b border-brand-border hover:bg-brand-sidebar-hover">
                  <td className="py-3 font-medium text-white text-[12px]">{exp.name}</td>
                  <td className="py-3 text-[12px] text-brand-text-muted">Variant {exp.variant}</td>
                  <td className="py-3"><Badge variant={exp.status === 'Winner' ? 'success' : 'info'}>{exp.status}</Badge></td>
                  <td className="py-3 font-semibold text-white text-[12px]">{exp.cvr}</td>
                  <td className="py-3 text-brand-success text-[12px]">{exp.lift}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-brand-border">
                        <div className="h-full rounded-full transition-all" style={{ width: `${exp.confidence}%`, background: exp.confidence >= 95 ? '#10B981' : exp.confidence >= 80 ? '#F59E0B' : '#EF4444' }} />
                      </div>
                      <span className="text-[11px] text-brand-text-muted">{exp.confidence}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Quick CRO Actions */}
      <Card>
        <CardHeader><CardTitle>Quick CRO Actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: '🚀', label: 'Launch Urgency Banner', desc: 'Flash sale countdown for checkout' },
            { icon: '💬', label: 'Add Exit Intent Popup', desc: '10% offer on cart abandon' },
            { icon: '⭐', label: 'Display Review Stars on PDP', desc: 'Boost trust signals above fold' },
          ].map(action => (
            <div key={action.label} className="flex flex-col gap-3 rounded-lg border border-brand-border bg-brand-sidebar-hover p-4">
              <div className="text-2xl">{action.icon}</div>
              <div>
                <div className="text-[13px] font-semibold text-white">{action.label}</div>
                <div className="text-[11px] text-brand-text-muted">{action.desc}</div>
              </div>
              <Button variant="primary" size="sm" className="w-fit">Launch</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
