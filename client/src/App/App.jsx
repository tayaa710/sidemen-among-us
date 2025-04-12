import { useState } from "react";
import "./App.css";
import HomeScreen from "../HomeScreen/HomeScreen.jsx";

const App = () => {
  return (
    <div className="container">
      <div className="main">
        <HomeScreen />
      </div>
      <footer style={{ textAlign: 'center', fontSize: '0.85rem', color: '#777', padding: '1rem' }}>
        <p>
          This is an <strong>unofficial fan-made site</strong>. It is not affiliated with, endorsed by, or connected to the Sidemen or their official channels. All content belongs to its respective owners.
        </p>
      </footer>
    </div>
  );
};

export default App;
