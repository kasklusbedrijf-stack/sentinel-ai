import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AppPreferencesProvider } from '@/lib/AppPreferencesContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';

// Page imports
import Dashboard from '@/pages/Dashboard';
import Market from '@/pages/Market';
import AssetDetail from '@/pages/AssetDetail';
import Portfolio from '@/pages/Portfolio';
import Positions from '@/pages/Positions';
import Signals from '@/pages/Signals';
import AgentsPage from '@/pages/AgentsPage';
import Alerts from '@/pages/Alerts';
import Risk from '@/pages/Risk';
import Audit from '@/pages/Audit';
import Settings from '@/pages/Settings';
import Connections from '@/pages/Connections';
import TradeApproval from '@/pages/TradeApproval';
import TradeApprovalList from '@/pages/TradeApprovalList.jsx';
import Pipeline from '@/pages/Pipeline';
import DownloadArchive from '@/pages/DownloadArchive';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm">Loading CryptoAI…</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/market" element={<Market />} />
        <Route path="/asset/:id" element={<AssetDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/signals" element={<Signals />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/trade-approval-list" element={<TradeApprovalList />} />
        <Route path="/trade-approval/:id" element={<TradeApproval />} />
        <Route path="/trade-approval" element={<TradeApproval />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/download-archive" element={<DownloadArchive />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppPreferencesProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AppPreferencesProvider>
    </AuthProvider>
  );
}

export default App;