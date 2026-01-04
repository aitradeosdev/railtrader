import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();
  return (
    <footer className={`mt-12 pt-8 ${isDark ? 'border-white/10' : 'border-gray-200'} border-t text-center ${isDark ? 'text-white/40' : 'text-gray-500'} text-xs`}>
      <p>&copy; {new Date().getFullYear()} RailTrader. All rights reserved.</p>
    </footer>
  );
};

export default Footer;