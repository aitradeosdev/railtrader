import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const KYCVerificationPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchKYCStatus = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/user/kyc/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setKycStatus(data);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchKYCStatus();
  }, [fetchKYCStatus]);

  const initiateKYC = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl()}/api/user/kyc/initiate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        window.open(data.verificationUrl, '_blank');
        fetchKYCStatus();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error initiating KYC:', error);
      alert('Failed to start verification process');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={24} />;
      case 'in_progress':
        return <Clock className="text-yellow-500" size={24} />;
      default:
        return <AlertCircle className={isDark ? 'text-white/60' : 'text-gray-600'} size={24} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      case 'in_progress':
        return 'text-yellow-500';
      default:
        return isDark ? 'text-white/60' : 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>KYC Verification</h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Verify your identity to access all features</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Shield className={isDark ? 'text-white/60' : 'text-gray-600'} size={32} />
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Identity Verification</h2>
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Secure and compliant verification process</p>
          </div>
        </div>

        {kycStatus && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} mb-6`}>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(kycStatus.status)}
              <span className={`font-semibold ${getStatusColor(kycStatus.status)}`}>
                {getStatusText(kycStatus.status)}
              </span>
            </div>
            
            {kycStatus.status === 'verified' && kycStatus.verifiedAt && (
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Verified on {new Date(kycStatus.verifiedAt).toLocaleDateString()}
              </p>
            )}
            
            {kycStatus.status === 'rejected' && kycStatus.rejectionReason && (
              <p className="text-sm text-red-400 mt-2">
                Reason: {kycStatus.rejectionReason}
              </p>
            )}
            
            {kycStatus.status === 'in_progress' && (
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Your verification is being processed. This may take a few minutes.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>What you'll need:</h3>
          <ul className={`space-y-2 text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            <li>• Government-issued ID (passport, driver's license, or national ID)</li>
            <li>• Clear, well-lit photos of your documents</li>
            <li>• A few minutes to complete the process</li>
          </ul>
        </div>

        {(!kycStatus || kycStatus.status === 'pending' || kycStatus.status === 'rejected') && (
          <button
            onClick={initiateKYC}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
              loading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Starting Verification...' : 'Start Verification'}
          </button>
        )}

        {kycStatus?.status === 'in_progress' && (
          <button
            onClick={fetchKYCStatus}
            className="w-full py-3 px-6 rounded-xl font-medium bg-gray-600 text-white hover:bg-gray-700 transition-all"
          >
            Refresh Status
          </button>
        )}

        {kycStatus?.status === 'verified' && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-center font-medium">
              ✓ Your identity has been successfully verified
            </p>
          </div>
        )}
      </GlassCard>

      <Footer />
    </div>
  );
};

export default KYCVerificationPage;