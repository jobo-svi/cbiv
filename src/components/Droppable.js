import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";

const Droppable = (props) => {
    const {
        active,
        over,
        attributes,
        listeners,
        setNodeRef,
        node,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props.id,
        data: {
            id: props.id,
            rowIndex: props.rowIndex,
            relativePosition: props.relativePosition,
        },
    });
    const { collisions } = useDndContext();

    let height = null;
    if (node.current && !props.isPlaceholder && props.activeId) {
        height = node.current.clientHeight;
    }

    return (
        <div
            className="grid-row"
            ref={setNodeRef}
            style={{
                height: height !== null ? `${height}px` : "",
            }}
        >
            {props.children}
        </div>
    );
};

export default Droppable;
