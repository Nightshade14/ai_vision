
import React from 'react';
import { Navigation } from 'lucide-react';
import CameraFeed from '../components/CameraFeed';
import VoiceControl from '../components/VoiceControl';
import NavigationGuidance from '../components/NavigationGuidance';
import { useNavigationAssistant } from '../hooks/useNavigationAssistant';

const Index = () => {
  const {
    isProcessing,
    isPaused,
    visualContext,
    guidance,
    lastCommand,
    processFrame,
    processVoiceCommand,
    setVoiceListening
  } = useNavigationAssistant();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Navigation Assistant</h1>
              <p className="text-blue-200 text-sm">Visual subway navigation with voice control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Camera Feed */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-white">Live Camera Feed</h2>
          </div>
          <CameraFeed
            onFrame={processFrame}
            isProcessing={isProcessing}
            isPaused={isPaused}
          />
        </div>

        {/* Voice Control */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-6 text-center">Voice Navigation Control</h2>
          <div className="flex justify-center">
            <VoiceControl
              onVoiceCommand={processVoiceCommand}
              isListening={isPaused}
              onListeningChange={setVoiceListening}
            />
          </div>
        </div>

        {/* Navigation Guidance */}
        <NavigationGuidance
          guidance={guidance}
          visualContext={visualContext}
          lastCommand={lastCommand}
          isLoading={isProcessing}
        />

        {/* Instructions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-200">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">1</div>
              <p>Point camera at subway signs and platforms</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">2</div>
              <p>Hold the blue button and speak your destination</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">3</div>
              <p>Receive real-time navigation guidance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
