import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, LayoutDashboard, TrendingUp, Briefcase, Zap, Activity, Bot, Bell, Shield, FileText, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppPreferences } from '@/lib/AppPreferencesContext';
import { cn } from '@/lib/utils';

const getSearchableItems = (t) => [
  { id: 'dashboard', label: t('nav_dashboard'), path: '/', icon: LayoutDashboard, category: 'Navigation' },
  { id: 'market', label: t('nav_market'), path: '/market', icon: TrendingUp, category: 'Navigation' },
  { id: 'portfolio', label: t('nav_portfolio'), path: '/portfolio', icon: Briefcase, category: 'Navigation' },
  { id: 'signals', label: t('nav_signals'), path: '/signals', icon: Zap, category: 'Navigation' },
  { id: 'positions', label: t('nav_positions'), path: '/positions', icon: Activity, category: 'Navigation' },
  { id: 'agents', label: t('nav_agents'), path: '/agents', icon: Bot, category: 'Navigation' },
  { id: 'alerts', label: t('nav_alerts'), path: '/alerts', icon: Bell, category: 'Navigation' },
  { id: 'risk', label: t('nav_risk'), path: '/risk', icon: Shield, category: 'Navigation' },
  { id: 'audit', label: t('nav_audit'), path: '/audit', icon: FileText, category: 'Navigation' },
  { id: 'settings', label: t('nav_settings'), path: '/settings', icon: Settings, category: 'Navigation' },
  { id: 'portfolio-add', label: t('portfolio_add_holding'), path: '/portfolio', icon: Briefcase, category: 'Actions' },
  { id: 'position-add', label: t('positions_add_position'), path: '/positions', icon: Activity, category: 'Actions' },
  { id: 'new-chat', label: t('agents_new_chat'), path: '/agents', icon: Bot, category: 'Actions' },
];

export default function GlobalSearch({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { t } = useAppPreferences();
  const SEARCHABLE_ITEMS = getSearchableItems(t);

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.toLowerCase();
    return SEARCHABLE_ITEMS.filter(item =>
      item.label.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [search, SEARCHABLE_ITEMS]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setSearch('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-0">
        <div className="mx-auto max-w-2xl mt-4 sm:mt-8">
          <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Input
                autoFocus
                placeholder={t('global_search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              />
              <button
                onClick={onClose}
                className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            {search.trim() === '' ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                {t('global_search_placeholder')}
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                {t('global_search_no_results')} "{search}"
              </div>
            ) : (
              <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
                {results.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-border/50 bg-secondary/30 text-xs text-muted-foreground text-center">
              Press Esc to close · ↵ to navigate
            </div>
          </div>
        </div>
      </div>
    </>
  );
}