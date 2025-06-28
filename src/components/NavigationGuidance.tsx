
import React from 'react';
import { Navigation, MapPin, ArrowRight } from 'lucide-react';

interface NavigationGuidanceProps {
  guidance: string;
  visualContext: string;
  lastCommand: string;
  isLoading: boolean;
}

const NavigationGuidance: React.FC<NavigationGuidanceProps> = ({ 
  guidance, 
  visualContext, 
  lastCommand,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Navigation className="w-6 h-6 text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-800">Analyzing Scene...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      {lastCommand && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Your Request</span>
          </div>
          <p className="text-blue-700 italic">"{lastCommand}"</p>
        </div>
      )}

      {guidance && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Navigation Guidance</span>
          </div>
          <p className="text-green-700 font-medium">{guidance}</p>
        </div>
      )}

      {visualContext && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">What I See</span>
          </div>
          <p className="text-gray-600 text-sm">{visualContext}</p>
        </div>
      )}

      {!guidance && !isLoading && (
        <div className="text-center py-8">
          <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Point your camera at subway signs and use voice commands for navigation help</p>
        </div>
      )}
    </div>
  );
};

export default NavigationGuidance;
