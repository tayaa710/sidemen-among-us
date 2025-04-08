import React, { useState, useMemo } from "react";
import Player from "./player/Player";
import './players.css';

const Players = ({ playerStats }) => {
  const [showPlayers, setShowPlayers] = useState(false);
  const [sortOption, setSortOption] = useState("wins");
  const [searchTerm, setSearchTerm] = useState("");

  // Memoized sorting function
  const sortedPlayers = useMemo(() => {
    if (!playerStats || !playerStats.length) return [];

    // Filter by search term first
    const filteredPlayers = searchTerm 
      ? playerStats.filter(player => 
          player.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : playerStats;

    // Then sort by selected option
    return [...filteredPlayers].sort((a, b) => {
      switch (sortOption) {
        case "wins":
          return b.wins - a.wins;
        case "winRate":
          const aWinRate = a.wins / (a.wins + a.losses) || 0;
          const bWinRate = b.wins / (b.wins + b.losses) || 0;
          return bWinRate - aWinRate;
        case "kdr":
          const aKdr = a.kdr || (a.kills / a.deaths) || 0;
          const bKdr = b.kdr || (b.kills / b.deaths) || 0;
          return bKdr - aKdr;
        case "gamesPlayed":
          return b.gamesplayed - a.gamesplayed;
        case "alphabetical":
          return a.name.localeCompare(b.name);
        default:
          return b.wins - a.wins;
      }
    });
  }, [playerStats, sortOption, searchTerm]);

  return (
    <div className="players-wrapper">
      <div className="players-header">
        <h2 className="players-title">
          Players <span className="player-count">({playerStats.length})</span>
        </h2>
        <button
          className="players-toggle"
          onClick={() => setShowPlayers(!showPlayers)}
        >
          {showPlayers ? "Hide Players" : "Show Players"}
        </button>
      </div>

      {showPlayers && (
        <div className="players-content">
          <div className="players-controls">
            <div className="search-container">
              <input
                type="text"
                className="player-search"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="sort-container">
              <label htmlFor="player-sort">Sort by:</label>
              <select
                id="player-sort"
                className="player-sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="wins">Total Wins</option>
                <option value="winRate">Win Rate</option>
                <option value="kdr">K/D Ratio</option>
                <option value="gamesPlayed">Games Played</option>
                <option value="alphabetical">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="players-grid">
            {sortedPlayers.length > 0 ? (
              sortedPlayers.map((player) => (
                <Player stats={player} key={player.id || player.name} />
              ))
            ) : (
              <div className="no-players-message">
                {searchTerm 
                  ? "No players match your search" 
                  : "No player data available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
