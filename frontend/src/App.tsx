import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { Hero3DLanding } from './components/Hero3DLanding';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { StudyPlanner } from './components/StudyPlanner';
import { CalendarGoalTracker } from './components/CalendarGoalTracker';
import { GrowthHub } from './components/GrowthHub';
import { AIInsights } from './components/AIInsights';

const MainLayout: React.FC<{ onGoToLanding: () => void }> = ({ onGoToLanding }) => {
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
          {activeTab === 'planner' && <StudyPlanner />}
          {activeTab === 'calendar' && <CalendarGoalTracker />}
          {activeTab === 'growth' && <GrowthHub />}
          {activeTab === 'insights' && <AIInsights />}
        </main>
      </div>
    </div>
  );
};

export function AppContent() {
  const [showLanding, setShowLanding] = useState<boolean>(true);

  if (showLanding) {
    return <Hero3DLanding onEnterApp={() => setShowLanding(false)} />;
  }

  return <MainLayout onGoToLanding={() => setShowLanding(true)} />;
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
