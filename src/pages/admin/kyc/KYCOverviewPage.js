import { useState, useEffect, useCallback } from 'react';
import { Shield, CheckCircle, Clock, XCircle, Users, RefreshCw } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { apiUrl } from '../../../utils/api';

const KYCOverviewPage = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const { token } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchKYCStats = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/admin/kyc/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching KYC stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKYCStats();
  }, [fetchKYCStats]);

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${apiUrl()}/api/admin/kyc/refresh-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        // Show better formatted message
        const message = `KYC Refresh Complete\n\nProcessed: ${result.processed} users\nStatus Changes: ${result.updated}\nErrors: ${result.errors}`;
        alert(message);
        fetchKYCStats(); // Refresh stats after bulk update
      } else {
        alert('Failed to refresh KYC statuses');
      }
    } catch (error) {
      console.error('Error refreshing all KYC:', error);
      alert('Failed to refresh KYC statuses');
    } finally {
      setRefreshing(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'blue',
      onClick: null
    },
    {
      title: 'Verified',
      value: stats.verified,
      icon: CheckCircle,
      color: 'green',
      onClick: () => onNavigate('verified')
    },
    {
      title: 'In Review',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      onClick: () => onNavigate('pending')
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'red',
      onClick: () => onNavigate('rejected')
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      green: 'bg-green-500/10 border-green-500/20 text-green-400',
      yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      red: 'bg-red-500/10 border-red-500/20 text-red-400'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Shield className={isDark ? 'text-white' : 'text-gray-900'} size={32} />
        <div className="flex-1">
          <h1 className={`text-2xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}>
            KYC Management
          </h1>
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>
            Monitor and manage user verification status
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={refreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
          {refreshing ? 'Refreshing...' : 'Refresh All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = getColorClasses(card.color);
          
          return (
            <div
              key={card.title}
              onClick={card.onClick}
              className={`p-6 rounded-2xl border ${colorClasses} ${
                card.onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={24} />
                <span className="text-2xl font-bold">{card.value}</span>
              </div>
              <h3 className="font-semibold">{card.title}</h3>
            </div>
          );
        })}
      </div>

      <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('pending')}
            className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
          >
            <Clock className="mb-2" size={20} />
            <p className="font-medium">Review Pending</p>
            <p className="text-sm opacity-60">{stats.pending} users waiting</p>
          </button>
          
          <button
            onClick={() => onNavigate('verified')}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors"
          >
            <CheckCircle className="mb-2" size={20} />
            <p className="font-medium">View Verified</p>
            <p className="text-sm opacity-60">{stats.verified} verified users</p>
          </button>
          
          <button
            onClick={() => onNavigate('rejected')}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <XCircle className="mb-2" size={20} />
            <p className="font-medium">Review Rejected</p>
            <p className="text-sm opacity-60">{stats.rejected} rejected users</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCOverviewPage;