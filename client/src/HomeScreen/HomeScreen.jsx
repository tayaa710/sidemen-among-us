import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Video from "../Video/Video";
import axios from "axios";
import "./homeScreen.css";
import FilterBar from "./filterBar/FilterBar";
import Players from "./players/Players";

// Amount of videos to load at once
const VIDEOS_PER_PAGE = 21;

const HomeScreen = () => {
  // STATE

  // videoData: Current list of videos displayed (after filtering/sorting)
  const [videoData, setVideoData] = useState([]);
  // originalVideoData: Full list of videos fetched from API (unfiltered)
  const [originalVideoData, setOriginalVideoData] = useState([]);
  // sorter: Current sort option selected by the user (e.g., "mostRecent", "oldest")
  const [sorter, setSorter] = useState("mostRecent");
  // searchQuery: The text used to filter videos by title
  const [searchQuery, setSearchQuery] = useState("");
  // playerStats: Statistical data for players fetched from API
  const [playerStats, setPlayerStats] = useState([]);
  // gameStats: Statistical data for games fetched from API
  const [gameStats, setGameStats] = useState([]);
  // playerCheckboxes: Array representing the state of player filters (each object contains name and filterValue)
  const [playerCheckboxes, setPlayerCheckboxes] = useState([]);
  // roleCheckboxes: Array representing the state of role filters (each object contains name and filterValue)
  const [roleCheckboxes, setRoleCheckboxes] = useState([]);
  // loading: Loading state for initial data fetch
  const [mapCheckboxes, setMapCheckboxes] = useState([]);
  // modeCheckboxes: Array for game mode filters (chaos, jester, etc)
  const [modeCheckboxes, setModeCheckboxes] = useState([]);
  // Number of videos to show (for infinite scrolling)
  const [videosToShow, setVideosToShow] = useState(VIDEOS_PER_PAGE);
  // Loading more state
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(true);
  // filtersCollapsed: State to track if the filter section is collapsed
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  
  // Reference for the observer
  const observerTarget = useRef(null);
  const hasMore = videosToShow < videoData.length;

  // Define game modes with their patterns for title searching
  const gameModes = [
    { name: "Chaos", patterns: ["chaos"] },
    { name: "Jester", patterns: ["jester"] },
    { name: "Draft", patterns: ["draft"] },
    { name: "Hide & Seek", patterns: ["hide & seek", "hide and seek", "hide n seek"] },
    { name: "3D", patterns: ["3d among us", "3d mode"] },
    { name: "Dumbest", patterns: ["dumb"] },
    { name: "Proximity", patterns: ["proximity"] }
  ];

  //USE EFFECT FUNCTIONS

  // Fetch videos and stats on mount
  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        setLoading(true);
        
        // Use Promise.all to fetch both endpoints concurrently
        const [videoResponse, statsResponse] = await Promise.all([
          axios.get("https://sidemen-among-us-backend.onrender.com/api/videos", { timeout: 15000 }),
          axios.get("https://sidemen-among-us-backend.onrender.com/api/sheetData", { timeout: 15000 })
        ]);
        
        const videos = videoResponse.data;
        const stats = statsResponse.data;
        
        // Check if data is valid and not empty
        if (!videos || !Array.isArray(videos) || videos.length === 0 || 
            !stats || !Array.isArray(stats) || stats.length === 0) {
          
          console.error("Received empty or invalid data", { videos, stats });
          
          // Retry up to 3 times with a delay
          if (retryCount < 3) {
            console.log(`Retrying data fetch (${retryCount + 1}/3) in 2 seconds...`);
            setLoading(true);
            setTimeout(() => fetchData(retryCount + 1), 2000);
            return;
          } else {
            throw new Error("Failed to fetch data after multiple attempts");
          }
        }
        
        setOriginalVideoData(videos);
        
        const playerData = stats[0]?.data || [];
        const gameData = stats[1]?.data || [];
        setPlayerStats(playerData);
        setGameStats(gameData);
        
        // Create player checkboxes
        const playerOptions = [...new Set(videos.flatMap(v => v.players || []))]
          .map(name => {
            // Count how many videos this player appears in
            const count = videos.filter(v => v.players && v.players.includes(name)).length;
            return {
              name: name,
              count: count,
              filterValue: 0
            };
          })
          .sort((a, b) => b.count - a.count); // Sort by count (most to least)
        
        setPlayerCheckboxes(playerOptions);
        
        // Create role checkboxes
        const roleOptions = [...new Set(videos.flatMap(v => v.roles || []))]
          .map(role => {
            // Count how many videos this role appears in
            const count = videos.filter(v => v.roles && v.roles.includes(role)).length;
            return {
              rolename: role,
              count: count,
              filterValue: 0
            };
          })
          .sort((a, b) => b.count - a.count); // Sort by count (most to least)
        
        setRoleCheckboxes(roleOptions);
        
        // Create map checkboxes
        const mapOptions = [...new Set(videos.flatMap(v => v.mapNames || []))]
          .map(mapname => {
            // Count how many videos this map appears in
            const count = videos.filter(v => v.mapNames && v.mapNames.includes(mapname)).length;
            return {
              mapname: mapname,
              count: count,
              filterValue: 0
            };
          })
          .sort((a, b) => b.count - a.count); // Sort by count (most to least)
        
        setMapCheckboxes(mapOptions);
        
        // Count occurrences of each mode in titles
        const modeCounts = {};
        gameModes.forEach(mode => {
          modeCounts[mode.name] = videos.filter(v => {
            const lowercaseTitle = v.title.toLowerCase();
            return mode.patterns.some(pattern => lowercaseTitle.includes(pattern));
          }).length;
        });
        
        // Create mode checkboxes sorted by the number of videos (most first)
        const modeOptions = Object.entries(modeCounts)
          .filter(([_, count]) => count > 0) // Only include modes that appear in videos
          .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
          .map(([modename, count]) => ({
            modename,
            count,
            filterValue: 0
          }));
        
        setModeCheckboxes(modeOptions);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Retry up to 3 times with a delay
        if (retryCount < 3) {
          console.log(`Retrying due to error (${retryCount + 1}/3) in 2 seconds...`);
          setLoading(true);
          setTimeout(() => fetchData(retryCount + 1), 2000);
        } else {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, []);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setVideosToShow(prev => prev + VIDEOS_PER_PAGE);
            setLoadingMore(false);
          }, 300); // Small delay to prevent rapid scrolling issues
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    // Cleanup observer on unmount
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore]);

  // Memoized sorter function
  const sorterHelper = useCallback((videos, sortOption) => {
    const sortedVideos = [...videos]; // Create new array to avoid mutation
    
    switch (sortOption) {
      case "mostRecent":
        sortedVideos.sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        break;
      case "oldest":
        sortedVideos.sort(
          (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
        );
        break;
      case "mostPopular":
        sortedVideos.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "mostLiked":
        sortedVideos.sort((a, b) => b.likeCount - a.likeCount);
        break;
      default:
        sortedVideos.sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
    }
    return sortedVideos;
  }, []);

  // Memoized filtered videos
  const filteredAndSortedVideos = useMemo(() => {
    if (!originalVideoData.length) return [];
    
    let result = [...originalVideoData];
    
    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(video => 
        video.title.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Apply player filter
    const activePlayerIncludes = playerCheckboxes
      .filter(item => item.filterValue === 1)
      .map(item => item.name);
      
    const activePlayerExcludes = playerCheckboxes
      .filter(item => item.filterValue === 2)
      .map(item => item.name);
    
    if (activePlayerIncludes.length > 0 || activePlayerExcludes.length > 0) {
      result = result.filter(video => {
        // Video must have ALL of the included players (if any are specified)
        const hasAllIncludedPlayers = 
          activePlayerIncludes.length === 0 || 
          activePlayerIncludes.every(player => video.players && video.players.includes(player));
        
        // Video must not have any of the excluded players
        const hasNoExcludedPlayer = 
          !activePlayerExcludes.some(player => video.players && video.players.includes(player));
        
        return hasAllIncludedPlayers && hasNoExcludedPlayer;
      });
    }
    
    // Apply role filter
    const activeRoleIncludes = roleCheckboxes
      .filter(item => item.filterValue === 1)
      .map(item => item.rolename);
      
    const activeRoleExcludes = roleCheckboxes
      .filter(item => item.filterValue === 2)
      .map(item => item.rolename);
    
    if (activeRoleIncludes.length > 0 || activeRoleExcludes.length > 0) {
      result = result.filter(video => {
        // Video must have ALL of the included roles (if any are specified)
        const hasAllIncludedRoles = 
          activeRoleIncludes.length === 0 || 
          activeRoleIncludes.every(role => video.roles && video.roles.includes(role));
        
        // Video must not have any of the excluded roles
        const hasNoExcludedRole = 
          !activeRoleExcludes.some(role => video.roles && video.roles.includes(role));
        
        return hasAllIncludedRoles && hasNoExcludedRole;
      });
    }
    
    // Apply map filter
    const activeMapIncludes = mapCheckboxes
      .filter(item => item.filterValue === 1)
      .map(item => item.mapname);
      
    const activeMapExcludes = mapCheckboxes
      .filter(item => item.filterValue === 2)
      .map(item => item.mapname);
    
    if (activeMapIncludes.length > 0 || activeMapExcludes.length > 0) {
      result = result.filter(video => {
        // Video must have ALL of the included maps (if any are specified)
        const hasAllIncludedMaps = 
          activeMapIncludes.length === 0 || 
          activeMapIncludes.every(map => video.mapNames && video.mapNames.includes(map));
        
        // Video must not have any of the excluded maps
        const hasNoExcludedMap = 
          !activeMapExcludes.some(map => video.mapNames && video.mapNames.includes(map));
        
        return hasAllIncludedMaps && hasNoExcludedMap;
      });
    }
    
    // Apply mode filter
    const activeModeIncludes = modeCheckboxes
      .filter(item => item.filterValue === 1)
      .map(item => item.modename);
      
    const activeModeExcludes = modeCheckboxes
      .filter(item => item.filterValue === 2)
      .map(item => item.modename);
    
    if (activeModeIncludes.length > 0 || activeModeExcludes.length > 0) {
      result = result.filter(video => {
        const lowercaseTitle = video.title.toLowerCase();
        
        // Find all matching game modes in this video
        const matchingModes = gameModes
          .filter(mode => mode.patterns.some(pattern => lowercaseTitle.includes(pattern)))
          .map(mode => mode.name);
        
        // Video must have ALL of the included modes (if any are specified)
        const hasAllIncludedModes = 
          activeModeIncludes.length === 0 || 
          activeModeIncludes.every(mode => matchingModes.includes(mode));
        
        // Video must not have any of the excluded modes
        const hasNoExcludedMode = 
          !activeModeExcludes.some(mode => matchingModes.includes(mode));
        
        return hasAllIncludedModes && hasNoExcludedMode;
      });
    }
    
    // Sort the results
    return sorterHelper(result, sorter);
  }, [originalVideoData, searchQuery, playerCheckboxes, roleCheckboxes, mapCheckboxes, modeCheckboxes, sorter, sorterHelper, gameModes]);

  // Update videoData when filteredAndSortedVideos changes
  useEffect(() => {
    setVideoData(filteredAndSortedVideos);
    // Reset the number of videos to show when filters change
    setVideosToShow(VIDEOS_PER_PAGE);
  }, [filteredAndSortedVideos]);

  // Toggle filter visibility
  const toggleFilters = () => {
    setFiltersCollapsed(!filtersCollapsed);
  };

  // Get slice of videos to display
  const videosToDisplay = useMemo(() => {
    return videoData.slice(0, videosToShow);
  }, [videoData, videosToShow]);

  return (
    <div className="homeContainer">
      <div className="headerSection">
        <h1>Side<span>men</span> Among Us</h1>
      </div>
      
      <div className="mainContent">
        <div className="filterAndStatsSection">
          <div className="filterBar">
            <FilterBar
              setSorter={setSorter}
              setSearchQuery={setSearchQuery}
              playerStats={playerStats}
              setPlayerCheckboxes={setPlayerCheckboxes}
              playerCheckboxes={playerCheckboxes}
              gameStats={gameStats}
              roleCheckboxes={roleCheckboxes}
              setRoleCheckboxes={setRoleCheckboxes}
              mapCheckboxes={mapCheckboxes}
              setMapCheckboxes={setMapCheckboxes}
              modeCheckboxes={modeCheckboxes}
              setModeCheckboxes={setModeCheckboxes}
              filtersCollapsed={filtersCollapsed}
              toggleFilters={toggleFilters}
            />
          </div>
          
          <div className="playersContainer">
            <Players playerStats={playerStats} />
          </div>
        </div>
        
        <div className="contentSection">
          <div className="videosContainer">
            {loading ? (
              <div className="loadingMessage">Loading videos...</div>
            ) : videoData.length === 0 ? (
              <div className="noResultsMessage">No videos match your filters. Try adjusting your search criteria.</div>
            ) : (
              <>
                {videosToDisplay.map((video) => (
                  <Video
                    key={video.id}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    duration={video.duration}
                    viewCount={video.viewCount}
                    likeCount={video.likeCount}
                    players={video.players}
                    roles={video.roles}
                    youtubeUrl={video.videoUrl}
                    isLastRow={videoData.indexOf(video) >= videoData.length - (videoData.length % 3 || 3)}
                  />
                ))}
                
                {/* Intersection Observer Target */}
                <div 
                  ref={observerTarget} 
                  className={`scroll-loader ${!hasMore ? 'hidden' : ''}`}
                >
                  {loadingMore && <div className="loading-spinner"></div>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
