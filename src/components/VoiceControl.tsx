
import React, { useState, useRef, useEffect } from 'react';
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
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        onVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        onListeningChange(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
        onListeningChange(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [onVoiceCommand, onListeningChange]);

  const startRecording = () => {
    if (recognition) {
      try {
        recognition.start();
        setIsRecording(true);
        onListeningChange(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
  };

  const handleMouseDown = () => {
    startRecording();
  };

  const handleMouseUp = () => {
    stopRecording();
  };

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
          ${isRecording 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
        disabled={isListening && !isRecording}
      >
        {isRecording ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
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
