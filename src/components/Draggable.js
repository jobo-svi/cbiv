import React, { useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";

const Draggable = (props) => {
    const Element = props.element || "div";
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.id,
        data: props.data,
    });

    return (
        <Element ref={setNodeRef} {...listeners} {...attributes}>
            {props.children}
        </Element>
    );
};

export default Draggable;
