
import { useState, useCallback, useRef } from 'react';

interface NavigationState {
  isProcessing: boolean;
  isPaused: boolean;
  visualContext: string;
  guidance: string;
  lastCommand: string;
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string, image?: string }>;
}

export const useNavigationAssistant = () => {
  const [state, setState] = useState<NavigationState>({
    isProcessing: false,
    isPaused: false,
    visualContext: '',
    guidance: '',
    lastCommand: '',
    conversationHistory: []
  });

  const processingTimeoutRef = useRef<NodeJS.Timeout>();

  const processFrame = useCallback(async (imageData: string) => {
    if (state.isPaused) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    // Simulate LLM processing delay
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    processingTimeoutRef.current = setTimeout(() => {
      // Mock visual analysis responses
      const visualAnalyses = [
        "I can see subway platform signs indicating Uptown and Downtown directions. There are stairs on the left and an elevator entrance on the right.",
        "This appears to be a subway station entrance with multiple train line indicators (R, N, Q, W trains). Direction signs point left for Uptown service.",
        "I observe a subway platform with train arrival displays. The platform extends in both directions with clear signage for different train lines.",
        "There are accessibility features visible: elevator access and tactile guidance strips. Multiple platform options are available.",
        "I can see subway turnstiles and fare gates ahead. Direction signs indicate platform access through the corridor on the right."
      ];

      const randomAnalysis = visualAnalyses[Math.floor(Math.random() * visualAnalyses.length)];

      setState(prev => ({
        ...prev,
        isProcessing: false,
        visualContext: randomAnalysis,
        conversationHistory: [
          ...prev.conversationHistory,
          { role: 'user', content: 'Visual context', image: imageData },
          { role: 'assistant', content: randomAnalysis }
        ]
      }));
    }, 1500);
  }, [state.isPaused]);

  const processVoiceCommand = useCallback(async (command: string) => {
    setState(prev => ({
      ...prev,
      isPaused: false,
      lastCommand: command,
      isProcessing: true
    }));

    // Simulate LLM processing the voice command with visual context
    setTimeout(() => {
      const guidanceResponses = [
        "Based on what I can see, turn left toward the uptown platform. The R train platform should be accessible via the stairs on your left.",
        "I can see the downtown platform signs. Walk straight ahead and then turn right. The elevator is available if you prefer accessible access.",
        "From your current position, the N train platform is through the corridor on your right. Look for the blue line indicators on the floor.",
        "I notice the transfer signs above. To reach your connecting train, follow the green directional signs and take the escalator down one level.",
        "The exit you're looking for is behind you and to the left. You'll see the street level indicators and 'Exit' signs clearly marked."
      ];

      const randomGuidance = guidanceResponses[Math.floor(Math.random() * guidanceResponses.length)];

      setState(prev => ({
        ...prev,
        isProcessing: false,
        guidance: randomGuidance,
        conversationHistory: [
          ...prev.conversationHistory,
          { role: 'user', content: command },
          { role: 'assistant', content: randomGuidance }
        ]
      }));
    }, 2000);
  }, []);

  const setVoiceListening = useCallback((listening: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isPaused: listening,
      isProcessing: listening 
    }));
  }, []);

  return {
    ...state,
    processFrame,
    processVoiceCommand,
    setVoiceListening
  };
};
