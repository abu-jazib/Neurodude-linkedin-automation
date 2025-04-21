import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="neuron-1"></div>
        <div className="neuron-2"></div>
        <div className="neuron-3"></div>
      </div>
      
      {/* Container for auth content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="w-full flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;