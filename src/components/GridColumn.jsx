import React, { forwardRef, useRef } from "react";

const GridColumn = forwardRef(
    (
        {
            id,
            children,
            column,
            className,
            handleMouseOver,
            handleMouseOut,
            style,
        },
        ref
    ) => {
        return (
            <div
                id={id}
                key={id}
                ref={ref}
                className={`grid-column ${className}`}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                style={{
                    ...style,
                    ...(column.props.style ? column.props.style : {}),
                    minHeight: "100",
                }}
            >
                {children}
            </div>
        );
    }
);

export default GridColumn;
