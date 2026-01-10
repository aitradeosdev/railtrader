import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const GlassCard = ({ children, className = "" }) => {
  const { isDark } = useTheme();
  
  if (isDark) {
    return (
      <div className={`
        relative overflow-hidden
        bg-white/10 backdrop-blur-2xl 
        border border-white/20 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]
        rounded-[2rem] md:rounded-[2.5rem]
        transition-all duration-500
        ${className}
      `}>
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-400/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 h-full">{children}</div>
      </div>
    );
  }
  
  return (
    <div className={`
      relative overflow-hidden
      bg-white/80 backdrop-blur-2xl 
      border border-white/60 
      shadow-[0_8px_32px_0_rgba(31,41,55,0.1)]
      rounded-[2rem] md:rounded-[2.5rem]
      transition-all duration-500
      ${className}
    `}>
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-400/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

export const MetricCard = ({ label, value, trend, subValue, color = "blue" }) => {
  const { isDark } = useTheme();
  return (
    <GlassCard className="p-6 md:p-8 flex flex-col justify-between group h-full">
      <div>
        <p className={`${isDark ? 'text-white/50' : 'text-gray-600'} text-xs md:text-sm font-medium mb-1`}>{label}</p>
        <h3 className={`text-2xl md:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{value}</h3>
        <div className={`flex items-center gap-1 text-[10px] md:text-sm ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div className={`mt-4 md:mt-6 pt-4 md:pt-6 ${isDark ? 'border-white/10' : 'border-gray-200'} border-t flex justify-between items-center`}>
        <span className={`${isDark ? 'text-white/40' : 'text-gray-500'} text-[10px] uppercase tracking-widest`}>{subValue}</span>
        <div className={`w-2 h-2 rounded-full bg-${color}-400 animate-pulse`} />
      </div>
    </GlassCard>
  );
};
