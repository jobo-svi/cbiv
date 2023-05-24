import React from "react";
import { Components } from "./ComponentFactory";

const Spacer = (props) => {
    return (
        <div
            style={{
                height: props.height || Components.header.defaultHeight,
                background: "#cae4ff",
            }}
        ></div>
    );
};

export default Spacer;
