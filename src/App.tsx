import React, { useState, useCallback, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import './App.css';

function App() {
  const [facingMode, setFacingMode] = useState<string | { exact: string }>('environment');
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  
  // Speech-to-text states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // Webcam ref for capturing screenshots
  const webcamRef = useRef<Webcam>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    if (/android|iPad|iPhone|iPod/i.test(userAgent.toLowerCase())) {
      setIsMobile(true);
    }
    
    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          setSpeechError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    } else {
      setSpeechError('Speech recognition not supported in this browser');
    }
    
    // Request camera permissions
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(() => {
        setCameraReady(true);
        setError(null);
      })
      .catch((err) => {
        setError(`Camera permission denied: ${err.message}`);
      });
  }, []);

  const videoConstraints = {
    video: {
      facingMode: facingMode
    }
  };

  const switchCamera = useCallback(() => {
    setFacingMode((prevMode: string | { exact: string }) => 
      prevMode === 'environment' ? 'user' : 'environment'
    );
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && speechSupported) {
      setTranscript('');
      setSpeechError(null);
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        setSpeechError('Error starting speech recognition');
        setIsListening(false);
      }
    }
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const captureImageAndSendToAI = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc && transcript) {
        // Here you would send both the image and transcript to your AI service
        console.log('Image captured:', imageSrc.substring(0, 50) + '...');
        console.log('Transcript:', transcript);
        
        // TODO: Implement AI service call
        // Example structure for AI API call:
        // const aiData = {
        //   image: imageSrc,
        //   question: transcript,
        //   timestamp: new Date().toISOString()
        // };
        // sendToAI(aiData);
        
        alert(`Ready to send to AI:\nQuestion: "${transcript}"\nImage: Captured from camera`);
      } else {
        alert('Please ensure both camera is ready and you have spoken a question');
      }
    }
  }, [transcript]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setSpeechError(null);
  }, []);

  const handleUserMediaError = (error: string) => {
    setError(`Camera access error: ${error}`);
  };

  const handleUserMedia = (stream: MediaStream) => {
    setCameraReady(true);
    setError(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Llama Astra Camera PWA</h1>
        {error ? (
          <div className="error-message">
            <p>{error}</p>
            <p>Please ensure camera permissions are granted and the camera is available.</p>
          </div>
        ) : (
          <div className="camera-container">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="camera-feed"
              onUserMediaError={handleUserMediaError}
              onUserMedia={handleUserMedia}
            />
          </div>
        )}
        
        {/* Speech Recognition Section */}
        <div className="speech-section">
          {speechSupported ? (
            <div>
              <div className="speech-controls">
                <button 
                  onClick={isListening ? stopListening : startListening}
                  className={`control-button ${isListening ? 'recording' : ''}`}
                  disabled={!cameraReady}
                >
                  {isListening ? '🎤 Stop Recording' : '🎤 Start Recording'}
                </button>
                {transcript && (
                  <button onClick={clearTranscript} className="control-button secondary">
                    Clear
                  </button>
                )}
              </div>
              
              {isListening && (
                <p className="status-text listening">🎤 Listening... Speak your question about what you see</p>
              )}
              
              {transcript && (
                <div className="transcript-container">
                  <h3>Your question:</h3>
                  <p className="transcript-text">"{transcript}"</p>
                </div>
              )}
              
              {speechError && (
                <div className="error-message">
                  <p>{speechError}</p>
                </div>
              )}
              
              {transcript && cameraReady && (
                <div className="ai-section">
                  <button onClick={captureImageAndSendToAI} className="control-button primary">
                    🤖 Ask AI about what it sees
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="error-message">
              <p>Speech recognition is not supported in this browser</p>
              <p>Try using Chrome or Edge for the best experience</p>
            </div>
          )}
        </div>
        
        <div className="camera-controls">
          <button onClick={switchCamera} className="control-button">
            📹 Switch Camera
          </button>
        </div>
        
        <div className="status-info">
          <p className="status-text">
            {cameraReady ? '✅ Camera ready!' : '⏳ Loading camera...'}
          </p>
          {speechSupported && (
            <p className="status-text">
              {isListening ? '🎤 Microphone active' : '🎤 Speech recognition ready'}
            </p>
          )}
          <p className="status-text">
            💡 Install this app on your device for the best experience
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;