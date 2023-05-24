import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDndContext } from "@dnd-kit/core";

const SortableRow = (props) => {
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
            colIndex: props.colIndex,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            id={props.id}
            style={style}
            {...attributes}
            {...listeners}
        >
            {props.children}
        </div>
    );
};

export default SortableRow;
