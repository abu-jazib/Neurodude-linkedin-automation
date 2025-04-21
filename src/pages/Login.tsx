import React, { useState } from 'react';
import { Linkedin } from 'lucide-react';
import { authAPI } from '../utils/api';
import logo from './logo.png';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLinkedInLogin = async () => {
    try {
      setLoading(true);
      const authUrl = await authAPI.getLinkedInAuthUrl(); // Get the LinkedIn auth URL from the backend
      window.location.href = authUrl; // Redirect to LinkedIn login page
    } catch (error) {
      console.error('Failed to get LinkedIn auth URL:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
          <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">LinkedIn Automation</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Generate and schedule content for your LinkedIn profile using Azure OpenAI
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <button
              onClick={handleLinkedInLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Linkedin className="h-5 w-5 text-blue-100" />
                </span>
              )}
              {loading ? 'Connecting...' : 'Sign in with LinkedIn'}
            </button>
          </div>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Key Features</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
                <h3 className="text-lg font-medium text-gray-900">AI Content Generation</h3>
                <p className="mt-1 text-sm text-gray-500">Create engaging LinkedIn posts with Azure OpenAI</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
                <h3 className="text-lg font-medium text-gray-900">Image Generation</h3>
                <p className="mt-1 text-sm text-gray-500">Generate eye-catching images for your posts</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
                <h3 className="text-lg font-medium text-gray-900">Scheduling</h3>
                <p className="mt-1 text-sm text-gray-500">Schedule posts for optimal engagement times</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
                <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                <p className="mt-1 text-sm text-gray-500">Track performance of your automated posts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
