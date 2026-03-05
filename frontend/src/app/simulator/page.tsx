'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPIBlock } from '@/components/ui/kpi-block';

const channels = ['Google Ads', 'Meta Ads', 'TikTok', 'ASA', 'Snapchat', 'YouTube'];
const channelColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
const roasMap: Record<string, number> = { 'Google Ads': 4.2, 'Meta Ads': 3.6, TikTok: 1.3, ASA: 5.8, Snapchat: 1.9, YouTube: 3.2 };

export default function SimulatorPage() {
  const [budget, setBudget] = useState(80000);
  const [allocs, setAllocs] = useState([40, 25, 10, 8, 5, 7]);
  const [attrModel, setAttrModel] = useState('Data-Driven');

  const total = allocs.reduce((a, b) => a + b, 0);
  const projectedRevenue = channels.reduce((acc, ch, i) => {
    const spend = (budget * allocs[i]) / 100;
    return acc + spend * roasMap[ch];
  }, 0);
  const blendedROAS = projectedRevenue / budget;

  const updateAlloc = (i: number, val: number) => {
    const v = [...allocs]; v[i] = val; setAllocs(v);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPIBlock label="Total Budget" value={`$${(budget / 1000).toFixed(0)}K`} sub="Monthly" trend="neutral" />
        <KPIBlock label="Projected Revenue" value={`$${(projectedRevenue / 1000).toFixed(1)}K`} sub="based on model" trend="up" />
        <KPIBlock label="Blended ROAS" value={`${blendedROAS.toFixed(2)}x`} sub="projected" trend="up" />
        <KPIBlock label="Attribution Model" value={attrModel.split('-')[0]} sub={attrModel} trend="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Budget Slider */}
        <Card>
          <CardHeader><CardTitle>Simulate Budget</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-[12px] text-brand-text-muted">Total Monthly Budget</span>
                <span className="text-[14px] font-bold text-white">${budget.toLocaleString()}</span>
              </div>
              <input type="range" min={10000} max={500000} step={5000} value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full" style={{ accentColor: '#3B82F6' }} />
            </div>

            <div className="border-t border-brand-border pt-4">
              <div className="mb-3 text-[12px] font-medium text-white">Channel Allocation (%)</div>
              {channels.map((ch, i) => (
                <div key={ch} className="mb-3">
                  <div className="mb-1 flex justify-between">
                    <span className="text-[12px] text-brand-text-muted">{ch}</span>
                    <span className="text-[12px] text-white">{allocs[i]}% · ${((budget * allocs[i]) / 100 / 1000).toFixed(1)}K</span>
                  </div>
                  <input type="range" min={0} max={100} value={allocs[i]}
                    onChange={e => updateAlloc(i, Number(e.target.value))}
                    className="w-full" style={{ accentColor: channelColors[i] }} />
                </div>
              ))}
              <div className={`flex justify-between pt-3 border-t border-brand-border text-[13px] font-semibold`}>
                <span className="text-white">Total</span>
                <span className={total === 100 ? 'text-brand-success' : 'text-brand-danger'}>{total}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projection Output */}
        <Card>
          <CardHeader><CardTitle>Projected Outcomes</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Attribution model select */}
            <div>
              <div className="mb-2 text-[11px] text-brand-text-muted">Attribution Model</div>
              <div className="flex flex-wrap gap-2">
                {['First Touch', 'Last Touch', 'Data-Driven'].map(m => (
                  <button key={m} onClick={() => setAttrModel(m)}
                    className={`rounded-md border px-3 py-1.5 text-[11px] font-medium transition-all ${attrModel === m ? 'border-blue-500 bg-blue-500 text-white' : 'border-brand-border text-brand-text-muted hover:text-white'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-brand-border pt-4">
              {channels.map((ch, i) => {
                const spend = (budget * allocs[i]) / 100;
                const rev = spend * roasMap[ch];
                return (
                  <div key={ch} className="mb-3">
                    <div className="mb-1 flex justify-between">
                      <span className="text-[12px] text-brand-text-muted">{ch}</span>
                      <span className="text-[12px] text-white">ROAS {roasMap[ch]}x · ${(rev / 1000).toFixed(1)}K rev</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-border">
                      <div className="h-full rounded-full" style={{ width: `${Math.min((roasMap[ch] / 7) * 100, 100)}%`, background: channelColors[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <Button variant="primary" className="w-full justify-center mt-auto">Submit for Approval</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
