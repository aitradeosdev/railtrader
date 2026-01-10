import { useState, useEffect } from 'react';
import { Trophy, User, Search, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../../components/UIComponents';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiUrl } from '../../../utils/api';

const ChallengeManagementPage = ({ onNavigateToChallenge }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification] = useState(null);

  useEffect(() => {
    fetchChallenges();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/challenges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-amber-400';
      case 'mt5_assigned': return 'text-blue-400';
      case 'evaluation': return 'text-purple-400';
      case 'pending_funding': return 'text-orange-400';
      case 'funded': return 'text-emerald-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredChallenges = challenges.filter(challenge => 
    challenge.userId && (
      challenge.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    challenge.accountSize.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-xl border animate-in slide-in-from-top-2 ${
          notification.type === 'success' 
            ? isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : isDark ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Challenge Management</h1>
        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm md:text-lg`}>Manage user challenges and evaluations</p>
      </div>

      <GlassCard className="p-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={20} />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white placeholder-white/40' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} border-none outline-none`}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>All Challenges</h2>
        
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={48} />
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No Challenges Found</h3>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'}`}>No challenges match your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChallenges.map(challenge => (
              <div key={challenge._id} className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors`}
                   onClick={() => onNavigateToChallenge(challenge._id)}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-200'} flex items-center justify-center`}>
                    <User className={isDark ? 'text-white' : 'text-gray-600'} size={20} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {challenge.userId ? `${challenge.userId.firstName} ${challenge.userId.lastName}` : 'Unknown User'}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      {challenge.accountSize} {challenge.challengeType.toUpperCase()} - ${challenge.amount} (Phase {challenge.currentPhase})
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getStatusColor(challenge.status)}`}>
                        {challenge.status.toUpperCase().replace('_', ' ')}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {new Date(challenge.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className={isDark ? 'text-white/40' : 'text-gray-400'} size={20} />
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ChallengeManagementPage;