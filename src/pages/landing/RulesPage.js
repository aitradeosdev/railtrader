import { Shield, Clock, ArrowLeft, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { apiUrl } from '../../utils/api';

const RulesPage = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const [openRule, setOpenRule] = useState(null);
  const [challengeData, setChallengeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallengeData();
  }, []);

  const fetchChallengeData = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/challenge-plans`);
      
      if (response.ok) {
        const data = await response.json();
        setChallengeData(data);
      }
    } catch (error) {
      console.error('Error fetching challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get challenge details from API data
  const twoPhaseChallenge = challengeData.find(c => c.phases && Object.keys(c.phases).length === 2);
  const onePhaseChallenge = challengeData.find(c => c.phases && Object.keys(c.phases).length === 1);
  
  const twoPhaseProfit = twoPhaseChallenge?.phases['2']?.profitSplit;
  const onePhaseProfit = onePhaseChallenge?.phases['1']?.profitSplit;
  const twoPhaseDrawdown = twoPhaseChallenge?.maxDrawdown;
  const onePhaseDrawdown = onePhaseChallenge?.maxDrawdown;
  const twoPhaseTarget = twoPhaseChallenge?.phases['1']?.profitTarget;
  const onePhaseTarget = onePhaseChallenge?.phases['1']?.profitTarget;

  const rules = [
    {
      icon: Clock,
      title: 'No Scalping Rule',
      desc: 'Trades must remain open for at least 4 minutes',
      details: 'All trades must be held for a minimum of 4 minutes (240 seconds) before closing. Any trade closed before this time, even at 3 minutes and 59 seconds, will be considered a breach of our trading rules. This rule ensures proper risk management and prevents high-frequency scalping strategies that can destabilize account performance. Multiple violations may result in account termination.'
    },
    {
      icon: Shield,
      title: 'Trading Activity Rule',
      desc: 'Open at least 1 trade within 7 days to keep account active',
      details: 'You must execute at least one trade within 7 calendar days of receiving your funded account to maintain active status. Failure to meet this requirement will result in immediate account closure without refund. This rule ensures active participation and prevents dormant accounts. The 7-day period starts from the moment you receive your funded account credentials, not from the evaluation completion date.'
    },
    {
      icon: Shield,
      title: 'Maximum Drawdown and Target',
      desc: 'Choose your challenge structure - different rewards, different limits',
      details: twoPhaseProfit && onePhaseProfit && twoPhaseDrawdown && onePhaseDrawdown && twoPhaseTarget && onePhaseTarget ? 
        `Pick your path to funding: Go with our 2-Phase Challenge for higher rewards (${twoPhaseProfit}% profit split) but tighter limits (${twoPhaseDrawdown}% max drawdown, ${twoPhaseTarget}% target), or choose the 1-Phase Challenge for more breathing room (${onePhaseDrawdown}% max drawdown, ${onePhaseTarget}% target) with ${onePhaseProfit}% profit split. Your choice determines your journey to getting funded - both lead to the same destination: a funded trading account.` :
        'Loading challenge details...'
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'} font-sans overflow-hidden selection:bg-blue-500/30`}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'} font-sans overflow-hidden selection:bg-blue-500/30`}>
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[60%] ${isDark ? 'bg-blue-600/10' : 'bg-blue-600/5'} blur-[150px] rounded-full animate-pulse`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${isDark ? 'bg-purple-600/5' : 'bg-purple-600/3'} blur-[150px] rounded-full`} />
      </div>

      <div className="relative z-10 px-6 md:px-10 py-20">
        <button onClick={() => onNavigate('home')} className={`mb-8 flex items-center gap-2 ${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors font-medium`}>
          <ArrowLeft size={20} />
          Back to Home
        </button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8 text-center tracking-tighter`}>Trading Rules</h1>
          
          <div className="space-y-4">
            {rules.map((rule, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button
                  onClick={() => setOpenRule(openRule === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-600">
                      <rule.icon className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>{rule.title}</h3>
                      <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>{rule.desc}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`${isDark ? 'text-white/60' : 'text-gray-600'} transition-transform duration-200 ${
                      openRule === i ? 'rotate-180' : ''
                    }`} 
                    size={20} 
                  />
                </button>
                {openRule === i && (
                  <div className="px-6 pb-6 pt-0">
                    <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} leading-relaxed`}>
                      {rule.details}
                    </p>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
          
          <div className="mt-12">
            <GlassCard className="p-8 text-center">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 tracking-tight`}>
                Ready to Trade?
              </h2>
              <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} leading-relaxed`}>
                That's it. No complex rules, no hidden requirements. Focus on what matters: your trading strategy and growing your account. Everything else is designed to give you maximum freedom to trade your way.
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RulesPage;