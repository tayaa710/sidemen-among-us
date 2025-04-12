import { lazy, Suspense } from "react";
import "./App.css";

// Lazy load the HomeScreen component with dynamic import and prefetching
const HomeScreen = lazy(() => {
  // Prefetch related components after the main content loads
  const prefetchRelatedComponents = () => {
    // This can be executed after the HomeScreen loads
    import("../Video/Video.jsx");
    import("../HomeScreen/filterBar/FilterBar.jsx");
    import("../HomeScreen/players/Players.jsx");
  };

  return import("../HomeScreen/HomeScreen.jsx").then(module => {
    // Trigger prefetch in a non-blocking way
    setTimeout(prefetchRelatedComponents, 2000);
    return module;
  });
});

// Simple loading indicator for HomeScreen
const HomeScreenLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    minHeight: '50vh', 
    padding: '2rem'
  }}>
    <div style={{ 
      width: '40px', 
      height: '40px',
      borderRadius: '50%', 
      border: '3px solid rgba(255, 255, 255, 0.1)',
      borderTopColor: '#ff0000',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
);

const App = () => {
  return (
    <div className="container">
      <div className="main">
        <Suspense fallback={<HomeScreenLoader />}>
          <HomeScreen />
        </Suspense>
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
