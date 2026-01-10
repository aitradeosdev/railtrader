import { ArrowLeft, Download, FileText, Calendar, Award } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const DocumentsPage = ({ onBack }) => {
  const { isDark } = useTheme();

  const documents = [
    { id: 1, name: 'Elite Challenge Completion Certificate', type: 'PDF', size: '1.2 MB', date: '2024-12-01', category: 'challenge' },
    { id: 2, name: 'Pro Challenge Completion Certificate', type: 'PDF', size: '1.1 MB', date: '2024-11-15', category: 'challenge' },
    { id: 3, name: 'First Payout Achievement Certificate', type: 'PDF', size: '1.0 MB', date: '2024-10-20', category: 'payout' },
    { id: 4, name: '$10K Milestone Payout Certificate', type: 'PDF', size: '1.1 MB', date: '2024-09-30', category: 'payout' },
    { id: 5, name: 'Trading Statement - December 2024', type: 'PDF', size: '2.4 MB', date: '2024-12-01', category: 'statement' },
    { id: 6, name: 'Account Summary - November 2024', type: 'PDF', size: '1.8 MB', date: '2024-11-01', category: 'statement' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>Certificates</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Trading certificates and achievements</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Available Certificates</h2>
        </div>
        
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-100'} ${doc.category === 'challenge' ? 'bg-blue-500/20' : doc.category === 'payout' ? 'bg-emerald-500/20' : ''}`}>
                  {doc.category === 'challenge' || doc.category === 'payout' ? (
                    <Award className={doc.category === 'challenge' ? 'text-blue-400' : 'text-emerald-400'} size={20} />
                  ) : (
                    <FileText className={isDark ? 'text-white/60' : 'text-gray-600'} size={20} />
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{doc.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{doc.type} • {doc.size}</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className={isDark ? 'text-white/40' : 'text-gray-400'} />
                      <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{doc.date}</span>
                    </div>
                    {(doc.category === 'challenge' || doc.category === 'payout') && (
                      <span className={`px-2 py-1 text-xs rounded ${doc.category === 'challenge' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        Certificate
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} rounded-xl font-medium text-sm hover:bg-blue-600 hover:text-white transition-colors`}>
                <Download size={16} />
                Download
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default DocumentsPage;
