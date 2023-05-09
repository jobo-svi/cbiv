import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDraggable } from "@dnd-kit/core";

const BuilderElementsMenuItem = (props) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.id,
        data: props.data,
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes}>
            {props.children}
        </div>
    );
};

export default BuilderElementsMenuItem;
