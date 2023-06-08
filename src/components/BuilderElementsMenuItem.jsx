import { useDraggable } from "@dnd-kit/core";
import React from "react";

const BuilderElementsMenuItem = (props) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.id,
        data: props.data,
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ touchAction: "manipulation" }}
        >
            {props.children}
        </div>
    );
};

export default BuilderElementsMenuItem;
