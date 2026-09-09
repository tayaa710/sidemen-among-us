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

const HomeScreenLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh'
  }}>
    <div style={{
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '2px solid #262626',
      borderTopColor: '#c41e1e',
      animation: 'spin 0.8s linear infinite'
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
      <footer>
        <p>
          This is an <strong><span className="disclaimer">unofficial fan-made site</span></strong>. It is not affiliated with, endorsed by, or connected to the Sidemen or their official channels. All content belongs to its respective owners.
        </p>
      </footer>
    </div>
  );
};

export default App;
