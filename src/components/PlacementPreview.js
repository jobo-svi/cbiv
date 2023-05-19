import React, { useEffect, forwardRef } from "react";

const PlacementPreview = forwardRef((props, ref) => {
    return (
        <div id="placement-preview" ref={ref} style={{ ...props.style }}>
            <div className="overlay"></div>
            <div style={{ visibility: "hidden" }}>{props.children}</div>
        </div>
    );
});

export default PlacementPreview;
