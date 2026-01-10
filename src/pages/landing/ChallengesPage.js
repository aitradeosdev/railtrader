import { Star, Zap, Crown, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useState } from 'react';
import ChallengeConfigPage from '../challenges/ChallengeConfigPage';

const ChallengesPage = ({ onGetStarted, onNavigate, onAuthRequest }) => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState('list');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(1);

  const challenges = [
    { 
      id: 1, 
      name: "$10k Starter", 
      amount: 10000, 
      tier: 1, 
      icon: Star,
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
      icon: Zap, 
      popular: true,
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
      icon: Crown,
      phases: {
        1: { price: 999, profitSplit: 80, maxDrawdown: 25, profitTarget: 20 },
        2: { price: 1299, profitSplit: 85, maxDrawdown: 20, profitTarget: 15 }
      }
    }
  ];

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setCurrentStep('config');
  };

  const handleConfigContinue = (config) => {
    // Redirect to signup after configuration instead of going to payment
    onAuthRequest('register');
  };

  const handleBack = () => {
    if (currentStep === 'config') {
      setCurrentStep('list');
    } else {
      onNavigate('home');
    }
  };

  const getCurrentPhaseData = (challenge) => {
    return challenge.phases[selectedPhase];
  };

  if (currentStep === 'config' && selectedChallenge) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'} font-sans overflow-hidden selection:bg-blue-500/30`}>
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[60%] ${isDark ? 'bg-blue-600/10' : 'bg-blue-600/5'} blur-[150px] rounded-full animate-pulse`} />
          <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${isDark ? 'bg-purple-600/5' : 'bg-purple-600/3'} blur-[150px] rounded-full`} />
        </div>
        <div className="relative z-10 px-6 md:px-10">
          <ChallengeConfigPage 
            challenge={selectedChallenge} 
            onBack={handleBack} 
            onContinue={handleConfigContinue} 
          />
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
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
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
                <GlassCard key={challenge.id} className={`p-6 md:p-8 flex flex-col border-2 ${challenge.popular ? 'border-blue-500/50 scale-105' : (isDark ? 'border-white/10' : 'border-gray-200')} hover:scale-105 transition-all duration-300`}>
                  {challenge.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full">
                      Most Popular
                    </div>
                  )}
                  
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
                    onClick={() => handleSelectChallenge(challenge)}
                    className={`w-full py-4 rounded-2xl font-bold transition-all duration-200 ${
                      challenge.popular 
                        ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-xl text-white hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/30 border border-white/20' 
                        : isDark 
                          ? 'bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:scale-105 active:scale-95 shadow-lg' 
                          : 'bg-white/80 backdrop-blur-xl text-gray-900 border border-gray-200/50 hover:scale-105 active:scale-95 shadow-lg'
                    }`}
                  >
                    Select Plan
                  </button>
                </GlassCard>
              );
            })}}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ChallengesPage;
