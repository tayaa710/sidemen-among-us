import React, { useState, useEffect } from "react";
import "./filterBar.css";
import FilterInOut from "./filterInOut/FilterInOut";

const FilterBar = ({
  setSorter,
  setSearchQuery,
  playerStats,
  playerCheckboxes,
  setPlayerCheckboxes,
  gameStats,
  roleCheckboxes,
  setRoleCheckboxes,
  mapCheckboxes,
  setMapCheckboxes,
  modeCheckboxes,
  setModeCheckboxes,
  filtersCollapsed,
  toggleFilters
}) => {
  const sortOptions = [
    { value: "mostRecent", label: "Most Recent" },
    { value: "mostPopular", label: "Most Popular" },
    { value: "mostLiked", label: "Most Liked" },
    { value: "oldest", label: "Oldest" },
  ];

  return (
    <div className="filterContainer">
      {/* TITLE AND TOGGLE BUTTON */}
      <div className="filter-header">
        <h2>Filter Videos</h2>
        <button
          className={`filterToggleButton ${filtersCollapsed ? 'collapsed' : ''}`}
          onClick={toggleFilters}
        >
          {filtersCollapsed ? 'Expand Filters' : 'Collapse Filters'}
        </button>
      </div>

      <div className="filter-controls">
        {/* TOP CONTROLS ROW - ALWAYS VISIBLE */}
        <div className="filter-top-controls">
          {/* SORT BY OPTIONS */}
          <div className="filter-sort">
            <label htmlFor="sort-select">Sort by:</label>
            <select id="sort-select" onChange={(e) => setSorter(e.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* USER CAN SEARCH VIDEOS */}
          <div className="filter-search">
            <label htmlFor="search-input">Search:</label>
            <input
              type="text"
              id="search-input"
              placeholder="Search videos..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* FILTER SECTIONS - COLLAPSIBLE BY DEFAULT */}
        {!filtersCollapsed && (
          <div className="filter-sections">
            {/* USER CAN FILTER VIDEOS BASED ON PLAYER - COLLAPSIBLE SECTION */}
            <div className="playerFilter">
              <FilterInOut
                checkboxes={playerCheckboxes}
                setCheckboxes={setPlayerCheckboxes}
                nameKey={"name"}
                title="Filter by Player"
              />
            </div>

          {/* USER CAN FILTER VIDEOS BASED ON GAME MODE - COLLAPSIBLE SECTION */}
          <div className="modeFilter">
              <FilterInOut
                checkboxes={modeCheckboxes}
                setCheckboxes={setModeCheckboxes}
                nameKey={"modename"}
                title="Filter by Game Mode"
              />
            </div>

            {/* USER CAN FILTER VIDEOS BASED ON ROLE - COLLAPSIBLE SECTION */}
            <div className="roleFilter">
              <FilterInOut
                checkboxes={roleCheckboxes}
                setCheckboxes={setRoleCheckboxes}
                nameKey={"rolename"}
                title="Filter by Role"
              />
            </div>

            {/* USER CAN FILTER VIDEOS BASED ON MAP - COLLAPSIBLE SECTION */}
            <div className="mapFilter">
              <FilterInOut
                checkboxes={mapCheckboxes}
                setCheckboxes={setMapCheckboxes}
                nameKey={"mapname"}
                title="Filter by Map"
              />
            </div>
            
          </div>
        )}
        
        {/* DISPLAY ACTIVE FILTERS WHEN COLLAPSED */}
        {filtersCollapsed && (
          <div className="collapsed-filters-summary">
            <div className="active-filters">
              {playerCheckboxes.some(item => item.filterValue > 0) && (
                <div className="filter-category">
                  <span className="category-name">Players:</span>
                  <div className="filter-pills">
                    {playerCheckboxes
                      .filter(item => item.filterValue === 1)
                      .sort((a, b) => b.count - a.count)
                      .map(item => (
                        <span key={item.name} className="included-pill">
                          {item.name}
                          <small className="pill-count">({item.count})</small>
                        </span>
                      ))}
                    {playerCheckboxes
                      .filter(item => item.filterValue === 2)
                      .sort((a, b) => b.count - a.count)
                      .map(item => (
                        <span key={item.name} className="excluded-pill">
                          not: {item.name}
                          <small className="pill-count">({item.count})</small>
                        </span>
                      ))}
                  </div>
                </div>
              )}
              
              {roleCheckboxes.some(item => item.filterValue > 0) && (
                <div className="filter-category">
                  <span className="category-name">Roles:</span>
                  <div className="filter-pills">
                    {roleCheckboxes
                      .filter(item => item.filterValue === 1)
                      .sort((a, b) => b.count - a.count)
                      .map(item => (
                        <span key={item.rolename} className="included-pill">
                          {item.rolename}
                          <small className="pill-count">({item.count})</small>
                        </span>
                      ))}
                    {roleCheckboxes
                      .filter(item => item.filterValue === 2)
                      .sort((a, b) => b.count - a.count)
                      .map(item => (
                        <span key={item.rolename} className="excluded-pill">
                          not: {item.rolename}
                          <small className="pill-count">({item.count})</small>
                        </span>
                      ))}
                  </div>
                </div>
              )}
              
              {mapCheckboxes.some(item => item.filterValue > 0) && (
                <div className="filter-category">
                  <span className="category-name">Maps:</span>
                  <div className="filter-pills">
                    {mapCheckboxes
                      .filter(item => item.filterValue === 1)
                      .sort((a, b) => b.count - a.count)
                      .map(item => (
                        <span key={item.mapname} className="included-pill">
                          {item.mapname}
                          <small className="pill-count">({item.count})</small>
                        </span>
                      ))}
                    {mapCheckboxes
                      .filter(item => item.filterValue === 2)
                      .sort((a, b) => b.count - a.count)
                      .map(item => (
                        <span key={item.mapname} className="excluded-pill">
                          not: {item.mapname}
                          <small className="pill-count">({item.count})</small>
                        </span>
                      ))}
                  </div>
                </div>
              )}
              
              {modeCheckboxes.some(item => item.filterValue > 0) && (
                <div className="filter-category">
                  <span className="category-name">Game Modes:</span>
                  <div className="filter-pills">
                    {modeCheckboxes
                      .filter(item => item.filterValue === 1)
                      .map(item => (
                        <span key={item.modename} className="included-pill">
                          {item.modename}
                          <small className="pill-count">({item.count})</small>
                        </span>
                      ))}
                    {modeCheckboxes
                      .filter(item => item.filterValue === 2)
                      .map(item => (
                        <span key={item.modename} className="excluded-pill">
                          not: {item.modename}
                          <small className="pill-count">({item.count})</small>
                        </span>
                      ))}
                  </div>
                </div>
              )}
              
              {!playerCheckboxes.some(item => item.filterValue > 0) &&
               !roleCheckboxes.some(item => item.filterValue > 0) &&
               !mapCheckboxes.some(item => item.filterValue > 0) &&
               !modeCheckboxes.some(item => item.filterValue > 0) && (
                <span className="no-filters">No filters applied</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
