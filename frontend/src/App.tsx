import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { IntroProvider, useIntros } from './context/IntroContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomTabBar } from './components/BottomTabBar';
import { Dashboard } from './components/Dashboard';
import { StudyPlanner } from './components/StudyPlanner';
import { RealCalendar } from './components/RealCalendar';
import { GrowthHub } from './components/GrowthHub';
import { AIInsights } from './components/AIInsights';
import { ProfilePage } from './components/ProfilePage';
import { MyCourses } from './components/MyCourses';
import { IntroHint } from './components/IntroHint';
import { WelcomeBanner } from './components/WelcomeBanner';

const MainLayout: React.FC<{ onGoToLanding: () => void; onLogout: () => void }> = ({ onGoToLanding, onLogout }) => {
  const { activeTab } = useApp();
  const { welcomePending } = useIntros();

  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#121417] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-brand-pink-dark selection:text-white transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar onGoToLanding={onGoToLanding} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {welcomePending && activeTab === 'dashboard' ? (
            <WelcomeBanner />
          ) : (
            <IntroHint kind="section" id={activeTab} key={activeTab} />
          )}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'courses' && <MyCourses />}
          {activeTab === 'planner' && <StudyPlanner />}
          {activeTab === 'calendar' && <RealCalendar />}
          {activeTab === 'growth' && <GrowthHub />}
          {activeTab === 'insights' && <AIInsights />}
          {activeTab === 'profile' && <ProfilePage onLogout={onLogout} />}
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
};

export function AppContent() {
  const { status, logout } = useAuth();
  const [showLanding, setShowLanding] = useState<boolean>(true);
  // AuthContext.status'un 'loading'dan ilk cikisi - sayfa yuklemesinde gecerli bir
  // oturum bulunduysa (httpOnly refresh cookie) landing'i atlar. Sonraki 'unauthenticated'
  // geciler (orn. oturum kullanim sirasinda suresi dolarsa) landing'e geri doner - ama bu,
  // ilk coz'ulmeden ayri tutuluyor ki register/dogrulama akisindaki ara adimlar
  // (DATA_ENTRY) status 'authenticated' olur olmaz MainLayout'a atlamasin.
  const hasResolvedInitialAuth = useRef(false);

  // Ilk cozumlemeyi (loading -> authenticated) effect yerine render fazinda yapiyoruz:
  // effect commit'ten SONRA calistigi icin, status 'authenticated' oldugu render'da
  // showLanding hala true kalip LandingPage bir kare boyanirdi. Render sirasinda
  // setState cagirmak React'i commit'ten once yeniden render etmeye zorluyor, bu yuzden
  // gecerli oturumu olan kullanici hicbir karede "Giris Yap" gormuyor.
  if (status !== 'loading' && !hasResolvedInitialAuth.current) {
    hasResolvedInitialAuth.current = true;
    if (status === 'authenticated') setShowLanding(false);
  }

  useEffect(() => {
    if (status === 'unauthenticated' && hasResolvedInitialAuth.current) setShowLanding(true);
  }, [status]);

  const handleLogout = async () => {
    await logout();
    setShowLanding(true);
  };

  if (status === 'loading') {
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
        <IntroProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </IntroProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
