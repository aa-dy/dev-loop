import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ApiProvider } from './hooks/useApiClient';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';

// Statically import pages instead of lazy-loading
import HomePage from './pages/Home';
import ProposePage from './pages/Propose';
import PollPage from './pages/Poll';
import SessionPage from './pages/Session';
import StudyPackPage from './pages/StudyPack';
import RecapPage from './pages/Recap';
import AdminPage from './pages/Admin';

const App: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const dismissToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ApiProvider>
      <HashRouter>
        <Layout>
            <div className="fixed bottom-4 right-4 z-50">
                <NavLink to="/admin" title="Admin Panel" className="bg-brand-gold text-brand-navy w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </NavLink>
            </div>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/propose" element={<ProposePage addToast={addToast} />} />
              <Route path="/poll" element={<PollPage addToast={addToast} />} />
              <Route path="/session" element={<SessionPage />} />
              <Route path="/pack" element={<StudyPackPage />} />
              <Route path="/recap" element={<RecapPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </Layout>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </HashRouter>
    </ApiProvider>
  );
};

export default App;
