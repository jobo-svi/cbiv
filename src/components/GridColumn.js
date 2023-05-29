import React, { forwardRef } from "react";

const GridColumn = forwardRef((props, ref) => {
  return (
    <div
      id={props.id}
      key={props.id}
      ref={ref}
      className={`grid-column ${props.className}`}
      onMouseOver={() => props.setShowDragHandle(true)}
      onMouseOut={() => props.setShowDragHandle(false)}
      style={{
        ...props.positionStyle,
        ...props.style,
      }}
      data-translate-y={props.translateY}
    >
      {props.children}
    </div>
  );
});

export default GridColumn;
