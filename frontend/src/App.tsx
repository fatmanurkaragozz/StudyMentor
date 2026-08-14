import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudyPlanner } from './components/StudyPlanner';
import { RealCalendar } from './components/RealCalendar';
import { GrowthHub } from './components/GrowthHub';
import { AIInsights } from './components/AIInsights';
import { ProfilePage } from './components/ProfilePage';
import { MyCourses } from './components/MyCourses';
import { apiClient, clearToken, getToken, toUserProfile } from './lib/apiClient';

const MainLayout: React.FC<{ onGoToLanding: () => void; onLogout: () => void }> = ({ onGoToLanding, onLogout }) => {
  const { activeTab } = useApp();

  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#121417] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-white transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar onGoToLanding={onGoToLanding} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'courses' && <MyCourses />}
          {activeTab === 'planner' && <StudyPlanner />}
          {activeTab === 'calendar' && <RealCalendar />}
          {activeTab === 'growth' && <GrowthHub />}
          {activeTab === 'insights' && <AIInsights />}
          {activeTab === 'profile' && <ProfilePage onLogout={onLogout} />}
        </main>
      </div>
    </div>
  );
};

export function AppContent() {
  const { setUserProfile } = useApp();
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [checkingSession, setCheckingSession] = useState<boolean>(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    apiClient
      .getMe()
      .then(user => {
        setUserProfile(toUserProfile(user));
        setShowLanding(false);
      })
      .catch(() => clearToken())
      .finally(() => setCheckingSession(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearToken();
    setShowLanding(true);
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] dark:bg-[#121417]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 dark:text-slate-600" />
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  return <MainLayout onGoToLanding={() => setShowLanding(true)} onLogout={handleLogout} />;
}

export function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
