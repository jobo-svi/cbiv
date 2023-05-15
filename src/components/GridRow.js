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
            id={props.row.id}
            key={props.row.id}
            ref={setNodeRef}
            className="grid-row"
            style={props.style}
        >
            {props.children}
        </div>
    );
};

export default GridRow;
