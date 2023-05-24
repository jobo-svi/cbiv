import React from "react";
import { useSortable } from "@dnd-kit/sortable";

const Droppable = (props) => {
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
            rowIndex: props.rowIndex,
        },
    });

    return (
        <div className="grid-row" ref={setNodeRef}>
            {props.children}
        </div>
    );
};

export default Droppable;
