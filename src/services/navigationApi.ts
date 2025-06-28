
const API_BASE_URL = 'http://localhost:8000'; // Update this to your Python backend URL

export interface NavigationRequest {
  image?: string;
  text?: string;
  conversation_history?: Array<{ role: 'user' | 'assistant', content: string, image?: string }>;
}

export interface NavigationResponse {
  guidance?: string;
  visual_context?: string;
  error?: string;
}

export const sendNavigationRequest = async (request: NavigationRequest): Promise<NavigationResponse> => {
  try {
    console.log('Sending request to backend:', { ...request, image: request.image ? '[IMAGE_DATA]' : undefined });
    
    const response = await fetch(`${API_BASE_URL}/navigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from backend:', data);
    return data;
  } catch (error) {
    console.error('Error calling navigation API:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const sendImageAnalysis = async (imageData: string, conversationHistory: Array<{ role: 'user' | 'assistant', content: string, image?: string }>): Promise<NavigationResponse> => {
  return sendNavigationRequest({
    image: imageData,
    conversation_history: conversationHistory
  });
};

export const sendVoiceCommand = async (
  command: string, 
  imageData?: string, 
  conversationHistory?: Array<{ role: 'user' | 'assistant', content: string, image?: string }>
): Promise<NavigationResponse> => {
  return sendNavigationRequest({
    text: command,
    image: imageData,
    conversation_history: conversationHistory
  });
};
