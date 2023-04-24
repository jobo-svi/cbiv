import React from "react";

const ColumnLayout = (props) => {
  console.log(props);

  const colSpan = 12 / props.cols;
  return (
    <div className="column-layout-container">
      <div className="column-layout">
        {[...Array(props.cols)].map((_, i) => {
          const col = props.items.find((item) => item.position === i);
          return (
            <div
              key={i}
              className="column-layout-item"
              style={{ gridColumn: `span ${colSpan}` }}
            >
              {!!col ? col : <div>??</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColumnLayout;
