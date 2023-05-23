import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDndContext } from "@dnd-kit/core";

const SortableItem = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props.id,
        data: {
            id: props.id,
            index: props.index,
        },
    });

    const { collisions } = useDndContext();

    let isHovered = false;
    if (collisions) {
        let c = collisions.find((collision) => collision.id === props.id);
        if (c && c.data) {
            isHovered = c.data.hovered;
        }
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? ".5" : 1,
        //background: isHovered ? "gray" : "",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </div>
    );
};

export default SortableItem;
