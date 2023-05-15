import React, { forwardRef } from "react";

const GridColumn = forwardRef((props, ref) => {
    return (
        <div
            id={props.column.id}
            key={props.column.id}
            ref={ref}
            className={`grid-column ${props.className}`}
            onMouseOver={() => props.setShowDragHandle(true)}
            onMouseOut={() => props.setShowDragHandle(false)}
            style={{
                ...props.positionStyle,
            }}
        >
            {props.children}
        </div>
    );
});

export default GridColumn;
