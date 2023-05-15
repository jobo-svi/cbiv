import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useCombinedRefs } from "@dnd-kit/utilities";
import GridColumn from "./GridColumn";

// Wrapper component for GridColumn where we wire up all the drag and drop stuff and forward the ref to GridColumn.
// This way, we don't have to generate extra wrapper elements.
const DnDGridColumn = (props) => {
    const { setNodeRef: setDroppableNodeRef } = useDroppable({
        id: props.id,
        data: {
            type: "column",
            rowId: props.rowId,
        },
    });

    const {
        setNodeRef: setDraggableNodeRef,
        listeners,
        attributes,
        isDragging,
    } = useDraggable({
        id: props.id,
        data: { rowId: props.rowId, ...props.data },
    });

    // This component is both draggable and droppable, so we have to combine the refs into one.
    const setNodeRef = useCombinedRefs(
        setDroppableNodeRef,
        setDraggableNodeRef
    );

    const [showDragHandle, setShowDragHandle] = useState(false);

    const classes = [];

    if (showDragHandle) {
        classes.push("drag-handle-visible");
    }

    // Leave the component in its original location, but grayed-out, while moving it.
    if (isDragging) {
        classes.push("dragging");
    }

    return (
        <GridColumn
            ref={setNodeRef}
            showDragHandle={showDragHandle}
            setShowDragHandle={setShowDragHandle}
            className={classes.join(" ")}
            {...props}
        >
            {props.children}
            <div
                {...listeners}
                {...attributes}
                className="drag-handle"
                style={{
                    display: showDragHandle ? "" : "none",
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
            </div>
        </GridColumn>
    );
};

export default DnDGridColumn;
