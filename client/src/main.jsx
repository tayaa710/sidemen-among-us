import { createRoot } from "react-dom/client";
import App from "./App/App.jsx";
import "./assets/globals.css";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Analytics />
  </>
);
