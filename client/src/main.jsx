import { createRoot } from "react-dom/client";
import App from "./App/App.jsx";
import { PrimeReactProvider } from "primereact/api";
import "./assets/globals.css";
import Plausible from 'plausible-tracker';

// Initialize Plausible tracking
const plausible = Plausible({
  domain: 'sidemenamongus.vercel.app', // Production domain
  apiHost: 'https://plausible.io', // Optional, default is 'https://plausible.io'
  trackLocalhost: true, // Optional, track localhost for development
});

// Start tracking page views
plausible.enableAutoPageviews();

createRoot(document.getElementById("root")).render(
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
);
