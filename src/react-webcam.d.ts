declare module 'react-webcam' {
  import React from 'react';

  interface WebcamProps {
    audio?: boolean;
    height?: number;
    width?: number;
    screenshotFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
    style?: React.CSSProperties;
    className?: string;
    videoConstraints?: MediaStreamConstraints;
    onUserMedia?: (stream: MediaStream) => void;
    onUserMediaError?: (error: string) => void;
  }

  export default class Webcam extends React.Component<WebcamProps> {
    getScreenshot: () => string | null;
  }
} 