import React, { useState, useMemo } from "react";
import Player from "./player/Player";
import './players.css';

const Players = ({ playerStats, roleDescriptions }) => {
  const [showPlayers, setShowPlayers] = useState(false);
  const [sortOption, setSortOption] = useState("wins");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoles, setShowRoles] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState("crewmate");

  // Memoized roles for display
  const allRoles = useMemo(() => {
    if (!roleDescriptions) return [];
    
    // Create a flat array of all roles with their type and description
    const roles = [];
    Object.keys(roleDescriptions).forEach(roleType => {
      Object.entries(roleDescriptions[roleType]).forEach(([roleName, description]) => {
        roles.push({
          name: roleName,
          type: roleType,
          description: description
        });
      });
    });
    
    return roles;
  }, [roleDescriptions]);

  // Filter roles based on search term and selected role type
  const filteredRoles = useMemo(() => {
    if (!allRoles.length) return [];
    
    // First filter by selected role type
    let filtered = allRoles.filter(role => role.type === selectedRoleType);
    
    // Then filter by search term if present (only search in role names)
    if (roleSearchTerm) {
      const searchLower = roleSearchTerm.toLowerCase();
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [allRoles, roleSearchTerm, selectedRoleType]);

  // Group roles by type for display
  const rolesByType = useMemo(() => {
    if (!filteredRoles.length) return {};
    
    return filteredRoles.reduce((acc, role) => {
      if (!acc[role.type]) {
        acc[role.type] = [];
      }
      acc[role.type].push(role);
      return acc;
    }, {});
  }, [filteredRoles]);

  // Memoized sorting function for players
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

      {/* Role Information Section */}
      <div className="roles-section">
        <div className="roles-header">
          <h2 className="roles-title">
            Role Information
            {allRoles.length > 0 && (
              <span className="role-count">({allRoles.length})</span>
            )}
          </h2>
          <button
            className="roles-toggle"
            onClick={() => setShowRoles(!showRoles)}
          >
            {showRoles ? "Hide Roles" : "Show Roles"}
          </button>
        </div>

        {showRoles && roleDescriptions && (
          <div className="roles-content">
            <div className="roles-controls">
              <div className="search-container">
                <input
                  type="text"
                  className="role-search"
                  placeholder="Search role names..."
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
                />
                {roleSearchTerm && (
                  <button 
                    className="clear-search" 
                    onClick={() => setRoleSearchTerm("")}
                  >
                    ×
                  </button>
                )}
              </div>
              
              <div className="role-type-filters">
                <button
                  className={`role-type-filter ${selectedRoleType === 'crewmate' ? 'active' : ''} type-crewmate`}
                  onClick={() => setSelectedRoleType('crewmate')}
                >
                  Crewmate
                </button>
                <button
                  className={`role-type-filter ${selectedRoleType === 'impostor' ? 'active' : ''} type-impostor`}
                  onClick={() => setSelectedRoleType('impostor')}
                >
                  Impostor
                </button>
                <button
                  className={`role-type-filter ${selectedRoleType === 'neutral' ? 'active' : ''} type-neutral`}
                  onClick={() => setSelectedRoleType('neutral')}
                >
                  Neutral
                </button>
              </div>
            </div>

            {Object.keys(rolesByType).length === 0 ? (
              <div className="no-roles-message">
                {roleSearchTerm 
                  ? "No roles match your search" 
                  : "No role data available"}
              </div>
            ) : (
              <div className="roles-grid">
                {Object.entries(rolesByType).map(([type, roles]) => (
                  <div key={type} className="role-type-section">
                    <h3 className={`role-type-heading role-type-${type}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)} Roles
                      <span className="role-type-count">({roles.length})</span>
                    </h3>
                    <div className="roles-list">
                      {roles.map(role => (
                        <div key={role.name} className="role-card">
                          <h4 className="role-name">{role.name}</h4>
                          <div className="role-description-text">
                            {role.description.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;
