import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import "./assets/globals.css";

// Split analytics into a separate chunk that loads after main content
const Analytics = lazy(() => import("@vercel/analytics/react").then(module => ({
  default: module.Analytics
})));

// Use lazy loading for the main App component
const App = lazy(() => import("./App/App.jsx"));

// Loading component shown while App is loading
const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    backgroundColor: '#0a0a0a',
    color: '#ffffff'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Sidemen Among Us
      </div>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        margin: '0 auto',
        borderRadius: '50%', 
        border: '3px solid rgba(255,255,255,0.1)', 
        borderTopColor: '#ff0000', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

createRoot(document.getElementById("root")).render(
  <>
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  </>
);
