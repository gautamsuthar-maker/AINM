import { KPIBlock } from "@/components/ui/kpi-block"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Typography } from "@/components/ui/typography"
import { ArrowRight } from "lucide-react"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ChannelChart } from "@/components/dashboard/channel-chart"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPIBlock 
          label="Blended ROAS" 
          value="3.8x" 
          trend={{ value: "+12%", direction: "up" }} 
        />
        <KPIBlock 
          label="nCAC" 
          value="$24.60" 
          trend={{ value: "-8%", direction: "up" }} 
        />
        <KPIBlock 
          label="Active Users" 
          value="48.2K" 
          trend={{ value: "+15%", direction: "up" }} 
        />
        <KPIBlock 
          label="Churn Rate" 
          value="3.2%" 
          trend={{ value: "-0.4pp", direction: "up" }} 
        />
        <KPIBlock 
          label="AI Share of Voice" 
          value="34%" 
          trend={{ value: "+6pp", direction: "up" }} 
        />
        <KPIBlock 
          label="Approval Queue" 
          value="7" 
          trend={{ value: "3 urgent", direction: "down" }} 
        />
      </div>

      {/* Top Actions This Week */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-[14px]">⚡ Top 3 Actions This Week</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            View queue <ArrowRight size={14} className="ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          
          <div className="flex flex-col gap-4 rounded-lg border border-brand-border bg-brand-sidebar-hover p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brand-primary text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                92
              </div>
              <div className="min-w-0">
                <Typography variant="p" className="truncate font-bold">Scale Meta UK +30%</Typography>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="info">Performance</Badge>
                  <Badge variant="warn">HIGH</Badge>
                  <Typography variant="subtle" className="truncate text-[11px]">Budget reallocation</Typography>
                </div>
                <Typography variant="subtle" className="mt-1 truncate text-[11px]">$12.4K rev impact</Typography>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="success" size="sm">Approve</Button>
              <Button variant="ghost" size="sm" className="border-brand-danger/20 text-brand-danger hover:bg-brand-danger/10">Reject</Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-brand-border bg-brand-sidebar-hover p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brand-danger text-xs font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                87
              </div>
              <div className="min-w-0">
                <Typography variant="p" className="truncate font-bold">Pause TikTok campaign &apos;Spring&apos;</Typography>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="info">Performance</Badge>
                  <Badge variant="danger">URGENT</Badge>
                  <Typography variant="subtle" className="truncate text-[11px]">Kill signal</Typography>
                </div>
                <Typography variant="subtle" className="mt-1 truncate text-[11px]">ROAS below floor 3 days</Typography>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="success" size="sm">Approve</Button>
              <Button variant="ghost" size="sm" className="border-brand-danger/20 text-brand-danger hover:bg-brand-danger/10">Reject</Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-brand-border bg-brand-sidebar-hover p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brand-success text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                78
              </div>
              <div className="min-w-0">
                <Typography variant="p" className="truncate font-bold">Approve win-back sequence</Typography>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="info">Retention</Badge>
                  <Badge variant="info">MEDIUM</Badge>
                  <Typography variant="subtle" className="truncate text-[11px]">Lifecycle</Typography>
                </div>
                <Typography variant="subtle" className="mt-1 truncate text-[11px]">Target: 2,400 lapsed buyers</Typography>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="success" size="sm">Approve</Button>
              <Button variant="ghost" size="sm" className="border-brand-danger/20 text-brand-danger hover:bg-brand-danger/10">Reject</Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart />
        <ChannelChart />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">Competitive Landscape</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white">CompA</span>
              <span className="text-[12px] text-brand-success">62% (+3%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white">CompB</span>
              <span className="text-[12px] text-brand-danger">18% (-1%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-white">Your Brand</span>
              <span className="text-[12px] text-brand-success">20% (+5%)</span>
            </div>
            <Button variant="ghost" size="sm" className="mt-4 w-full">
              Full report <ArrowRight size={14} className="ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">AI Share of Voice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-[11px]">
                <span className="text-brand-text-muted">Google AI Overview</span>
                <span className="font-medium text-white">38%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-border">
                <div className="h-full rounded-full bg-brand-primary" style={{ width: '38%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-[11px]">
                <span className="text-brand-text-muted">ChatGPT</span>
                <span className="font-medium text-white">31%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-border">
                <div className="h-full rounded-full bg-brand-purple" style={{ width: '31%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-[11px]">
                <span className="text-brand-text-muted">Perplexity</span>
                <span className="font-medium text-white">28%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-border">
                <div className="h-full rounded-full bg-brand-cyan" style={{ width: '28%' }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-[11px]">
                <span className="text-brand-text-muted">Bing Copilot</span>
                <span className="font-medium text-white">22%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-border">
                <div className="h-full rounded-full bg-brand-pink" style={{ width: '22%' }} />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-2 w-full">
              GEO details <ArrowRight size={14} className="ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">Agent Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-brand-text-muted">Intelligence</span>
              <Badge variant="ok">Healthy</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-brand-text-muted">Performance</span>
              <Badge variant="ok">Healthy</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-brand-text-muted">Creative</span>
              <Badge variant="warn">Degraded</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-brand-text-muted">SEO</span>
              <Badge variant="ok">Healthy</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-brand-text-muted">GEO</span>
              <Badge variant="ok">Healthy</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[12px] text-brand-text-muted">Decision Engine</span>
              <Badge variant="ok">Healthy</Badge>
            </div>
          </CardContent>
        </Card>

      </div>
      
    </div>
  )
}
