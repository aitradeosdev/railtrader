import { Users, Award, Globe, TrendingUp, ArrowLeft, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { apiUrl } from '../../utils/api';

const AboutPage = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);
  const [maxProfitSplit, setMaxProfitSplit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallengeData();
  }, []);

  const fetchChallengeData = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/challenge-plans`);
      
      if (response.ok) {
        const challengeData = await response.json();
        
        if (challengeData.length > 0) {
          const maxSplit = Math.max(...challengeData.map(c => c.phases['2']?.profitSplit || 0));
          setMaxProfitSplit(maxSplit);
        }
      }
    } catch (error) {
      console.error('Error fetching challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update FAQ when maxProfitSplit changes
  const updatedFaqs = [
    {
      question: 'What makes RailTrader different from other prop firms?',
      answer: maxProfitSplit ? `RailTrader focuses on simplicity and trader success. We have only 2 main rules, offer up to ${maxProfitSplit}% profit splits, and provide same-day payouts. Our evaluation process is straightforward with no hidden requirements or complex conditions.` : 'Loading...'
    },
    {
      question: 'How long does it take to get funded after passing the evaluation?',
      answer: 'Once you successfully complete your evaluation challenge, you will receive your funded account credentials within 24-48 hours. We prioritize quick onboarding so you can start trading with our capital immediately.'
    },
    {
      question: 'What trading platforms do you support?',
      answer: 'We provide access to MetaTrader 5 (MT5) with all major forex pairs, indices, commodities, and cryptocurrency CFDs. Our platform offers advanced charting tools, expert advisors, and real-time market data from premium providers.'
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
          <h1 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8 text-center tracking-tighter`}>About RailTrader</h1>
          
          <GlassCard className="p-8 mb-8">
            <p className={`text-xl ${isDark ? 'text-white/80' : 'text-gray-700'} leading-relaxed mb-6`}>
              Founded in 2026, RailTrader represents the next generation of proprietary trading firms. We've built our reputation on transparency, trader success, and cutting-edge technology that empowers skilled traders to reach their full potential.
            </p>
            <p className={`text-lg ${isDark ? 'text-white/70' : 'text-gray-600'} leading-relaxed mb-6`}>
              Our mission is simple: provide talented traders with the capital they need while maintaining the industry's most trader-friendly terms. We believe in keeping rules minimal, payouts fast, and profit splits generous.
            </p>
            <p className={`text-lg ${isDark ? 'text-white/70' : 'text-gray-600'} leading-relaxed`}>
              What started as a vision to revolutionize prop trading has grown into a thriving community of traders in Nigeria. We maintain an industry-leading 80% profit split rate for our funded traders.
            </p>
          </GlassCard>

          {/* FAQ Section */}
          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 text-center tracking-tight`}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              {updatedFaqs.map((faq, i) => (
                <GlassCard key={i} className="overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight pr-4`}>{faq.question}</h3>
                    <ChevronDown 
                      className={`${isDark ? 'text-white/60' : 'text-gray-600'} transition-transform duration-200 flex-shrink-0 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`} 
                      size={20} 
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 pt-0">
                      <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} leading-relaxed`}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Users, title: 'Growing Community', desc: 'Active funded traders generating consistent profits' },
              { icon: Award, title: 'Trader Focused', desc: 'Built for trader success with industry-leading terms' },
              { icon: Globe, title: 'Nigeria Focused', desc: 'Specialized support for Nigerian traders with local payment methods' },
              { icon: TrendingUp, title: 'Capital Deployment', desc: 'Providing trading capital to successful traders across all account sizes' }
            ].map((item, i) => (
              <GlassCard key={i} className="p-6">
                <item.icon className="text-blue-500 mb-4" size={32} />
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 tracking-tight`}>{item.title}</h3>
                <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm leading-relaxed`}>{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;