import { Users, Award, Globe, TrendingUp, ArrowLeft, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useState } from 'react';

const AboutPage = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'What makes RailTrader different from other prop firms?',
      answer: 'RailTrader focuses on simplicity and trader success. We have only 2 main rules, offer up to 90% profit splits, and provide same-day payouts. Our evaluation process is straightforward with no hidden requirements or complex conditions.'
    },
    {
      question: 'How long does it take to get funded after passing the evaluation?',
      answer: 'Once you successfully complete your evaluation challenge, you will receive your funded account credentials within 24-48 hours. We prioritize quick onboarding so you can start trading with our capital immediately.'
    },
    {
      question: 'What trading platforms do you support?',
      answer: 'We provide access to MetaTrader 5 (MT5) with all major forex pairs, indices, commodities, and cryptocurrency CFDs. Our platform offers advanced charting tools, expert advisors, and real-time market data from premium providers.'
    },
    {
      question: 'Can I scale my account size after getting funded?',
      answer: 'Yes! Based on your consistent performance and adherence to our rules, we offer account scaling opportunities. Successful traders can progress from $10K accounts up to $250K+ accounts with improved profit sharing percentages.'
    }
  ];

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
              What started as a vision to revolutionize prop trading has grown into a thriving community of over 5,000 funded traders across 150+ countries. We've deployed over $50 million in trading capital and maintain an industry-leading 85% average payout rate.
            </p>
          </GlassCard>

          {/* FAQ Section */}
          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 text-center tracking-tight`}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
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
              { icon: Users, title: '5K+ Funded Traders', desc: 'Active funded traders worldwide generating consistent profits' },
              { icon: Award, title: 'Best Prop Firm 2026', desc: 'Industry recognition for innovation and trader satisfaction' },
              { icon: Globe, title: '150+ Countries', desc: 'Global reach with localized support and payment methods' },
              { icon: TrendingUp, title: '$50M+ Deployed', desc: 'Total capital deployed to successful traders across all account sizes' }
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