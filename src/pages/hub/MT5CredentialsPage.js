import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Eye, EyeOff, ExternalLink, Download } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const MT5CredentialsPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [showPassword, setShowPassword] = useState({});
  const [mt5Data, setMt5Data] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMT5Credentials();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMT5Credentials = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/user/mt5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('MT5 Data received:', data); // Debug log
      setMt5Data(data);
    } catch (error) {
      console.error('Error fetching MT5 credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (text) navigator.clipboard.writeText(text);
  };

  const togglePassword = (index) => {
    setShowPassword(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>MT5 Credentials</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Your trading account details</p>
        </div>
      </div>

      <GlassCard className="p-6">
        {console.log('Checking condition:', {
          hasLiveAccounts: mt5Data?.liveAccounts && mt5Data.liveAccounts.length > 0,
          hasMt5Login: !!mt5Data?.mt5Login,
          mt5Data
        })}
        {(!mt5Data?.liveAccounts || mt5Data?.liveAccounts?.length === 0) && !mt5Data?.mt5Login ? (
          <div className="text-center py-12">
            <ExternalLink className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No MT5 Account Assigned</h3>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>Your MT5 account will be assigned after admin review of your challenge purchase.</p>
            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Check your challenge status in the Challenges section for updates.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <ExternalLink className="text-blue-400" size={24} />
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Trading Accounts</h2>
            </div>
            
            {mt5Data?.liveAccounts ? (
              <div className="space-y-6">
                {mt5Data.liveAccounts.map((account, index) => (
                  <div key={index} className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} border-l-4 border-emerald-500`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {account.accountSize} {account.challengeType.toUpperCase()} - LIVE ACCOUNT
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Funded Account</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">LIVE</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Server</p>
                          <button onClick={() => copyToClipboard(account.mt5Server)} className="p-1 hover:bg-white/10 rounded">
                            <Copy size={14} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                          </button>
                        </div>
                        <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{account.mt5Server}</span>
                      </div>

                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Login</p>
                          <button onClick={() => copyToClipboard(account.mt5Login)} className="p-1 hover:bg-white/10 rounded">
                            <Copy size={14} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                          </button>
                        </div>
                        <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{account.mt5Login}</span>
                      </div>

                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Password</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => togglePassword(index)} className="p-1 hover:bg-white/10 rounded">
                              {showPassword[index] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => copyToClipboard(account.mt5Password)} className="p-1 hover:bg-white/10 rounded">
                              <Copy size={14} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                            </button>
                          </div>
                        </div>
                        <span className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {showPassword[index] ? account.mt5Password : '••••••••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Server</p>
                    <button onClick={() => copyToClipboard(mt5Data.mt5Server)} className="p-1 hover:bg-white/10 rounded">
                      <Copy size={14} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                    </button>
                  </div>
                  <span className={`font-mono text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{mt5Data.mt5Server}</span>
                </div>

                <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Login</p>
                    <button onClick={() => copyToClipboard(mt5Data.mt5Login)} className="p-1 hover:bg-white/10 rounded">
                      <Copy size={14} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                    </button>
                  </div>
                  <span className={`font-mono text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{mt5Data.mt5Login}</span>
                </div>

                <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Password</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePassword(0)} className="p-1 hover:bg-white/10 rounded">
                        {showPassword[0] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => copyToClipboard(mt5Data.mt5Password)} className="p-1 hover:bg-white/10 rounded">
                        <Copy size={14} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                      </button>
                    </div>
                  </div>
                  <span className={`font-mono text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {showPassword[0] ? mt5Data.mt5Password : '••••••••••'}
                  </span>
                </div>
              </div>
            )}

            <div className={`mt-6 p-4 rounded-2xl ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-3`}>
                Use these credentials to login to your MT5 trading platform. Keep them secure and do not share with anyone.
              </p>
              <a href="https://www.metatrader5.com/en/download" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
                <Download size={16} />
                Download MT5 Platform
              </a>
            </div>
          </>
        )}
      </GlassCard>

      <Footer />
    </div>
  );
};

export default MT5CredentialsPage;