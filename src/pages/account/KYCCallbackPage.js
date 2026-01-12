import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiUrl } from '../../utils/api';

const KYCCallbackPage = () => {
  const { isDark } = useTheme();
  const { token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processing your verification...');

  const updateKYCStatus = useCallback(async (diditStatus) => {
    try {
      // Map Didit status to our KYC status
      let kycStatus = 'in_progress'; // Default to in_progress for review states
      if (diditStatus === 'Approved' || diditStatus === 'success') {
        kycStatus = 'verified';
      } else if (diditStatus === 'Declined' || diditStatus === 'failed') {
        kycStatus = 'rejected';
      } else if (diditStatus === 'Submitted' || diditStatus === 'pending_review' || diditStatus === 'review') {
        kycStatus = 'in_progress'; // Handle review status as in_progress
      }
      
      // Update user KYC status directly
      const response = await fetch(`${apiUrl()}/api/user/kyc/update-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: kycStatus })
      });
      
      if (response.ok) {
        refreshUser(); // Refresh user data
        return kycStatus;
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
    return 'in_progress';
  }, [token, refreshUser]);

  useEffect(() => {
    const diditStatus = searchParams.get('status');
    const sessionId = searchParams.get('verificationSessionId');
    
    if (diditStatus && sessionId) {
      updateKYCStatus(diditStatus).then((updatedStatus) => {
        if (updatedStatus === 'verified') {
          setStatus('success');
          setMessage('Verification completed successfully!');
          setTimeout(() => navigate('/account'), 3000);
        } else if (updatedStatus === 'rejected') {
          setStatus('failed');
          setMessage('Verification was declined. Please try again.');
          setTimeout(() => navigate('/account/kyc'), 3000);
        } else if (updatedStatus === 'in_progress') {
          setStatus('pending');
          setMessage('Verification submitted for review.');
          setTimeout(() => navigate('/account/kyc'), 3000);
        } else {
          setStatus('pending');
          setMessage('Verification is being processed.');
          setTimeout(() => navigate('/account/kyc'), 3000);
        }
      });
    } else {
      // Fallback to checking status
      setTimeout(() => navigate('/account/kyc'), 2000);
    }
  }, [searchParams, navigate, updateKYCStatus]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={64} />;
      case 'failed':
        return <XCircle className="text-red-500" size={64} />;
      default:
        return <Loader2 className="text-blue-500 animate-spin" size={64} />;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="p-8 text-center max-w-md w-full">
        <div className="mb-6">
          {getIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          KYC Verification
        </h1>
        
        <p className={`text-lg mb-6 ${getColor()}`}>
          {message}
        </p>
        
        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
          You will be redirected automatically...
        </p>
        
        <button
          onClick={() => navigate('/account')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Return to Account
        </button>
      </GlassCard>
    </div>
  );
};

export default KYCCallbackPage;