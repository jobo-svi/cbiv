import { useEffect, useState, forwardRef, useMemo } from "react";

const CustomGridItem = forwardRef(
  ({ style, className, onMouseDown, onMouseUp, onTouchEnd, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{ ...style }}
        className={className}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        {...props}
      >
        {props.children}
      </div>
    );
  }
);

export default CustomGridItem;
