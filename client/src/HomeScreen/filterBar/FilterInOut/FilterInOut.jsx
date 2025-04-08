import CheckboxSelector from "./checkboxSelector/CheckboxSelector";
import "./filterInOut.css";
import { useState } from "react";

const FilterInOut = ({ checkboxes, setCheckboxes, nameKey, title }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get the names of the actively selected filters (filterValue = 1)
  const selectedFilters = checkboxes
    .filter(item => item.filterValue === 1)
    .map(item => item[nameKey]);
  
  // Get the names of the excluded filters (filterValue = 2)
  const excludedFilters = checkboxes
    .filter(item => item.filterValue === 2)
    .map(item => item[nameKey]);

  return (
    <div className="filter-section">
      <h3 className="filter-title" onClick={toggleCollapse}>
        <div className="title-with-filters">
          <span>{title || `Filter by ${nameKey}`}</span>
          {isCollapsed && (selectedFilters.length > 0 || excludedFilters.length > 0) && (
            <div className="applied-filters">
              {selectedFilters.length > 0 && (
                <span className="included-filters">
                  {selectedFilters.join(', ')}
                </span>
              )}
              {excludedFilters.length > 0 && (
                <span className="excluded-filters">
                  not: {excludedFilters.join(', ')}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="toggle-icon">{isCollapsed ? "+" : "-"}</span>
      </h3>
      {!isCollapsed && (
        <div className="filter-options">
          {checkboxes && checkboxes.length > 0 ? (
            checkboxes.map((filterItem, index) => (
              <CheckboxSelector
                key={`${filterItem[nameKey]}-${index}`}
                filterItem={filterItem}
                checkboxes={checkboxes}
                setCheckboxes={setCheckboxes}
                nameKey={nameKey}
              />
            ))
          ) : (
            <div>Loading filters...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterInOut;
