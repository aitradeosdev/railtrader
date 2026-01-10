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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import LandingFlow from './pages/landing/LandingFlow';
import AuthFlow from './pages/auth/AuthFlow';
import OverviewPage from './pages/OverviewPage';
import ChallengeFlow from './pages/challenges/ChallengeFlow';
import PayoutFlow from './pages/payout/PayoutFlow';
import HubFlow from './pages/hub/HubFlow';
import AccountFlow from './pages/account/AccountFlow';
import NotificationPage from './pages/NotificationPage';

import AdminRoutes from './pages/admin/AdminRoutes';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersFlow from './pages/admin/AdminUsersPage';
import ChallengeManagementFlow from './pages/admin/challenges/ChallengeManagementFlow';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage';
import MT5Flow from './pages/admin/mt5/MT5Flow';
import AdminChallengeConfig from './pages/admin/AdminChallengeConfig';

function AppContent() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { isDark } = useTheme();
  const { isAuthenticated, loading, user } = useAuth();

  const handleAuthRequest = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated && !showAuth) {
    return <LandingFlow onAuthRequest={handleAuthRequest} />;
  }

  if (!isAuthenticated && showAuth) {
    return <AuthFlow onAuthSuccess={handleAuthSuccess} initialMode={authMode} />;
  }

  // Admin gets separate interface
  if (user?.isAdmin) {
    return <AdminApp />;
  }

  // Regular user interface
  return <UserApp />;
}

function AdminApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
  };

  const adminNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: User },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'config', label: 'Config', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ), hideOnMobile: true },
    { id: 'payouts', label: 'Payouts', icon: Wallet },
    { id: 'trading', label: 'Trading Hub', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'} font-sans overflow-hidden`}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[60%] ${isDark ? 'bg-red-600/10' : 'bg-red-600/5'} blur-[150px] rounded-full animate-pulse`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${isDark ? 'bg-orange-600/5' : 'bg-orange-600/3'} blur-[150px] rounded-full`} />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Admin Sidebar */}
        <aside className={`hidden lg:flex flex-col w-72 p-6 border-r ${isDark ? 'border-white/5 bg-black/20' : 'border-gray-200 bg-white/80'} backdrop-blur-xl`}>
          <div className="flex items-center justify-center mb-8">
            <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader Admin" className="h-16 w-auto" />
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-bold tracking-widest text-red-400 mb-6 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            ADMIN PANEL
          </div>

          <nav className="space-y-1 flex-1">
            {adminNavItems.map(item => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') : (isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')}`}
              >
                <item.icon size={20} />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-white/10">
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Admin Header */}
          <header className="flex items-center justify-between px-6 md:px-10 py-3 md:py-4 bg-transparent z-50">
            <div className="flex items-center gap-4">
              <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader Admin" className="lg:hidden h-12 w-auto" />
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold tracking-widest text-red-400">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                ADMIN PANEL
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`hidden md:block text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Welcome, {user.firstName}</span>
              <button onClick={toggleTheme} className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-100 border-gray-200 text-gray-500'} border`}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setActiveTab('notifications')} className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-100 border-gray-200 text-gray-500'} border`}><Bell size={18} /></button>
            </div>
          </header>

          {/* Admin Main Content */}
          <main className="flex-1 overflow-y-auto px-6 md:px-10 pb-40 md:pb-10 no-scrollbar">
            <div className="max-w-6xl mx-auto h-full">
              {activeTab === 'overview' && <AdminOverviewPage />}
              {activeTab === 'users' && <AdminUsersFlow />}
              {activeTab === 'challenges' && <ChallengeManagementFlow />}
              {activeTab === 'config' && <AdminChallengeConfig />}
              {activeTab === 'payouts' && <AdminPayoutsPage />}
              {activeTab === 'trading' && <MT5Flow />}
              {activeTab === 'settings' && <AdminRoutes />}
              {activeTab === 'notifications' && <NotificationPage />}
            </div>
          </main>

          {/* Admin Mobile Navigation */}
          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]">
            <div className={`flex justify-around items-center p-2 rounded-[2.5rem] ${isDark ? 'bg-white/10' : 'bg-white/90'} backdrop-blur-3xl ${isDark ? 'border-white/20' : 'border-gray-200'} border shadow-2xl`}>
              {adminNavItems.filter(item => !item.hideOnMobile).slice(0, 5).map(item => (
                <button 
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-3xl transition-all duration-300 ${activeTab === item.id ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') : (isDark ? 'text-white/40' : 'text-gray-500')}`}
                >
                  <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                  {activeTab === item.id && <div className="w-1 h-1 rounded-full bg-red-400 absolute -bottom-1" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDark, toggleTheme } = useTheme();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
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
        `}>
          <div className="flex items-center justify-center mb-8">
            <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader" className="h-16 w-auto" />
          </div>
          <nav className="space-y-1 flex-1">
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
          
          {/* Logout Button for Desktop */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold">Logout</span>
            </button>
          </div>
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

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </AuthProvider>
  );
}
