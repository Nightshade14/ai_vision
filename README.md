# 🦙👁️ Metro Vision - Your AI-Powered Vision Assistant to navigate NYC

<div align="center">

![Llama Astra](https://img.shields.io/badge/Llama-Astra-blue?style=for-the-badge&logo=react)
![PWA](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

**Empowering everyone to see and understand the world through AI** 🌍✨

*Making the invisible visible, the unclear clear, and the world more accessible*

</div>

---

## 🌟 Vision & Mission

Llama Astra is a revolutionary **Progressive Web App (PWA)** that transforms your smartphone into an intelligent visual assistant. Inspired by Google's Project Astra, our mission is to democratize AI-powered vision assistance, making the world more accessible and understandable for everyone—especially those with visual impairments.

### 🎯 Why Metro Vision?

- **🧑‍🦯 Accessibility First**: Designed with vision-impaired users in mind, providing real-time environmental understanding
- **📱 Universal Access**: Works on any modern smartphone through the browser—no app store required
- **🚀 Lightning Fast**: Powered by Cerebras and Groq's low-latency inference APIs for near-instantaneous responses
- **🔊 Voice-Powered**: Hands-free operation with speech recognition and audio feedback
- **🌐 Offline-Capable**: PWA technology ensures reliability even with poor connectivity

---

## ✨ Key Features

### 🎥 **Smart Camera Integration**
- **Dual Camera Support**: Seamlessly switch between front and rear cameras
- **Real-time Processing**: Instant analysis of your visual environment
- **High-Quality Capture**: Optimized image processing for better AI understanding

### 🗣️ **Natural Voice Interaction**
- **Speech-to-Text**: Ask questions naturally using your voice
- **Hands-Free Operation**: Perfect for users with mobility challenges
- **Multi-Language Support**: Coming soon - global accessibility

### 🧠 **AI-Powered Understanding**
- **Scene Description**: Detailed explanations of what's in front of you
- **Object Recognition**: Identify and describe objects, people, and text
- **Navigation Assistance**: Help with wayfinding and obstacle detection
- **Text Reading**: OCR capabilities for reading signs, menus, and documents

### 📱 **Progressive Web App Benefits**
- **No Installation Required**: Access instantly through your browser
- **Cross-Platform**: Works on iOS, Android, and desktop
- **Offline Functionality**: Core features work without internet
- **Auto-Updates**: Always get the latest features automatically

---

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with camera and microphone support
- HTTPS connection (required for camera/microphone access)

### 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nightshade14/ai_vision.git
   cd ai_vision
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in your browser**
   ```
   https://localhost:3000
   ```

### 🌐 Production Deployment

```bash
# Build for production
npm run build

# Serve the built files
npm install -g serve
serve -s build -p 3000
```

---

## 🏗️ Technical Architecture

### 🔧 **Tech Stack**
- **Frontend**: React 19 with TypeScript
- **Styling**: CSS3 with responsive design
- **Camera**: React Webcam integration
- **Speech**: Web Speech API
- **PWA**: Service Worker, Web App Manifest
- **AI Integration**: Cerebras/Groq APIs for Llama 4

### 📁 **Project Structure**
```
llamaAstra/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── index.html
├── src/
│   ├── App.tsx               # Main application component
│   ├── App.css               # Styling and animations
│   ├── react-webcam.d.ts     # Webcam type definitions
│   └── speech-recognition.d.ts # Speech API types
├── package.json
└── README.md
```

---

## 🎨 User Experience

### 📱 **Mobile-First Design**
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Responsive Layout**: Adapts to all screen sizes
- **Dark Theme**: Reduces eye strain and battery usage
- **Accessibility**: Screen reader compatible

### 🎭 **Visual Design**
- **Clean Interface**: Minimal distractions, maximum functionality
- **High Contrast**: Optimized for users with visual impairments
- **Smooth Animations**: Engaging but not overwhelming
- **Status Indicators**: Clear feedback for all actions

---

## 🌍 Impact & Use Cases

### 👥 **For Everyone**
- **Shopping**: Get product information and price comparisons
- **Navigation**: Understand street signs and directions
- **Education**: Learn about your surroundings
- **Safety**: Identify potential hazards or obstacles

### 🧑‍🦯 **For Vision-Impaired Users**
- **Independence**: Navigate unfamiliar environments confidently
- **Reading**: Access printed text instantly
- **Social**: Understand social situations and facial expressions
- **Daily Tasks**: Identify objects, clothing, and food items

### 👨‍💼 **Professional Applications**
- **Maintenance**: Equipment identification and troubleshooting
- **Inspection**: Quality control and safety assessments
- **Training**: Real-time learning and assistance
- **Documentation**: Instant reporting and analysis

---

## 🤝 Contributing

We welcome contributions from developers, accessibility experts, and users! Here's how you can help:

### 🐛 **Bug Reports**
- Use the issue tracker to report bugs
- Include detailed steps to reproduce
- Provide browser and device information

### 💡 **Feature Requests**
- Suggest new features that improve accessibility
- Describe the use case and expected behavior
- Consider impact on different user groups

### 👨‍💻 **Code Contributions**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Inspiration**: Gemini Live [Formerly Google's Project Astra] for showing the potential of AI vision assistance
- **AI Partners**: Meta for providing inference capabilities via Llama API for Llama 4
- **Community**: The accessibility community for guidance and feedback
- **Open Source**: All the amazing open-source projects that make this possible

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Nightshade14/ai_vision/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Nightshade14/ai_vision/discussions)
- **Email**: [satyamchatrola14@gmail.com](mailto:satyamchatrola14@gmail.com)

---

<div align="center">

**Built with ❤️ for accessibility and inclusion**

*Making AI vision assistance available to everyone, everywhere*

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-4285F4?style=flat&logo=googlechrome)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

</div>
