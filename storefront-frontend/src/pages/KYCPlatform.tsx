import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KYCPlatform = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    idPhoto: null as File | null
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Notify parent window and close
    if (window.opener) {
      window.opener.postMessage({ type: 'KYC_COMPLETE' }, '*');
    }
    window.close();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, idPhoto: e.target.files![0] }));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ 
      fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 animate-gentle-wave"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-purple-200/25 via-pink-200/25 to-blue-200/25 rounded-full mix-blend-normal filter blur-3xl animate-gentle-breathe"></div>
        <div className="absolute -top-10 -right-20 w-80 h-80 bg-gradient-to-br from-blue-200/30 via-cyan-200/30 to-purple-200/30 rounded-full mix-blend-normal filter blur-3xl animate-gentle-float animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-200/35 via-purple-200/35 to-blue-200/35 rounded-full mix-blend-normal filter blur-3xl animate-gentle-breathe animation-delay-4000"></div>
        <div className="absolute bottom-10 -right-10 w-64 h-64 bg-gradient-to-br from-cyan-200/25 via-blue-200/25 to-indigo-200/25 rounded-full mix-blend-normal filter blur-3xl animate-gentle-float animation-delay-6000"></div>
      </div>
      
      {/* Custom CSS for gentle animations */}
      <style>{`
        @keyframes gentle-breathe {
          0%, 100% { 
            transform: scale(1) translateY(0px);
            opacity: 0.7;
          }
          50% { 
            transform: scale(1.02) translateY(-2px);
            opacity: 0.9;
          }
        }
        
        @keyframes gentle-float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
          }
          33% { 
            transform: translateY(-3px) translateX(1px) scale(1.01);
          }
          66% { 
            transform: translateY(1px) translateX(-1px) scale(0.99);
          }
        }
        
        @keyframes gentle-wave {
          0%, 100% { 
            background-position: 0% 50%;
            transform: translateY(0px);
          }
          25% { 
            background-position: 25% 60%;
            transform: translateY(-1px);
          }
          50% { 
            background-position: 50% 40%;
            transform: translateY(1px);
          }
          75% { 
            background-position: 75% 55%;
            transform: translateY(-0.5px);
          }
        }
        
        .animate-gentle-breathe {
          animation: gentle-breathe 8s ease-in-out infinite;
        }
        
        .animate-gentle-float {
          animation: gentle-float 12s ease-in-out infinite;
        }
        
        .animate-gentle-wave {
          animation: gentle-wave 15s ease-in-out infinite;
          background-size: 200% 200%;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 relative z-10">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.325-.14-2.618-.402-3.873z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Verify ID</h1>
              <p className="text-sm text-gray-500">Identity verification</p>
            </div>
          </div>
        </div>
        
        <div className="px-8 py-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify your identity</h2>
            <p className="text-sm text-gray-600">We need to verify your identity to process your claim securely.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-900">Full Legal Name</Label>
                <Input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900">Date of Birth</Label>
                <Input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="mt-1.5 h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-900">Government ID</Label>
                <div className="mt-1.5">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-600 border border-gray-200 rounded-lg cursor-pointer bg-white hover:bg-gray-50 focus:outline-none file:mr-4 file:py-3 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:rounded-l-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Driver's license, passport, or national ID</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || !formData.fullName || !formData.dateOfBirth || !formData.idPhoto}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify Identity"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure & encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCPlatform;