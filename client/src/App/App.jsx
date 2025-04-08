import { useState } from "react";
import "./App.css";
import HomeScreen from "../HomeScreen/HomeScreen.jsx";

const App = () => {
  return (
    <div className="container">
      <div className="main">
        <HomeScreen />
      </div>
    </div>
  );
};

export default App;
