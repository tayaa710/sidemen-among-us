import "./filterBar.css";
import FilterInOut from "./FilterInOut/FilterInOut";
import { useState } from "react";

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
                    {playerCheckboxes.filter(item => item.filterValue === 1).map(item => (
                      <span key={item.name} className="included-pill">{item.name}</span>
                    ))}
                    {playerCheckboxes.filter(item => item.filterValue === 2).map(item => (
                      <span key={item.name} className="excluded-pill">not: {item.name}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {roleCheckboxes.some(item => item.filterValue > 0) && (
                <div className="filter-category">
                  <span className="category-name">Roles:</span>
                  <div className="filter-pills">
                    {roleCheckboxes.filter(item => item.filterValue === 1).map(item => (
                      <span key={item.rolename} className="included-pill">{item.rolename}</span>
                    ))}
                    {roleCheckboxes.filter(item => item.filterValue === 2).map(item => (
                      <span key={item.rolename} className="excluded-pill">not: {item.rolename}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {mapCheckboxes.some(item => item.filterValue > 0) && (
                <div className="filter-category">
                  <span className="category-name">Maps:</span>
                  <div className="filter-pills">
                    {mapCheckboxes.filter(item => item.filterValue === 1).map(item => (
                      <span key={item.mapname} className="included-pill">{item.mapname}</span>
                    ))}
                    {mapCheckboxes.filter(item => item.filterValue === 2).map(item => (
                      <span key={item.mapname} className="excluded-pill">not: {item.mapname}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {!playerCheckboxes.some(item => item.filterValue > 0) &&
               !roleCheckboxes.some(item => item.filterValue > 0) &&
               !mapCheckboxes.some(item => item.filterValue > 0) && (
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
