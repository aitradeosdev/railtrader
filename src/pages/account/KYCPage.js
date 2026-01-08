import { useState } from 'react';
import { ArrowLeft, Upload, Check, User, FileText, MapPin, Eye } from 'lucide-react';
import { GlassCard } from '../../components/UIComponents';
import Footer from '../../components/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const KYCPage = ({ onBack }) => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    { id: 1, title: 'Personal Information', icon: User, description: 'Basic personal details' },
    { id: 2, title: 'Identity Verification', icon: FileText, description: 'Government issued ID' },
    { id: 3, title: 'Address Verification', icon: MapPin, description: 'Proof of residence' },
    { id: 4, title: 'Review & Submit', icon: Eye, description: 'Final verification' }
  ];

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getStepStatus = (stepId) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>First Name</label>
                <input type="text" className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Last Name</label>
                <input type="text" className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Date of Birth</label>
                <input type="date" className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'} mb-2`}>Nationality</label>
                <select className={`w-full p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <option>Select Country</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Upload Government ID</h3>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Please upload a clear photo of your government-issued ID</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-8 border-2 border-dashed ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'} rounded-2xl text-center cursor-pointer hover:border-blue-400 transition-colors`}>
                <Upload className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={48} />
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Front Side</p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Click to upload or drag and drop</p>
              </div>
              <div className={`p-8 border-2 border-dashed ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'} rounded-2xl text-center cursor-pointer hover:border-blue-400 transition-colors`}>
                <Upload className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={48} />
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Back Side</p>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Click to upload or drag and drop</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Proof of Address</h3>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Upload a recent utility bill or bank statement (not older than 3 months)</p>
            </div>
            <div className={`p-12 border-2 border-dashed ${isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'} rounded-2xl text-center cursor-pointer hover:border-blue-400 transition-colors`}>
              <Upload className={`mx-auto mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} size={64} />
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 text-lg`}>Upload Document</p>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'} mb-4`}>Accepted formats: PDF, JPG, PNG (Max 10MB)</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium">Choose File</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Review Your Information</h3>
              <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Please review all information before submitting</p>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Personal Information</h4>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>✓ All required fields completed</p>
              </div>
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Identity Documents</h4>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>✓ Government ID uploaded</p>
              </div>
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Address Verification</h4>
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>✓ Proof of address uploaded</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
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
          <p className={`${isDark ? 'text-white/60' : 'text-gray-600'} text-sm`}>Complete your identity verification</p>
        </div>
      </div>

      {/* Progress Steps */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  getStepStatus(step.id) === 'completed' 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : getStepStatus(step.id) === 'active'
                    ? 'bg-blue-500 border-blue-500'
                    : (isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-100')
                }`}>
                  {getStepStatus(step.id) === 'completed' ? (
                    <Check className="text-white" size={20} />
                  ) : (
                    <step.icon className={getStepStatus(step.id) === 'active' ? 'text-white' : (isDark ? 'text-white/40' : 'text-gray-400')} size={20} />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</p>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${completedSteps.includes(step.id) ? 'bg-emerald-500' : (isDark ? 'bg-white/10' : 'bg-gray-200')}`} />
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Step Content */}
      <GlassCard className="p-8">
        <div className="mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Step {currentStep}: {steps[currentStep - 1].title}
          </h2>
        </div>
        
        {renderStepContent()}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-medium ${
              currentStep === 1 
                ? (isDark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-400')
                : (isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900')
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleStepComplete}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {currentStep === 4 ? 'Submit for Review' : 'Continue'}
          </button>
        </div>
      </GlassCard>

      <Footer />
    </div>
  );
};

export default KYCPage;