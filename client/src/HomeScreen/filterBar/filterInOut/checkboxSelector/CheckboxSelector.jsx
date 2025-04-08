import "./checkboxSelector.css";

const CheckboxSelector = ({ filterItem, checkboxes, setCheckboxes, nameKey }) => {
  // Get the actual value to display
  const displayValue = filterItem[nameKey];

  const handleCheckboxClick = (name) => {
    console.log(`Clicked ${nameKey} checkbox:`, name);
    setCheckboxes((prevState) =>
      prevState.map((item) => {
        if (item[nameKey] === name) {
          console.log(`Updating ${nameKey} checkbox:`, item[nameKey], "from", item.filterValue, "to", (item.filterValue + 1) % 3);
          return { ...item, filterValue: (item.filterValue + 1) % 3 };
        }
        return item;
      })
    );
  };

  // Function to render the checkbox icon based on the state
  const renderCheckboxIcon = (state) => {
    if (state === 1) return "✅";
    if (state === 2) return "❌";
    return <span className="blank"></span>;
  };

  return (
    <div
      className="playerCheckbox"
      onClick={() => handleCheckboxClick(displayValue)}
    >
      <span className="checkboxIcon">
        {(() => {
          const currentFilter = checkboxes.find(
            (filter) => filter[nameKey] === displayValue
          );
          const filterValue = currentFilter ? currentFilter.filterValue : 0;
          return renderCheckboxIcon(filterValue);
        })()}
      </span>
      <label htmlFor={`filter-${displayValue}`}>{displayValue}</label>
    </div>
  );
};

export default CheckboxSelector;
