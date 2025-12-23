import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove loading screen
const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
  loadingScreen.style.opacity = '0';
  loadingScreen.style.transition = 'opacity 0.3s';
  setTimeout(() => {
    loadingScreen.remove();
  }, 300);
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);