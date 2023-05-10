import React, { forwardRef } from "react";

const GridColumn = forwardRef((props, ref) => {
    return (
        <div
            id={props.column._uid}
            key={props.column._uid}
            ref={ref}
            className="grid-column"
            onMouseOver={() => props.setShowDragHandle(true)}
            onMouseOut={() => props.setShowDragHandle(false)}
            style={{
                ...props.draggingStyle,
                ...props.positionStyle,
                ...props.hoverStyle,
            }}
        >
            {props.children}
        </div>
    );
});

export default GridColumn;
