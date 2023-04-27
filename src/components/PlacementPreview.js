import React, { forwardRef } from "react";

const PlacementPreview = forwardRef((props, ref) => {
    return (
        <div
            id="placement-preview"
            style={{ position: "relative", ...props.style }}
            ref={ref}
        >
            <div
                style={{
                    position: "absolute",
                    background: "#DDE6EF",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
            ></div>
            {props.children}
        </div>
    );
});

export default PlacementPreview;
