'use client';

import { Menu, RefreshCw, Download } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const pathname = usePathname();
  
  // Format page title from pathname
  const rawPath = pathname === '/' ? 'dashboard' : pathname.slice(1);
  const titles: Record<string, { title: string, subtitle: string }> = {
    'dashboard': { title: 'Command Center', subtitle: 'Platform overview · All agents · Real-time' },
    'approvals': { title: 'Approver Queue', subtitle: 'Pending actions requiring human oversight' },
    'performance': { title: 'Performance Marketing', subtitle: 'Ad networks · ROAS · Budget pacing' },
    'creative': { title: 'Creative Hub', subtitle: 'Asset generation · A/B testing · Copy variants' },
    'seo': { title: 'SEO Command', subtitle: 'Rankings · Content updates · Technical audits' },
    'geo': { title: 'GEO Intelligence', subtitle: 'Regional performance · Localization' },
    'nurture': { title: 'Nurture Studio', subtitle: 'Email sequences · SMS · Push notifications' },
    'conversion': { title: 'Conversion Lab', subtitle: 'Landing pages · Checkout optimization' },
    'retention': { title: 'Retention Engine', subtitle: 'Churn prevention · Win-back campaigns' },
    'intel': { title: 'Competitive Intel', subtitle: 'Competitor tracking · Market share' },
    'simulator': { title: 'Budget Simulator', subtitle: 'Predictive modeling · Scenarios' },
    'reports': { title: 'Reports & Briefs', subtitle: 'Automated insights · Client exports' },
    'audit': { title: 'Audit Trail', subtitle: 'System logs · Activity history' },
    'settings': { title: 'Platform Settings', subtitle: 'Configuration · Team members · Integrations' },
  };

  const currentView = titles[rawPath] || { title: rawPath.charAt(0).toUpperCase() + rawPath.slice(1), subtitle: 'Overview' };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-brand-border bg-brand-sidebar px-6 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded p-1 text-brand-text-muted hover:bg-brand-sidebar-hover lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <Typography variant="h3" as="h1">{currentView.title}</Typography>
          <Typography variant="subtle" className="text-[12px] text-brand-text-muted">{currentView.subtitle}</Typography>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 rounded-md border border-brand-border bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-brand-text-muted transition-colors hover:border-brand-border-hover hover:text-brand-text">
          <RefreshCw size={14} />
          Refresh
        </button>
        <button className="flex items-center gap-1.5 rounded-md border border-brand-border bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-brand-text-muted transition-colors hover:border-brand-border-hover hover:text-brand-text">
          <Download size={14} />
          Export
        </button>
      </div>
    </header>
  );
}
