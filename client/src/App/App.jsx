import { useState } from "react";
import "./App.css";
import HomeScreen from "../HomeScreen/HomeScreen.jsx";
import { Analytics } from "@vercel/analytics/react";

const App = () => {
  return (
    <div className="container">
      <div className="main">
        <HomeScreen />
      </div>
      <Analytics />
    </div>
  );
};

export default App;
