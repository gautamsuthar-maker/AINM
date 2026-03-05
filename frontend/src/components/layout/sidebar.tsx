'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Image as ImageIcon,
  Search,
  Globe,
  Mail,
  RefreshCw,
  LineChart,
  Activity,
  FileText,
  ShieldCheck,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    section: 'OVERVIEW',
    items: [
      { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Approver Queue', href: '/approvals', icon: Inbox },
    ],
  },
  {
    section: 'AGENT LAYER',
    items: [
      { name: 'Performance Marketing', href: '/performance', icon: TrendingUp },
      { name: 'Creative Hub', href: '/creative', icon: ImageIcon },
      { name: 'SEO Command', href: '/seo', icon: Search },
      { name: 'GEO Intelligence', href: '/geo', icon: Globe },
      { name: 'Nurture Studio', href: '/nurture', icon: Mail },
      { name: 'Conversion Lab', href: '/conversion', icon: RefreshCw },
      { name: 'Retention Engine', href: '/retention', icon: Activity },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { name: 'Competitive Intel', href: '/intel', icon: LineChart },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { name: 'Budget Simulator', href: '/simulator', icon: Activity },
      { name: 'Reports & Briefs', href: '/reports', icon: FileText },
      { name: 'Audit Trail', href: '/audit', icon: ShieldCheck },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col overflow-y-auto bg-brand-sidebar px-3 py-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:sticky md:top-4 md:translate-x-0 md:h-[calc(100vh-32px)] md:shrink-0 md:rounded-2xl md:border md:border-brand-border shadow-2xl md:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-2 pb-6 pt-2">
          <div className="text-[16px] font-bold text-white tracking-wide flex items-center gap-2">
            <div className="h-6 w-6 rounded border border-brand-border bg-base-200 flex items-center justify-center text-xs">
              ◆
            </div>
            AINM
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-muted hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-1">
          {navSections.map((group) => (
            <div key={group.section} className="pt-3">

              {/* Section label row */}
              <div className="flex items-center gap-2 px-2.5 pb-1">
                {/* Small dot anchoring the line */}
                <div className="h-1 w-1 rounded-full bg-white/20 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-brand-text-dim">
                  {group.section}
                </span>
              </div>

              {/* Children with vertical connector line — per-item segments */}
              <div className="relative ml-[14px] flex flex-col gap-[2px]">
                {group.items.map((item, itemIdx) => {
                  const isActive =
                    pathname === item.href ||
                    (pathname === '/' && item.href === '/dashboard');
                  const IconComponent = item.icon;
                  const isLast = itemIdx === group.items.length - 1;

                  return (
                    <div key={item.href} className="relative flex items-center">
                      {/* Vertical line: top → center (all items) */}
                      <div className="absolute left-0 top-0 h-1/2 w-px bg-white/10" />
                      {/* Vertical line: center → bottom (non-last items only) */}
                      {!isLast && (
                        <div className="absolute left-0 top-1/2 h-1/2 w-px bg-white/10" />
                      )}
                      {/* Horizontal tick at center */}
                      <div className="absolute left-0 top-1/2 -translate-y-px w-3 border-t border-white/10" />

                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'ml-3 flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-colors',
                          isActive
                            ? 'bg-brand-sidebar-active text-white'
                            : 'text-brand-text-muted hover:bg-brand-sidebar-hover hover:text-brand-text'
                        )}
                      >
                        <IconComponent size={15} strokeWidth={2} />
                        <span>{item.name}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
