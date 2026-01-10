import { Mail, Phone, MapPin, Send, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';

const ContactPage = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
  };

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
          <h1 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8 text-center tracking-tighter`}>Contact Us</h1>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <GlassCard className="p-8">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 tracking-tight`}>Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-600">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                    <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} text-sm`}>support@railtrader.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-600">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Phone</h3>
                    <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} text-sm`}>+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-600">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Address</h3>
                    <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} text-sm`}>123 Trading St, New York, NY 10001</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Support Hours</h3>
                <div className={`space-y-2 ${isDark ? 'text-white/70' : 'text-gray-600'} text-sm`}>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </GlassCard>

            {/* Contact Form */}
            <GlassCard className="p-8">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 tracking-tight`}>Send Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-xl text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/30 border border-white/20"
                >
                  Send Message
                  <Send size={20} />
                </button>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
