import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceControlProps {
  onVoiceCommand: (command: string) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({
  onVoiceCommand,
  isListening,
  onListeningChange
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log('Speech recognized:', transcript);
      onVoiceCommand(transcript);
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      stopRecording();
    };

    recognitionInstance.onend = () => {
      console.log('Speech recognition ended.');
      setIsRecording(false);
      onListeningChange(false);
    };

    setRecognition(recognitionInstance);
  }, [onVoiceCommand, onListeningChange]);

  const startRecording = () => {
    if (!recognition) {
      console.error('Speech recognition not initialized.');
      return;
    }

    try {
      recognition.start();
      console.log('Speech recognition started.');
      setIsRecording(true);
      onListeningChange(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
  };

  const handleMouseDown = () => startRecording();
  const handleMouseUp = () => stopRecording();

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startRecording();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`
          w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-lg
          transition-all duration-200 transform active:scale-95 shadow-lg
          ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {isRecording ? 'Release to send' : 'Hold to speak'}
        </p>
        {isListening && !isRecording && (
          <p className="text-xs text-blue-600 mt-1">Processing your request...</p>
        )}
        {!recognition && (
          <p className="text-xs text-red-600 mt-1">Speech recognition not supported</p>
        )}
      </div>
    </div>
  );
};

export default VoiceControl;
