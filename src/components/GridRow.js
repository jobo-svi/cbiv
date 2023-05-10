import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";

const GridRow = (props) => {
    const { setNodeRef } = useDroppable({
        id: props.id,
        data: {
            type: "row",
        },
    });

    return (
        <div
            id={props.row._uid}
            key={props.row._uid}
            ref={setNodeRef}
            className="grid-row"
            style={props.style}
        >
            {props.children}
        </div>
    );
};

export default GridRow;
