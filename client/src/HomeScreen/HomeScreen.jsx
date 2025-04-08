import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Video from "../Video/Video";
import axios from "axios";
import "./homeScreen.css";
import Plausible from 'plausible-tracker';
import FilterBar from "./filterBar/FilterBar";
import Players from "./players/Players";

// Initialize Plausible tracker for custom events
const plausible = Plausible();

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
          
          // Track API error event
          plausible.trackEvent('API Error', { 
            props: { 
              error: 'Empty or invalid data',
              retryCount 
            }
          });
          
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
        const playerOptions = [...new Set(videos.flatMap(v => v.players || []))].map(name => ({
          name: name,
          filterValue: 0
        }));
        setPlayerCheckboxes(playerOptions);
        
        // Create role checkboxes
        const roleOptions = [...new Set(videos.flatMap(v => v.roles || []))].map(role => ({
          rolename: role,
          filterValue: 0
        }));
        setRoleCheckboxes(roleOptions);
        
        const mapOptions = [...new Set(videos.flatMap(v => v.mapNames || []))].map(mapname => ({
          mapname: mapname,
          filterValue: 0
        }));
        setMapCheckboxes(mapOptions);
        
        setLoading(false);
        
        // Track successful data fetch
        plausible.trackEvent('Data Loaded', { 
          props: { 
            videoCount: videos.length,
            playerCount: playerData.length,
            gameCount: gameData.length
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Track error event
        plausible.trackEvent('API Error', { 
          props: { 
            error: error.message,
            retryCount 
          }
        });
        
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
          
          // Track infinite scroll event
          plausible.trackEvent('Load More Videos', { 
            props: { 
              fromCount: videosToShow,
              toCount: videosToShow + VIDEOS_PER_PAGE,
              totalAvailable: videoData.length
            }
          });
          
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
  }, [hasMore, loadingMore, videoData.length, videosToShow]);
  
  // Track when sorter changes
  useEffect(() => {
    if (sorter && originalVideoData.length > 0) {
      plausible.trackEvent('Sort Changed', { 
        props: { sortOption: sorter }
      });
    }
  }, [sorter, originalVideoData.length]);
  
  // Track when search query changes (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery && originalVideoData.length > 0) {
        plausible.trackEvent('Search Query', { 
          props: { 
            query: searchQuery,
            resultCount: filteredAndSortedVideos.length
          }
        });
      }
    }, 500);
    
    return () => clearTimeout(handler);
  }, [searchQuery, originalVideoData.length, filteredAndSortedVideos.length]);

  // Memoized filter helper function
  const filterByHelper = useCallback((checkbox, filterList, nameKey) => {
    // Check if there are any active filters (filterValue 1 or 2)
    const hasActiveFilters = checkbox.some(item => item.filterValue > 0);
    
    // If no filters are active, return true to show all videos
    if (!hasActiveFilters) return true;
    
    const filterIn = checkbox
      .filter((item) => item.filterValue === 1)
      .map((item) => item[nameKey]);
    const filterOut = checkbox
      .filter((item) => item.filterValue === 2)
      .map((item) => item[nameKey]);
      
    const passesOutFilter = !filterList.some((item) =>
      filterOut.includes(item)
    );
    
    const passesInFilter =
      filterIn.length === 0 ||
      filterList.some((item) => filterIn.includes(item));
      
    return passesOutFilter && passesInFilter;
  }, []);

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

  // Memoized search function
  const filterBySearchHelper = useCallback((videos, query) => {
    if (!query) return videos;
    
    const lowerCaseQuery = query.toLowerCase();
    return videos.filter((video) =>
      video.title.toLowerCase().includes(lowerCaseQuery)
    );
  }, []);

  // Memoized filtered videos
  const filteredAndSortedVideos = useMemo(() => {
    if (!originalVideoData.length) return [];
    
    let result = [...originalVideoData];
    
    // Apply search filter
    result = filterBySearchHelper(result, searchQuery);
    
    // Apply player filter
    result = result.filter(video => 
      filterByHelper(playerCheckboxes, video.players, "name"));
    
    // Apply role filter
    result = result.filter(video => 
      filterByHelper(roleCheckboxes, video.roles, "rolename"));
    
    // Apply map filter
    result = result.filter(video => 
      filterByHelper(mapCheckboxes, video.mapNames, "mapname"));
    
    // Sort the results
    result = sorterHelper(result, sorter);
    
    return result;
  }, [originalVideoData, searchQuery, playerCheckboxes, roleCheckboxes, mapCheckboxes, sorter, filterByHelper, filterBySearchHelper, sorterHelper]);

  // Update videoData when filteredAndSortedVideos changes
  useEffect(() => {
    setVideoData(filteredAndSortedVideos);
    // Reset the number of videos to show when filters change
    setVideosToShow(VIDEOS_PER_PAGE);
  }, [filteredAndSortedVideos]);

  // Toggle filter visibility
  const toggleFilters = () => {
    setFiltersCollapsed(!filtersCollapsed);
    
    // Track filter toggle event
    plausible.trackEvent('Toggle Filters', { 
      props: { state: !filtersCollapsed ? 'collapsed' : 'expanded' }
    });
  };

  // Get slice of videos to display
  const videosToDisplay = useMemo(() => {
    return videoData.slice(0, videosToShow);
  }, [videoData, videosToShow]);
  
  // Handler for video click tracking
  const handleVideoClick = (videoId, videoTitle) => {
    plausible.trackEvent('Video Click', { 
      props: { 
        videoId,
        videoTitle
      }
    });
  };

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
                    onVideoClick={() => handleVideoClick(video.id, video.title)}
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
