import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface CameraFeedProps {
  onFrame: (imageData: string) => void;
  isProcessing: boolean;
  isPaused: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onFrame, isProcessing, isPaused }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        setStream(mediaStream);
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Camera access denied:', error);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isPaused && hasPermission && videoRef.current && canvasRef.current) {
      const interval = setInterval(() => {
        captureFrame();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isPaused, hasPermission]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onFrame(imageData);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <div className="relative w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
          <p>Requesting camera access...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="relative w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-white text-center">
          <CameraOff className="w-12 h-12 mx-auto mb-2 text-red-400" />
          <p className="text-sm">Camera access required for navigation assistance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-64 bg-black rounded-lg object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Processing
        </div>
      )}

      {/* Paused indicator */}
      {isPaused && (
        <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          Voice Mode
        </div>
      )}
    </div>
  );
};

export default CameraFeed;

// import React, { useRef, useEffect, useState } from 'react';
// import { Camera, CameraOff } from 'lucide-react';

// interface CameraFeedProps {
//   onResponse: (response: string) => void;
//   isProcessing: boolean;
//   isPaused: boolean;
//   userMessage?: string;
// }

// const API_URL = 'http://localhost:8000/analyze'; // Make sure this matches your FastAPI server

// const CameraFeed: React.FC<CameraFeedProps> = ({ onResponse, isProcessing, isPaused, userMessage }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [processing, setProcessing] = useState(false);

//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const mediaStream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             facingMode: 'environment',
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//           },
//         });

//         setStream(mediaStream);
//         setHasPermission(true);

//         if (videoRef.current) {
//           videoRef.current.srcObject = mediaStream;
//         }
//       } catch (error) {
//         console.error('Camera access denied:', error);
//         setHasPermission(false);
//       }
//     };

//     startCamera();

//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (!isPaused && hasPermission && videoRef.current && canvasRef.current) {
//       const interval = setInterval(() => {
//         if (!processing) {
//           captureFrameAndSend();
//         }
//       }, 4000); // every 4 seconds

//       return () => clearInterval(interval);
//     }
//   }, [isPaused, hasPermission, userMessage]);

//   const captureFrameAndSend = async () => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext('2d');

//       if (ctx && video.videoWidth > 0) {
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         ctx.drawImage(video, 0, 0);

//         const imageData = canvas.toDataURL('image/jpeg', 0.8);
//         await sendImageToBackend(imageData);
//       }
//     }
//   };

//   const sendImageToBackend = async (base64Image: string) => {
//     try {
//       setProcessing(true);
//       const response = await fetch(API_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-User-ID': 'user123', // optional
//         },
//         body: JSON.stringify({
//           image: base64Image,
//           filename: 'frame.jpg',
//           user_message: userMessage || 'Analyze this image',
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to analyze image');
//       }

//       const data = await response.json();
//       onResponse(data.response); // send result to parent
//     } catch (err) {
//       console.error(err);
//       onResponse('Error analyzing image.');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   if (hasPermission === null) {
//     return (
//       <div className="relative w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
//         <div className="text-white text-center">
//           <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
//           <p>Requesting camera access...</p>
//         </div>
//       </div>
//     );
//   }

//   if (hasPermission === false) {
//     return (
//       <div className="relative w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
//         <div className="text-white text-center">
//           <CameraOff className="w-12 h-12 mx-auto mb-2 text-red-400" />
//           <p className="text-sm">Camera access required for navigation assistance</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full">
//       <video
//         ref={videoRef}
//         autoPlay
//         playsInline
//         muted
//         className="w-full h-64 bg-black rounded-lg object-cover"
//       />
//       <canvas ref={canvasRef} className="hidden" />

//       {processing && (
//         <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
//           <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
//           Analyzing...
//         </div>
//       )}

//       {isPaused && (
//         <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
//           Voice Mode
//         </div>
//       )}
//     </div>
//   );
// };

// export default CameraFeed;
