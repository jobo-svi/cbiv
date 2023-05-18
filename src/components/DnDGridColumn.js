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

    // let style = {};
    // const dropTargetIndex =
    //     props.dropTargetIndex >= props.items.length
    //         ? props.items.length - 1
    //         : props.dropTargetIndex;
    // let translateY = 0;
    // let translateX = 0;
    // let width = null;
    // let flex = "1";
    // let position = null;
    // let left = null;

    // if (over && dropTargetIndex !== null) {
    //     const gridRow = document.getElementById(over.id);
    //     const noOfColumns = props.items[dropTargetIndex].columns.length;
    //     const rowWidth = gridRow.getBoundingClientRect().width;

    //     const rowIsMultiColumn =
    //         props.items[dropTargetIndex].columns.length > 1;

    //     const dragStartingLocation = props.items.findIndex((item) =>
    //         item.columns.find((c) => c.id === active.id)
    //     );

    //     const dragCurrentLocation = props.items.findIndex((item) =>
    //         item.columns.find((c) => c.id === over.id)
    //     );

    //     let heightOfDraggingElement = 0;
    //     let draggingElement = document.getElementById(active.id);
    //     if (draggingElement) {
    //         heightOfDraggingElement = draggingElement.getBoundingClientRect()
    //             .height;
    //     } else {
    //         heightOfDraggingElement = active.rect.current.initial.height - 2; // -2 is for ignoring the hovering border height
    //     }

    //     // If this is the column being dragged
    //     if (isDragging) {
    //         if (dragStartingLocation - dropTargetIndex < 0) {
    //             // dragging downward
    //             let start = Math.min(dragStartingLocation, dropTargetIndex);
    //             let end = Math.max(dragStartingLocation, dropTargetIndex);

    //             if (props.relativeHoverPosition === "center") {
    //                 //gridRow.style.justifyContent = "unset";

    //                 //position = "absolute";
    //                 translateY = heightOfDraggingElement + 24;
    //                 translateX = 869.34;
    //                 width = "410.6px";
    //                 //flex = "unset";
    //             } else {
    //                 gridRow.style.justifyContent = "space-evenly";

    //                 if (props.relativeHoverPosition !== "bottom") {
    //                     end -= 1;
    //                 }
    //                 for (let i = start + 1; i <= end; i++) {
    //                     translateY +=
    //                         document
    //                             .getElementById(props.items[i].id)
    //                             .getBoundingClientRect().height + 24;
    //                 }
    //             }
    //         } else if (dragStartingLocation - dropTargetIndex > 0) {
    //             // dragging upward
    //             let start = Math.min(dragStartingLocation, dropTargetIndex);
    //             let end = Math.max(dragStartingLocation, dropTargetIndex);

    //             console.log("moving upward");
    //             if (props.relativeHoverPosition !== "top") {
    //                 start += 1;
    //             }

    //             for (let i = start; i < end; i++) {
    //                 translateY -=
    //                     document
    //                         .getElementById(props.items[i].id)
    //                         .getBoundingClientRect().height + 24;
    //             }
    //         }
    //     }
    //     // This column is one of the ones NOT being dragged
    //     else {
    //         if (
    //             dropTargetIndex === props.rowIndex &&
    //             props.relativeHoverPosition === "center"
    //         ) {
    //             gridRow.style.justifyContent = "unset";
    //             flex = "unset";
    //             width = `${(1280 - 24 * noOfColumns) / (noOfColumns + 1)}px`;
    //         }

    //         if (
    //             ((dropTargetIndex === props.rowIndex &&
    //                 props.relativeHoverPosition === "bottom") ||
    //                 dropTargetIndex > props.rowIndex) &&
    //             dragStartingLocation <= props.rowIndex
    //         ) {
    //             // shift element upward
    //             translateY = -(heightOfDraggingElement + 24);
    //         } else if (
    //             ((dropTargetIndex === props.rowIndex &&
    //                 props.relativeHoverPosition === "top") ||
    //                 dropTargetIndex < props.rowIndex) &&
    //             dragStartingLocation >= props.rowIndex
    //         ) {
    //             // shift element downward
    //             translateY = heightOfDraggingElement + 24;
    //         }
    //     }

    //     style.transition = "transform 300ms ease 0s";
    //     style.transform = `translate(${translateX}px, ${translateY}px)`;

    //     if (width !== null) {
    //         style.width = width;
    //     }

    //     if (flex !== null) {
    //         style.flex = flex;
    //     }

    //     if (position !== null) {
    //         style.position = position;
    //     }

    //     if (left !== null) {
    //         style.left = left;
    //     }
    //}

    return (
        <GridColumn
            ref={setNodeRef}
            showDragHandle={showDragHandle}
            setShowDragHandle={setShowDragHandle}
            className={classes.join(" ")}
            // style={style}
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
