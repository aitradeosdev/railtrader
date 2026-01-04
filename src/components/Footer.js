import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200/50'} backdrop-blur-xl border-t mt-20`}>
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={isDark ? "/white-logo.png" : "/dark-logo.png"} alt="RailTrader" className="h-8" />
            <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              © 2026 RailTrader. All rights reserved.
            </span>
          </div>
          <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'} text-center md:text-right`}>
            Trading involves risk. Past performance does not guarantee future results.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;