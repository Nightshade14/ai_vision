import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders llama astra header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Llama Astra Camera PWA/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders speech recognition button when supported', () => {
  // Mock speech recognition support
  Object.defineProperty(window, 'SpeechRecognition', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      continuous: false,
      interimResults: false,
      lang: '',
      onresult: null,
      onerror: null,
      onend: null,
      start: jest.fn(),
      stop: jest.fn(),
      abort: jest.fn()
    }))
  });

  render(<App />);
  const micButton = screen.getByText(/Start Recording/i);
  expect(micButton).toBeInTheDocument();
});
