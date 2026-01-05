import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';

const ChallengesListPage = ({ onSelectChallenge }) => {
  const { isDark } = useTheme();
  const [selectedPhase, setSelectedPhase] = useState(1);
  
  const challenges = [
    { 
      id: 1, 
      name: "$10k Starter", 
      amount: 10000, 
      tier: 1,
      phases: {
        1: { price: 99, profitSplit: 80, maxDrawdown: 25, profitTarget: 20 },
        2: { price: 149, profitSplit: 85, maxDrawdown: 20, profitTarget: 15 }
      }
    },
    { 
      id: 2, 
      name: "$100k Pro", 
      amount: 100000, 
      tier: 2,
      phases: {
        1: { price: 499, profitSplit: 80, maxDrawdown: 25, profitTarget: 20 },
        2: { price: 699, profitSplit: 85, maxDrawdown: 20, profitTarget: 15 }
      }
    },
    { 
      id: 3, 
      name: "$250k Elite", 
      amount: 250000, 
      tier: 3,
      phases: {
        1: { price: 999, profitSplit: 80, maxDrawdown: 25, profitTarget: 20 },
        2: { price: 1299, profitSplit: 85, maxDrawdown: 20, profitTarget: 15 }
      }
    }
  ];

  const getCurrentPhaseData = (challenge) => {
    return challenge.phases[selectedPhase];
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="text-left md:text-center max-w-2xl mx-auto">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter mb-2`}>Alpha Challenges</h1>
        <p className={`${isDark ? 'text-white/50' : 'text-gray-500'} text-sm md:text-lg mb-8`}>Scale your capital with high-performance accounts.</p>
        
        {/* Phase Selection */}
        <div className="flex justify-center mb-8">
          <div className={`flex rounded-2xl p-1 ${isDark ? 'bg-white/10 backdrop-blur-xl border border-white/20' : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'}`}>
            <button
              onClick={() => setSelectedPhase(1)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedPhase === 1
                  ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white shadow-lg'
                  : isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1-Phase Challenge
            </button>
            <button
              onClick={() => setSelectedPhase(2)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                selectedPhase === 2
                  ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white shadow-lg'
                  : isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              2-Phase Challenge
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {challenges.map((challenge, i) => {
          const phaseData = getCurrentPhaseData(challenge);
          return (
            <GlassCard key={challenge.id} className={`p-6 md:p-8 flex flex-col border-2 ${i === 1 ? 'border-blue-500/50' : (isDark ? 'border-white/10' : 'border-gray-200')}`}>
              <h3 className={`${isDark ? 'text-white/50' : 'text-gray-500'} text-xs font-bold uppercase mb-2`}>Tier {challenge.tier}</h3>
              <div className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{challenge.name.split(' ')[0]}</div>
              <div className={`space-y-3 mb-8 text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                <div className="flex justify-between"><span>Account Size</span><span>${challenge.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Profit Target</span><span>{phaseData.profitTarget}%</span></div>
                <div className="flex justify-between"><span>Max Drawdown</span><span>{phaseData.maxDrawdown}%</span></div>
                <div className="flex justify-between"><span>Profit Split</span><span>{phaseData.profitSplit}%</span></div>
                <div className="flex justify-between"><span>Phases</span><span>{selectedPhase}</span></div>
                <div className="flex justify-between font-bold"><span>Price</span><span>${phaseData.price}</span></div>
              </div>
              <button 
                onClick={() => onSelectChallenge(challenge)}
                className={`w-full py-4 rounded-2xl font-bold transition-all ${i === 1 ? 'bg-blue-600 text-white' : (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900')}`}
              >
                Select Plan
              </button>
            </GlassCard>
          );
        })}
      </div>
      <Footer />
    </div>
  );
};

export default ChallengesListPage;