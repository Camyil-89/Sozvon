// src/components/FormCard.jsx
import React from 'react';

const FormCard = ({
  title,
  subtitle,
  error,
  children,
  icon = null,
  className = ''
}) => {
  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 ${className}`}>
      <div className="text-center">
        {icon && (
          <div className="mx-auto h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
            {icon}
          </div>
        )}
        <h2 className="text-3xl font-bold text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-indigo-200">
            {subtitle}
          </p>
        )}
      </div>

      {error && (
        <div className="mt-6 bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
};

export default FormCard;