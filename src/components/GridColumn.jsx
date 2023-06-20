import React, { forwardRef } from "react";

const GridColumn = forwardRef((props, ref) => {
    return (
        <div
            id={props.id}
            key={props.id}
            ref={ref}
            className={`grid-column ${props.className}`}
            onMouseOver={props.handleMouseOver}
            onMouseOut={props.handleMouseOut}
            style={{
                ...props.positionStyle,
                ...props.style,
            }}
        >
            {props.children}
        </div>
    );
});

export default GridColumn;
