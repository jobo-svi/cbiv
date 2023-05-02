import React, { useEffect, useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const Draggable = (props) => {
    const Element = props.element || "div";
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.id,
        data: props.data,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <Element ref={setNodeRef} {...listeners} {...attributes}>
            {props.children}
        </Element>
    );
};

export default Draggable;
