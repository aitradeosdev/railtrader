import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SuccessNotification = ({ message, show, onClose, duration = 3000 }) => {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
        isDark 
          ? 'bg-green-900/20 border-green-500/30 text-green-400' 
          : 'bg-green-50 border-green-200 text-green-800'
      } backdrop-blur-sm`}>
        <CheckCircle size={20} />
        <span className="font-medium">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`ml-2 ${isDark ? 'text-green-400/60 hover:text-green-400' : 'text-green-600/60 hover:text-green-600'}`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SuccessNotification;