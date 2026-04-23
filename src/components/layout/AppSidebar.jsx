import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, TrendingUp, Briefcase, Radio, Zap,
  Settings, Shield, Bell, Bot, ChevronRight, AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: TrendingUp, label: 'Market', path: '/market' },
  { icon: Briefcase, label: 'Portfolio', path: '/portfolio' },
  { icon: Radio, label: 'Open Positions', path: '/positions' },
  { icon: Zap, label: 'AI Signals', path: '/signals' },
  { icon: Bell, label: 'Alerts', path: '/alerts', badge: true },
  { icon: Bot, label: 'AI Agents', path: '/agents' },
  { icon: Shield, label: 'Risk Settings', path: '/risk' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppSidebar({ unreadAlerts = 0 }) {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">CryptoAI</p>
            <p className="text-xs text-muted-foreground">Trading Assistant</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground')} />
              <span className="flex-1">{item.label}</span>
              {item.badge && unreadAlerts > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                  {unreadAlerts}
                </Badge>
              )}
              {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Emergency Stop */}
      <div className="p-3 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          Emergency Stop
        </button>
      </div>
    </aside>
  );
}