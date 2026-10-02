import { Activity, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { IntroProvider, useIntros } from './context/IntroContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FocusTimerProvider } from './context/FocusTimerContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomTabBar } from './components/BottomTabBar';
import { IntroHint } from './components/IntroHint';
import { WelcomeBanner } from './components/WelcomeBanner';

// Ekran bazli kod bolme: her sekme + landing ayri chunk olarak ilk yukten sonra
// gerektiginde indirilir. Bilesenler named export oldugu icin default'a sariyoruz.
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const MyCourses = lazy(() => import('./components/MyCourses').then(m => ({ default: m.MyCourses })));
const StudyPlanner = lazy(() => import('./components/StudyPlanner').then(m => ({ default: m.StudyPlanner })));
const RealCalendar = lazy(() => import('./components/RealCalendar').then(m => ({ default: m.RealCalendar })));
const GrowthHub = lazy(() => import('./components/GrowthHub').then(m => ({ default: m.GrowthHub })));
const AIInsights = lazy(() => import('./components/AIInsights').then(m => ({ default: m.AIInsights })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));

const RouteFallback: React.FC = () => (
  <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-600">
    <Loader2 className="w-6 h-6 animate-spin" />
  </div>
);

const MainLayout: React.FC<{ onGoToLanding: () => void; onLogout: () => void }> = ({ onGoToLanding, onLogout }) => {
  const { activeTab } = useApp();
  const { welcomePending } = useIntros();

  // Odak sayaci baska sekmeye gecince sifirlanmasin diye planner ilk ziyaretten sonra hep monteli
  // kaliyor, sadece gizleniyor (Activity). Ziyaret kosulu, lazy chunk'i ilk yukte indirmemek icin.
  const [plannerVisited, setPlannerVisited] = useState(activeTab === 'planner');
  if (activeTab === 'planner' && !plannerVisited) setPlannerVisited(true);

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
          <Suspense fallback={<RouteFallback />}>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'courses' && <MyCourses />}
            {plannerVisited && (
              <Activity mode={activeTab === 'planner' ? 'visible' : 'hidden'}>
                <StudyPlanner />
              </Activity>
            )}
            {activeTab === 'calendar' && <RealCalendar />}
            {activeTab === 'growth' && <GrowthHub />}
            {activeTab === 'insights' && <AIInsights />}
            {activeTab === 'profile' && <ProfilePage onLogout={onLogout} />}
          </Suspense>
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
  // status 'authenticated' olur olmaz MainLayout'a atlamasin.
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
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] dark:bg-[#121417]">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 dark:text-slate-600" />
          </div>
        }
      >
        <LandingPage onEnterApp={() => setShowLanding(false)} />
      </Suspense>
    );
  }

  // Sayac durumu MainLayout ile birlikte yasiyor - cikis yapinca / landing'e donunce sifirlanir.
  return (
    <FocusTimerProvider>
      <MainLayout onGoToLanding={() => setShowLanding(true)} onLogout={handleLogout} />
    </FocusTimerProvider>
  );
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
