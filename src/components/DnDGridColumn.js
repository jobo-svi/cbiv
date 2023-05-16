import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useCombinedRefs } from "@dnd-kit/utilities";
import GridColumn from "./GridColumn";

// Wrapper component for GridColumn where we wire up all the drag and drop stuff and forward the ref to GridColumn.
// This way, we don't have to generate extra wrapper elements.
const DnDGridColumn = (props) => {
    const {
        setNodeRef: setDroppableNodeRef,
        over,
        isOver,
        node,
    } = useDroppable({
        id: props.id,
        data: {
            type: "column",
            rowId: props.rowId,
        },
    });

    const {
        setNodeRef: setDraggableNodeRef,
        setActivatorNodeRef,
        active,
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

    let style = {};
    let translateY = 0;
    if (over) {
        const dragStartingLocation = props.items.findIndex((item) =>
            item.columns.find((c) => c.id === active.id)
        );

        const dragCurrentLocation = props.items.findIndex((item) =>
            item.columns.find((c) => c.id === over.id)
        );
        console.log(
            "drag started at",
            dragStartingLocation,
            ", is now at ",
            dragCurrentLocation
        );

        // if (props.rowIndex > draggingIndex) {
        //     translateY = over.rect.height + 24;
        // }
        // if (isDragging) {
        //     const origRowIndex = props.rowIndex;
        //     const newRowIndex = props.items.findIndex((item) =>
        //         item.columns.find((c) => c.id === over.id)
        //     );
        //     const shiftIndex = newRowIndex - origRowIndex;
        //     translateY = (over.rect.height + 24) /* grid gap */ * shiftIndex;
        // } else {
        //     // get height of active element
        //     const heightOfDraggingElement =
        //         active.rect.current.initial.height - 2; // -2 is for the border
        //     const draggingIndex = props.items.findIndex((item) =>
        //         item.columns.find((c) => c.id === active.id)
        //     );
        //     const overRowIndex = props.items.findIndex((item) =>
        //         item.columns.find((c) => c.id === over.id)
        //     );
        //     if (
        //         props.rowIndex >= draggingIndex &&
        //         props.rowIndex <= overRowIndex
        //     ) {
        //         translateY = -(heightOfDraggingElement + 24);
        //     }
        // }
        style = {
            transition: "transform 300ms ease 0s",
            transform: `translateY(${translateY}px)`,
        };
    }

    return (
        <GridColumn
            ref={setNodeRef}
            showDragHandle={showDragHandle}
            setShowDragHandle={setShowDragHandle}
            className={classes.join(" ")}
            style={style}
            {...props}
        >
            {props.children}
            <div
                ref={setActivatorNodeRef}
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
