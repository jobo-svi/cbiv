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
    const dropTargetIndex =
        props.dropTargetIndex >= props.items.length
            ? props.items.length - 1
            : props.dropTargetIndex;
    let translateY = 0;
    let translateX = 0;

    if (over && dropTargetIndex !== null) {
        const rowIsMultiColumn =
            props.items[dropTargetIndex].columns.length > 1;

        const dragStartingLocation = props.items.findIndex((item) =>
            item.columns.find((c) => c.id === active.id)
        );

        const dragCurrentLocation = props.items.findIndex((item) =>
            item.columns.find((c) => c.id === over.id)
        );

        const heightOfDraggingElement = active.rect.current.initial.height - 2; // -2 is for ignoring the hovering border height

        // If this is the column being dragged
        if (isDragging) {
            console.log({
                rowIndex: props.rowIndex,
                dropTargetIndex: dropTargetIndex,
                hoverPosition: props.relativeHoverPosition,
                dragStart: dragStartingLocation,
            });
            // Column being dragged is not in center of another column
            //if (props.relativeHoverPosition !== "center") {
            //Element is being moved upward, sum up the heights of elements between old position and new
            if (
                dropTargetIndex < dragStartingLocation &&
                props.relativeHoverPosition === "top"
            ) {
                for (let i = dropTargetIndex; i < dragStartingLocation; i++) {
                    translateY -=
                        document
                            .getElementById(props.items[i].id)
                            .getBoundingClientRect().height + 24;
                }
            } else if (
                rowIsMultiColumn &&
                props.relativeHoverPosition === "top"
            ) {
                style.position = "absolute";
                style.top = "0";
                style.left = "0";
                style.width = "1280px";

                node.current.style.position = "absolute";
                node.current.style.top = "0";
                node.current.style.left = "0";
                node.current.style.width = "1280px";
                const newRowHeight = node.current.getBoundingClientRect()
                    .height;

                // for (
                //     let i = dragStartingLocation;
                //     i <= props.items.length - 1;
                //     i++
                // ) {
                //     translateY += newRowHeight + 24;
                // }
            } else if (
                dropTargetIndex > dragStartingLocation &&
                props.relativeHoverPosition === "bottom"
            ) {
                // Element is being moved downward, sum up the heights of elements between old position and new
                for (
                    let i = dragStartingLocation + 1;
                    i <= dropTargetIndex;
                    i++
                ) {
                    translateY +=
                        document
                            .getElementById(props.items[i].id)
                            .getBoundingClientRect().height + 24;
                }
            }
            //}
        }
        // This column is one of the ones NOT being dragged
        else {
            if (
                dropTargetIndex === props.rowIndex &&
                props.relativeHoverPosition === "bottom" &&
                dragStartingLocation <= props.rowIndex
            ) {
                // swap element upward
                translateY = -(heightOfDraggingElement + 24);
            } else if (
                dropTargetIndex === props.rowIndex &&
                props.relativeHoverPosition === "top" &&
                dragStartingLocation >= props.rowIndex
            ) {
                // swap element downward
                translateY = heightOfDraggingElement + 24;
            }
        }

        style.transition = "transform 300ms ease 0s";
        style.transform = `translate(${translateX}px, ${translateY}px)`;
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
