import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  TrendingUp, 
  Wallet, 
  User, 
  Bell, 
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import LandingFlow from './pages/landing/LandingFlow';
import AuthFlow from './pages/auth/AuthFlow';
import OverviewPage from './pages/OverviewPage';
import ChallengeFlow from './pages/challenges/ChallengeFlow';
import PayoutFlow from './pages/payout/PayoutFlow';
import HubFlow from './pages/hub/HubFlow';
import AccountFlow from './pages/account/AccountFlow';
import NotificationPage from './pages/NotificationPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { isDark, toggleTheme } = useTheme();

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
  };

  const handleAuthRequest = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  if (!isAuthenticated && !showAuth) {
    return <LandingFlow onAuthRequest={handleAuthRequest} />;
  }

  if (!isAuthenticated && showAuth) {
    return <AuthFlow onAuthSuccess={handleAuthSuccess} initialMode={authMode} />;
  }

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'trading', label: 'Hub', icon: TrendingUp },
    { id: 'payouts', label: 'Payouts', icon: Wallet },
    { id: 'profile', label: 'Account', icon: User }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'} font-sans overflow-hidden selection:bg-blue-500/30`}>
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[60%] ${isDark ? 'bg-blue-600/10' : 'bg-blue-600/5'} blur-[150px] rounded-full animate-pulse`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${isDark ? 'bg-purple-600/5' : 'bg-purple-600/3'} blur-[150px] rounded-full`} />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        
        <aside className={`
          hidden lg:flex flex-col w-72 p-6 border-r ${isDark ? 'border-white/5 bg-black/20' : 'border-gray-200 bg-white/80'} backdrop-blur-xl transition-all duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-0'}
        `}>
          <div className="flex items-center justify-center mb-8">
            <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader" className="h-16 w-auto" />
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900') : (isDark ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
              >
                <item.icon size={20} />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          
          <header className="flex items-center justify-between px-6 md:px-10 py-3 md:py-4 bg-transparent z-50">
            <div className="flex items-center gap-4">
              <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader" className="lg:hidden h-12 w-auto" />
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold tracking-widest text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM LIVE
              </div>
            </div>
            
            {/* Remove center logo */}
            
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-100 border-gray-200 text-gray-500'} border`}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setActiveTab('notifications')} className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-100 border-gray-200 text-gray-500'} border`}><Bell size={18} /></button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-40 md:pb-10 no-scrollbar">
            <div className="max-w-6xl mx-auto h-full">
              {activeTab === 'overview' && <OverviewPage />}
              {activeTab === 'challenges' && <ChallengeFlow onGoHome={() => setActiveTab('overview')} />}
              {activeTab === 'payouts' && <PayoutFlow onGoHome={() => setActiveTab('overview')} />}
              {activeTab === 'trading' && <HubFlow />}
              {activeTab === 'profile' && <AccountFlow />}
              {activeTab === 'notifications' && <NotificationPage />}
            </div>
          </main>

          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]">
            <div className={`flex justify-around items-center p-2 rounded-[2.5rem] ${isDark ? 'bg-white/10' : 'bg-white/90'} backdrop-blur-3xl ${isDark ? 'border-white/20' : 'border-gray-200'} border shadow-2xl`}>
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-3xl transition-all duration-300
                    ${activeTab === item.id ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900') : (isDark ? 'text-white/40' : 'text-gray-500')}
                  `}
                >
                  <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.id === 'overview' ? 'Main' : item.label}</span>
                  {activeTab === item.id && <div className="w-1 h-1 rounded-full bg-blue-400 absolute -bottom-1" />}
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}