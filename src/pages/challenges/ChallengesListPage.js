import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const ChallengesListPage = ({ onSelectChallenge }) => {
  const { isDark } = useTheme();
  
  const challenges = [
    { id: 1, name: "$10k Starter", amount: 10000, tier: 1, profitTarget: 10, maxDrawdown: 5, leverage: "1:100", price: 99 },
    { id: 2, name: "$100k Pro", amount: 100000, tier: 2, profitTarget: 10, maxDrawdown: 5, leverage: "1:100", price: 499 },
    { id: 3, name: "$250k Elite", amount: 250000, tier: 3, profitTarget: 10, maxDrawdown: 5, leverage: "1:100", price: 999 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="text-left md:text-center max-w-2xl mx-auto">
        <h1 className={`text-3xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter mb-2`}>Alpha Challenges</h1>
        <p className={`${isDark ? 'text-white/50' : 'text-gray-500'} text-sm md:text-lg`}>Scale your capital with high-performance accounts.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {challenges.map((challenge, i) => (
          <GlassCard key={challenge.id} className={`p-6 md:p-8 flex flex-col border-2 ${i === 1 ? 'border-blue-500/50' : (isDark ? 'border-white/10' : 'border-gray-200')}`}>
            <h3 className={`${isDark ? 'text-white/50' : 'text-gray-500'} text-xs font-bold uppercase mb-2`}>Tier {challenge.tier}</h3>
            <div className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{challenge.name.split(' ')[0]}</div>
            <div className={`space-y-3 mb-8 text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              <div className="flex justify-between"><span>Profit Target</span><span>{challenge.profitTarget}%</span></div>
              <div className="flex justify-between"><span>Max Drawdown</span><span>{challenge.maxDrawdown}%</span></div>
              <div className="flex justify-between"><span>Leverage</span><span>{challenge.leverage}</span></div>
              <div className="flex justify-between"><span>Price</span><span>${challenge.price}</span></div>
            </div>
            <button 
              onClick={() => onSelectChallenge(challenge)}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${i === 1 ? 'bg-blue-600 text-white' : (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900')}`}
            >
              Select Plan
            </button>
          </GlassCard>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default ChallengesListPage;