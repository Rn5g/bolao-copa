import { useState } from 'react';
import Header from './components/Header';
import PrizePoolWidget from './components/PrizePoolWidget';
import ApostasPage from './components/ApostasPage';
import RankingPage from './components/RankingPage';
import AdminPage from './components/AdminPage';
import AdminLogin, { isAdminAuthenticated, adminLogout } from './components/AdminLogin';

function App() {
  const [activeTab, setActiveTab] = useState('apostas');
  const [refreshKey, setRefreshKey] = useState(0);
  const [adminAuth, setAdminAuth] = useState(isAdminAuthenticated());

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const handleLogout = () => {
    adminLogout();
    setAdminAuth(false);
    setActiveTab('apostas');
  };

  return (
    <div className="min-h-screen pb-10">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <PrizePoolWidget refreshKey={refreshKey} />

      {activeTab === 'apostas' && <ApostasPage onPalpiteSalvo={triggerRefresh} />}
      {activeTab === 'ranking' && <RankingPage refreshKey={refreshKey} />}
      {activeTab === 'admin' && (
        adminAuth ? (
          <>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2 mb-4 flex justify-end">
              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                🔒 Sair da área admin
              </button>
            </div>
            <AdminPage onChange={triggerRefresh} />
          </>
        ) : (
          <AdminLogin onSuccess={() => setAdminAuth(true)} />
        )
      )}

      <footer className="mt-10 text-center text-xs text-slate-600">
        <p>⚽ Bolão da Copa do Mundo 2026 • Feito com React, Vite &amp; Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;
