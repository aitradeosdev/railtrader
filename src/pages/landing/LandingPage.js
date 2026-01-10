import { ArrowRight, TrendingUp, Shield, Zap, Users, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useState } from 'react';

const LandingPage = ({ onGetStarted, onNavigate }) => {
  const { isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFeature, setOpenFeature] = useState(null);

  const features = [
    { 
      icon: TrendingUp, 
      title: 'Funded Accounts', 
      desc: 'Get up to $200K in trading capital',
      details: 'Start with our evaluation challenge and unlock trading capital up to $200,000. No personal risk - trade with our money and keep the majority of profits you generate.'
    },
    { 
      icon: Shield, 
      title: 'Profit Sharing', 
      desc: 'Keep up to 90% of your profits',
      details: 'Our generous profit splits start at 80% and can reach up to 90% based on your performance. The more you trade successfully, the higher your profit share becomes.'
    },
    { 
      icon: Zap, 
      title: 'Fast Evaluation', 
      desc: 'Pass our challenge and get funded',
      details: 'Complete our straightforward evaluation process with flexible rules and unlimited time. No pressure, no rush - just demonstrate your trading skills at your own pace.'
    },
    { 
      icon: Users, 
      title: 'Trader Support', 
      desc: '24/7 support for funded traders',
      details: 'Get dedicated support from our team of trading professionals. Access educational resources, trading psychology guidance, and technical assistance whenever you need it.'
    }
  ];

  const stats = [
    { value: '5K+', label: 'Funded Traders' },
    { value: '$50M+', label: 'Capital Deployed' },
    { value: '85%', label: 'Payout Rate' },
    { value: '$200K', label: 'Max Funding' }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020202]' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'} font-sans overflow-hidden selection:bg-blue-500/30`}>
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[60%] ${isDark ? 'bg-blue-600/10' : 'bg-blue-600/5'} blur-[150px] rounded-full animate-pulse`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${isDark ? 'bg-purple-600/5' : 'bg-purple-600/3'} blur-[150px] rounded-full`} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 md:px-10 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader" className="h-12" />
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold tracking-widest text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PROP FIRM LIVE
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => onNavigate('features')} className={`${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors font-medium`}>Rules</button>
              <button onClick={() => onNavigate('pricing')} className={`${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors font-medium`}>Challenges</button>
              <button onClick={() => onNavigate('about')} className={`${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors font-medium`}>About</button>
              <button onClick={() => onNavigate('contact')} className={`${isDark ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors font-medium`}>Contact</button>
            </nav>
            
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden relative w-10 h-10 rounded-2xl ${isDark ? 'bg-white/10 backdrop-blur-xl border border-white/20' : 'bg-white/80 backdrop-blur-xl border border-gray-200/50'} hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center`}
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span className={`block h-0.5 w-full ${isDark ? 'bg-white' : 'bg-gray-800'} rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 w-full ${isDark ? 'bg-white' : 'bg-gray-800'} rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-full ${isDark ? 'bg-white' : 'bg-gray-800'} rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <div className={`absolute left-0 top-0 w-3/4 h-full ${isDark ? 'bg-white/10 backdrop-blur-xl border-r border-white/20' : 'bg-white/90 backdrop-blur-xl border-r border-gray-200/50'} shadow-2xl`}>
                <div className="p-6 pt-20">
                  <nav className="space-y-6">
                    <button onClick={() => { onNavigate('features'); setIsMobileMenuOpen(false); }} className={`block w-full text-left text-2xl font-semibold ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors py-3`}>Rules</button>
                    <button onClick={() => { onNavigate('pricing'); setIsMobileMenuOpen(false); }} className={`block w-full text-left text-2xl font-semibold ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors py-3`}>Challenges</button>
                    <button onClick={() => { onNavigate('about'); setIsMobileMenuOpen(false); }} className={`block w-full text-left text-2xl font-semibold ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors py-3`}>About</button>
                    <button onClick={() => { onNavigate('contact'); setIsMobileMenuOpen(false); }} className={`block w-full text-left text-2xl font-semibold ${isDark ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors py-3`}>Contact</button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="px-6 md:px-10 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className={`text-5xl md:text-7xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 tracking-tighter`}>
                  Get <span className="text-blue-500">Funded</span>
                </h1>
                <p className={`text-xl ${isDark ? 'text-white/60' : 'text-gray-600'} mb-8`}>
                  Join RailTrader's proprietary trading firm. Pass our evaluation challenge and trade with up to $200K of our capital while keeping up to 90% of profits.
                </p>
                <button 
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-xl text-white rounded-2xl font-semibold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 shadow-2xl shadow-blue-500/30 border border-white/20"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </button>
              </div>
              <div className="flex justify-center">
                <img src={isDark ? "/quickest-payout.png" : "/quickest-payout-dark.png"} alt="Quickest Payout" className="w-full max-w-md" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 md:px-10 py-16">
          <div className="max-w-6xl mx-auto">
            <GlassCard className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 tracking-tighter`}>{stat.value}</div>
                    <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} font-medium`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 md:px-10 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} text-center mb-16 tracking-tighter`}>
              Why Choose RailTrader Prop Firm?
            </h2>
            <div className="space-y-4">
              {features.map((feature, i) => (
                <GlassCard key={i} className="overflow-hidden">
                  <button
                    onClick={() => setOpenFeature(openFeature === i ? null : i)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <feature.icon className="text-blue-500" size={32} />
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>{feature.title}</h3>
                        <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>{feature.desc}</p>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`${isDark ? 'text-white/60' : 'text-gray-600'} transition-transform duration-200 ${
                        openFeature === i ? 'rotate-180' : ''
                      }`} 
                      size={20} 
                    />
                  </button>
                  {openFeature === i && (
                    <div className="px-6 pb-6 pt-0">
                      <p className={`${isDark ? 'text-white/70' : 'text-gray-700'} leading-relaxed`}>
                        {feature.details}
                      </p>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-10 py-20">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-12 text-center">
              <h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 tracking-tighter`}>
                Ready to Get Funded?
              </h2>
              <p className={`text-xl ${isDark ? 'text-white/60' : 'text-gray-600'} mb-8`}>
                Start your evaluation challenge today and join our funded traders.
              </p>
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-xl text-white rounded-2xl font-semibold hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl shadow-blue-500/30 border border-white/20"
              >
                Start Challenge
              </button>
            </GlassCard>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default LandingPage;