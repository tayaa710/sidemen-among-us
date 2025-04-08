import { createRoot } from "react-dom/client";
import App from "./App/App.jsx";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import "./assets/globals.css";

createRoot(document.getElementById("root")).render(
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
);
