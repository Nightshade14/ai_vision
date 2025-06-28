
import React, { useState, useRef } from 'react';
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Simulate speech-to-text processing
        // In a real app, you'd send this to a speech recognition service
        await processAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      onListeningChange(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onListeningChange(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Simulate speech-to-text processing
    // In a real implementation, you'd use Web Speech API or send to a service
    
    // Mock responses for demo purposes
    const mockCommands = [
      "I want to go uptown on the R train",
      "How do I get to the downtown platform?",
      "Where is the elevator?",
      "I need to transfer to the N train",
      "Which way to the exit?"
    ];
    
    const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
    
    // Simulate processing delay
    setTimeout(() => {
      onVoiceCommand(randomCommand);
    }, 1000);
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
      </div>
    </div>
  );
};

export default VoiceControl;
