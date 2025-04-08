import React, { useState, useRef, useEffect, memo } from "react";
import "./video.css";

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num;
};

const formatDuration = (duration) => {
  return duration;
};

const Video = memo(({ title, thumbnail, duration, viewCount, likeCount, players, roles, youtubeUrl }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("right");
  const [verticalPosition, setVerticalPosition] = useState("top");
  const [touchActivated, setTouchActivated] = useState(false);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  
  // Add scroll event listener to close tooltip on scroll for mobile
  useEffect(() => {
    const handleScroll = () => {
      if (touchActivated || isHovered) {
        setTouchActivated(false);
        setIsHovered(false);
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }
    };
    
    // Add touch event to body to allow tapping outside to close
    const handleBodyTouch = (e) => {
      if (isHovered && 
          containerRef.current && 
          !containerRef.current.contains(e.target) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(e.target)) {
        setTouchActivated(false);
        setIsHovered(false);
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }
    };
    
    // Handle touch move events (for scrolling)
    const handleTouchMove = () => {
      if (touchActivated || isHovered) {
        setTouchActivated(false);
        setIsHovered(false);
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.body.addEventListener('touchstart', handleBodyTouch, { passive: true });
    document.body.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('touchstart', handleBodyTouch);
      document.body.removeEventListener('touchmove', handleTouchMove);
    };
  }, [touchActivated, isHovered]);
  
  // Calculate positions when hovering starts - debounced
  useEffect(() => {
    if (!isHovered || !containerRef.current) return;
    
    const calculatePosition = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const tooltipWidth = 300; // Estimated tooltip width
      const tooltipHeight = 400; // Estimated tooltip height
      
      // Horizontal positioning with more margin
      if (rect.right + tooltipWidth + 20 > windowWidth) {
        setTooltipPosition("left");
      } else {
        setTooltipPosition("right");
      }
      
      // Vertical positioning with better edge detection
      if (rect.bottom + tooltipHeight / 2 > windowHeight) {
        // If we're in the bottom portion of the screen
        if (rect.top - tooltipHeight < 0) {
          // Not enough space above either, center it vertically
          setVerticalPosition("center");
        } else {
          setVerticalPosition("bottom");
        }
      } else {
        setVerticalPosition("top");
      }
    };
    
    calculatePosition();
    
    // Apply additional adjustment after tooltip is rendered
    const applyTooltipAdjustment = setTimeout(() => {
      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Fix if tooltip still goes below viewport
        if (tooltipRect.bottom > windowHeight) {
          const adjustment = tooltipRect.bottom - windowHeight + 20;
          tooltipRef.current.style.transform = `translateY(-${adjustment}px)`;
        }
      }
    }, 50);
    
    window.addEventListener('resize', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      clearTimeout(applyTooltipAdjustment);
      if (tooltipRef.current) {
        tooltipRef.current.style.transform = '';
      }
    };
  }, [isHovered]);
  
  // Improved hover handlers with longer delay to prevent flickering
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); // Increased delay for better experience
  };
  
  const handleTouchStart = (e) => {
    // Prevent default only for the first touch to prevent scrolling issues
    if (!touchActivated) {
      e.preventDefault();
      setIsHovered(true);
      setTouchActivated(true);
      
      // Auto-reset touch state after 5 seconds of inactivity
      touchTimeoutRef.current = setTimeout(() => {
        setTouchActivated(false);
        setIsHovered(false);
      }, 5000);
    }
  };
  
  // Clean up touch timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);
  
  const handleVideoClick = (e) => {
    // Prevent opening the URL if the user is interacting with the tooltip
    if (e.target.closest('.video-tooltip')) {
      return;
    }
    
    // For touch devices, only open the URL on second tap
    if (touchActivated) {
      // This is the second tap, so open the link
      if (youtubeUrl) {
        window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
      }
      // Reset the touch state
      setTouchActivated(false);
      setIsHovered(false);
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    } else if (!('ontouchstart' in window)) {
      // For non-touch devices, open immediately
      if (youtubeUrl) {
        window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };
  
  const handleCloseTooltip = (e) => {
    e.stopPropagation();
    setIsHovered(false);
    setTouchActivated(false);
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`video-card-container ${touchActivated ? 'touch-activated' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      <div 
        className="video-card"
        onClick={handleVideoClick}
        style={{ cursor: youtubeUrl ? 'pointer' : 'default' }}
      >
        <div className="video-thumbnail-wrapper">
          <img 
            src={thumbnail} 
            alt={title} 
            className="video-thumbnail" 
            loading="lazy" 
          />
          <div className="video-duration">{formatDuration(duration)}</div>
          
          <div className="video-overlay">
            <div className="video-play-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            </div>
          </div>
          
          {youtubeUrl && (
            <div className="video-youtube-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
              </svg>
              Watch on YouTube
            </div>
          )}
          
          {youtubeUrl && (
            <div className="video-clickable-indicator">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.6 10.5L21 12l-7.5 7.5-7.5-7.5 1.4-1.4 5.1 5.1V4h2v11.7l5.1-5.2z"/>
              </svg>
              Click to watch
            </div>
          )}
        </div>
        
        <div className="video-content">
          <h3 className="video-title">{title}</h3>
          
          <div className="video-stats">
            <div className="video-views">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
              {formatNumber(viewCount)}
            </div>
            <div className="video-likes">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {formatNumber(likeCount)}
            </div>
          </div>
        </div>
      </div>

      {isHovered && (
        <>
          {/* Modal background overlay (mobile only) */}
          <div className="tooltip-modal-overlay" onClick={handleCloseTooltip}></div>
          
          <div 
            ref={tooltipRef}
            className={`video-tooltip tooltip-${tooltipPosition} tooltip-${verticalPosition}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className="tooltip-close-btn" 
              onClick={handleCloseTooltip}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            <div className="tooltip-connector"></div>
            <div className="tooltip-content">
              <h4>{title}</h4>
              
              <div className="tooltip-stats">
                <div><strong>Views:</strong> {formatNumber(viewCount)}</div>
                <div><strong>Likes:</strong> {formatNumber(likeCount)}</div>
                <div><strong>Duration:</strong> {duration}</div>
              </div>
              
              {youtubeUrl && (
                <a 
                  href={youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="tooltip-youtube-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                  </svg>
                  Watch on YouTube
                </a>
              )}
              
              <div className="tooltip-section">
                <h5>Players</h5>
                <div className="tooltip-tags">
                  {players.map((player, index) => (
                    <span key={index} className="tooltip-tag player-tag">{player}</span>
                  ))}
                </div>
              </div>
              
              <div className="tooltip-section">
                <h5>Roles</h5>
                <div className="tooltip-tags">
                  {roles.map((role, index) => (
                    <span key={index} className="tooltip-tag role-tag">{role}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default Video;
