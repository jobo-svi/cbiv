import React, { forwardRef } from "react";

const PlacementPreview = forwardRef((props, ref) => {
    return (
        <div id="placement-preview" style={props.style} ref={ref}>
            <div className="overlay"></div>
            {props.children}
        </div>
    );
});

export default PlacementPreview;
