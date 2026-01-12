import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, XCircle, User, Calendar, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiUrl } from '../../../utils/api';

const KYCRejectedPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRejectedUsers = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/kyc/rejected`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching rejected users:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRejectedUsers();
  }, [fetchRejectedUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <XCircle className="text-red-400" size={32} />
          <div>
            <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>
              Rejected Verifications
            </h1>
            <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>
              {users.length} users with rejected KYC
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            <XCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>No rejected verifications</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                    <User className="text-red-400" size={20} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      {user.email}
                    </p>
                    {user.dateOfBirth && (
                      <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        DOB: {new Date(user.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-red-400 mb-1">
                    <XCircle size={16} />
                    <span className="text-sm font-medium">Rejected</span>
                  </div>
                  {user.kycData?.startedAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>Started {new Date(user.kycData.startedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {user.kycData?.rejectionReason && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-400 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-red-400 mb-1">Rejection Reason:</p>
                      <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        {user.kycData.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KYCRejectedPage;