import './player.css';
import React, { useState, useRef, useEffect } from 'react';

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num;
};

const Player = ({ stats }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("right");
  const [verticalPosition, setVerticalPosition] = useState("top");
  const hoverTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // Calculate some additional stats
  const winPercentage = Math.round(100 * stats.wins / (stats.wins + stats.losses)) || "NA";
  const kdr = stats.kdr || (stats.kills / stats.deaths).toFixed(2) || "NA";
  const imposterWinPercentage = stats.imposterwin || Math.round(100 * stats.imposterwins / stats.impostergames) || "NA";
  const crewmateWinPercentage = stats.crewmatewin || Math.round(100 * stats.crewmatewins / stats.crewmategames) || "NA";
  
  // Calculate tooltip position when it becomes visible
  useEffect(() => {
    if (!isHovered || !containerRef.current) return;
    
    const calculatePosition = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const tooltipWidth = 330; // Estimated tooltip width
      const tooltipHeight = 450; // Estimated tooltip height
      
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
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      clearTimeout(applyTooltipAdjustment);
    };
  }, [isHovered]);
  
  // Improved hover handlers with delay to prevent flickering
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); // Add a small delay before hiding tooltip
  };
  
  return (
    <div 
      ref={containerRef}
      className="player-card-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="player-card">
        <div className="player-header">
          <h3 className="player-name">{stats.name}</h3>
          <div className={`player-win-indicator ${winPercentage >= 50 ? 'positive' : 'negative'}`}>
            {winPercentage}% Win Rate
          </div>
        </div>
        
        <div className="player-stats">
          <div className="stat-group">
            <div className="stat-item">
              <div className="stat-value">{formatNumber(stats.gamesplayed)}</div>
              <div className="stat-label">Games</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatNumber(stats.wins)}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{kdr}</div>
              <div className="stat-label">K/D</div>
            </div>
          </div>
          
          <div className="role-stats">
            <div className="role-stat imposter">
              <span className="role-icon">🔪</span>
              <span className="role-win">{imposterWinPercentage}%</span>
            </div>
            <div className="role-stat crewmate">
              <span className="role-icon">👨‍🚀</span>
              <span className="role-win">{crewmateWinPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {isHovered && (
        <div 
          ref={tooltipRef}
          className={`player-tooltip tooltip-${tooltipPosition} tooltip-${verticalPosition}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="tooltip-content">
            <h4>{stats.name}'s Stats</h4>
            
            <div className="tooltip-section">
              <h5>Overall</h5>
              <div className="tooltip-stats-grid">
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Games:</div>
                  <div className="tooltip-stat-value">{stats.gamesplayed}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Wins:</div>
                  <div className="tooltip-stat-value">{stats.wins}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Losses:</div>
                  <div className="tooltip-stat-value">{stats.losses}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Win %:</div>
                  <div className="tooltip-stat-value">{winPercentage}%</div>
                </div>
              </div>
            </div>
            
            <div className="tooltip-section">
              <h5>Combat</h5>
              <div className="tooltip-stats-grid">
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Kills:</div>
                  <div className="tooltip-stat-value">{stats.kills}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Deaths:</div>
                  <div className="tooltip-stat-value">{stats.deaths}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">K/D Ratio:</div>
                  <div className="tooltip-stat-value">{kdr}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Kills as Imposter:</div>
                  <div className="tooltip-stat-value">{stats.killsasimposter}</div>
                </div>
              </div>
            </div>
            
            <div className="tooltip-section">
              <h5>Role Performance</h5>
              <div className="tooltip-stats-grid">
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Imposter Games:</div>
                  <div className="tooltip-stat-value">{stats.impostergames}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Imposter Wins:</div>
                  <div className="tooltip-stat-value">{stats.imposterwins}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Imposter Win %:</div>
                  <div className="tooltip-stat-value">{imposterWinPercentage}%</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Crewmate Games:</div>
                  <div className="tooltip-stat-value">{stats.crewmategames}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Crewmate Wins:</div>
                  <div className="tooltip-stat-value">{stats.crewmatewins}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Crewmate Win %:</div>
                  <div className="tooltip-stat-value">{crewmateWinPercentage}%</div>
                </div>
              </div>
            </div>
            
            <div className="tooltip-section">
              <h5>Miscellaneous</h5>
              <div className="tooltip-stats-grid">
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Bodies Reported:</div>
                  <div className="tooltip-stat-value">{stats.bodiesreported}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Emergency Meetings:</div>
                  <div className="tooltip-stat-value">{stats.emergencymeetings}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Voted Out:</div>
                  <div className="tooltip-stat-value">{stats.votedout}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Voted Out First:</div>
                  <div className="tooltip-stat-value">{stats.votedoutfirst}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">First Death:</div>
                  <div className="tooltip-stat-value">{stats.firstdeathofgame}</div>
                </div>
                <div className="tooltip-stat">
                  <div className="tooltip-stat-label">Tasks Completed:</div>
                  <div className="tooltip-stat-value">{stats.taskscompleted}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;