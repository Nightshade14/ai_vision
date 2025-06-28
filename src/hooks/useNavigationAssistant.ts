
import { useState, useCallback, useRef } from 'react';
import { sendImageAnalysis, sendVoiceCommand } from '../services/navigationApi';

interface NavigationState {
  isProcessing: boolean;
  isPaused: boolean;
  visualContext: string;
  guidance: string;
  lastCommand: string;
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string, image?: string }>;
  currentImageData?: string;
}

export const useNavigationAssistant = () => {
  const [state, setState] = useState<NavigationState>({
    isProcessing: false,
    isPaused: false,
    visualContext: '',
    guidance: '',
    lastCommand: '',
    conversationHistory: [],
    currentImageData: undefined
  });

  const processingTimeoutRef = useRef<NodeJS.Timeout>();

  const processFrame = useCallback(async (imageData: string) => {
    if (state.isPaused) return;

    // Store the current image data for voice commands
    setState(prev => ({ 
      ...prev, 
      currentImageData: imageData,
      isProcessing: true 
    }));

    // Clear any existing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    try {
      const response = await sendImageAnalysis(imageData, state.conversationHistory);
      
      if (response.error) {
        console.error('API Error:', response.error);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          visualContext: `Error: ${response.error}`
        }));
        return;
      }

      const newVisualContext = response.visual_context || '';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        visualContext: newVisualContext,
        conversationHistory: [
          ...prev.conversationHistory,
          { role: 'user', content: 'Visual context', image: imageData },
          { role: 'assistant', content: newVisualContext }
        ]
      }));
    } catch (error) {
      console.error('Error processing frame:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        visualContext: 'Error processing image. Please check your connection to the backend.'
      }));
    }
  }, [state.isPaused, state.conversationHistory]);

  const processVoiceCommand = useCallback(async (command: string) => {
    setState(prev => ({
      ...prev,
      isPaused: false,
      lastCommand: command,
      isProcessing: true
    }));

    try {
      const response = await sendVoiceCommand(
        command, 
        state.currentImageData, 
        state.conversationHistory
      );
      
      if (response.error) {
        console.error('API Error:', response.error);
        setState(prev => ({
          ...prev,
          isProcessing: false,
          guidance: `Error: ${response.error}`
        }));
        return;
      }

      const newGuidance = response.guidance || '';
      const newVisualContext = response.visual_context || state.visualContext;

      setState(prev => ({
        ...prev,
        isProcessing: false,
        guidance: newGuidance,
        visualContext: newVisualContext,
        conversationHistory: [
          ...prev.conversationHistory,
          { role: 'user', content: command },
          { role: 'assistant', content: newGuidance }
        ]
      }));
    } catch (error) {
      console.error('Error processing voice command:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        guidance: 'Error processing voice command. Please check your connection to the backend.'
      }));
    }
  }, [state.currentImageData, state.conversationHistory, state.visualContext]);

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
