import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, TrendingUp, Briefcase, Zap, Settings,
  Bell, Bot, ChevronRight, Menu, X, Shield, Activity, Search, Cpu, Wifi
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import GlobalSearch from '@/components/GlobalSearch';

function TradingModeStatus() {
  const [mode, setMode] = useState('analysis_only');
  useEffect(() => {
    base44.entities.RiskSettings.list('-created_date', 1)
      .then(rs => { if (rs[0]?.trading_mode) setMode(rs[0].trading_mode); })
      .catch(() => {});
  }, []);
  const isAuto = mode === 'auto';
  const isSemi = mode === 'semi_auto';
  const label = isAuto ? 'Auto Trading' : isSemi ? 'Semi-Auto' : 'Analysis Only';
  const colorCls = isAuto ? 'text-orange-400' : isSemi ? 'text-yellow-400' : 'text-green-400';
  const bgCls = isAuto ? 'bg-orange-500/10 border-orange-500/20' : isSemi ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20';
  const dotCls = isAuto ? 'bg-orange-400' : isSemi ? 'bg-yellow-400' : 'bg-green-400';
  return (
    <div className="px-4 py-4 border-t border-sidebar-border">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgCls}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${dotCls}`} />
        <span className={`text-xs font-medium ${colorCls}`}>{label}</span>
      </div>
    </div>
  );
}

const getNavItems = (t) => [
  { path: '/', label: t('nav_dashboard'), icon: LayoutDashboard },
  { path: '/market', label: t('nav_market'), icon: TrendingUp },
  { path: '/portfolio', label: t('nav_portfolio'), icon: Briefcase },
  { path: '/signals', label: t('nav_signals'), icon: Zap },
  { path: '/positions', label: t('nav_positions'), icon: Activity },
  { path: '/agents', label: t('nav_agents'), icon: Bot },
  { path: '/pipeline', label: 'AI Scout ✦', icon: Cpu },
  { path: '/alerts', label: t('nav_alerts'), icon: Bell },
  { path: '/risk', label: t('nav_risk'), icon: Shield },
  { path: '/connections', label: 'Data Sources', icon: Wifi },
  { path: '/audit', label: t('nav_audit'), icon: Activity },
  { path: '/settings', label: t('nav_settings'), icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useAppPreferences();
  const navItems = getNavItems(t);

  // Live unread alert count
  useEffect(() => {
    base44.entities.Alert.filter({ is_read: false }, '-created_date', 100)
      .then(a => setUnreadCount(a.length))
      .catch(() => {});
    const unsub = base44.entities.Alert.subscribe(event => {
      if (event.type === 'create') setUnreadCount(c => c + 1);
      if (event.type === 'update' && event.data?.is_read) setUnreadCount(c => Math.max(0, c - 1));
    });
    return unsub;
  }, []);

  // Global keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  return (
    <div className="flex h-screen bg-background font-inter overflow-hidden">
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border
        flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">AI Crypto</div>
            <div className="text-xs text-muted-foreground">Trading Assistant</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3 h-3 text-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <TradingModeStatus />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-3 sm:px-4 gap-2 sm:gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          {/* Search icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="flex text-muted-foreground hover:text-foreground"
            title={t('global_search')}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Capital Protection badge — text on sm+, icon-only on mobile */}
          <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 text-xs text-yellow-400 border-yellow-400/30 bg-yellow-400/5 px-2.5 py-1">
            <Shield className="w-3 h-3" />
            {t('dashboard_capital_protection')}
          </Badge>
          <Badge variant="outline" className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-md text-yellow-400 border-yellow-400/30 bg-yellow-400/5 p-0">
            <Shield className="w-3.5 h-3.5" />
          </Badge>

          <Link to="/alerts">
            <Button variant="ghost" size="icon" className="relative w-9 h-9">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}