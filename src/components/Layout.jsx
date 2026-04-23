import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, TrendingUp, Briefcase, Zap, Settings,
  Bell, Bot, ChevronRight, Menu, X, Shield, Activity, Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlobalSearch from '@/components/GlobalSearch';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/market', label: 'Market', icon: TrendingUp },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/signals', label: 'AI Signals', icon: Zap },
  { path: '/positions', label: 'Positions', icon: Activity },
  { path: '/agents', label: 'AI Agents', icon: Bot },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/risk', label: 'Risk Settings', icon: Shield },
  { path: '/audit', label: 'Audit Log', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Analysis Mode Active</span>
          </div>
        </div>
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
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
            title="Search (Cmd+K)"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Capital Protection badge — text on sm+, icon-only on mobile */}
          <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 text-xs text-yellow-400 border-yellow-400/30 bg-yellow-400/5 px-2.5 py-1">
            <Shield className="w-3 h-3" />
            Capital Protection ON
          </Badge>
          <Badge variant="outline" className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-md text-yellow-400 border-yellow-400/30 bg-yellow-400/5 p-0">
            <Shield className="w-3.5 h-3.5" />
          </Badge>

          <Link to="/alerts">
            <Button variant="ghost" size="icon" className="relative w-9 h-9">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
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