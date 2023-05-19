import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useCombinedRefs } from "@dnd-kit/utilities";
import GridColumn from "./GridColumn";

// Wrapper component for GridColumn where we wire up all the drag and drop stuff and forward the ref to GridColumn.
// This way, we don't have to generate extra wrapper elements.
const DnDGridColumn = (props) => {
    const { setNodeRef: setDroppableNodeRef, over, isOver } = useDroppable({
        id: props.id,
        data: {
            type: "column",
            rowId: props.row.id,
        },
    });

    const {
        setNodeRef: setDraggableNodeRef,
        node: draggableNode,
        setActivatorNodeRef,
        active,
        listeners,
        attributes,
        isDragging,
    } = useDraggable({
        id: props.id,
        data: { rowId: props.row.id, ...props.data },
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
    let height = null;
    let flexBasis = null;

    // if (isDragging) {
    //     console.log(
    //         dropTargetIndex,
    //         props.rowIndex,
    //         props.relativeHoverPosition
    //     );
    // }
    if (over && dropTargetIndex !== null) {
        const noOfColumns = props.row.columns.length;

        // Which row drag was started from
        const dragStartingLocation = props.items.findIndex((item) =>
            item.columns.find((c) => c.id === active.id)
        );

        let heightOfDraggingElement = (heightOfDraggingElement =
            active.rect.current.initial.height - 2); // -2 is for ignoring the hovering border height

        // If this is the column being dragged
        if (isDragging) {
            // manually set height of the column so that the layout doesn't shift when combining columns
            height = heightOfDraggingElement;

            if (dragStartingLocation - dropTargetIndex < 0) {
                // dragging downward
                if (
                    props.relativeHoverPosition === "center" &&
                    !props.columnTimerActive
                ) {
                    // Number of columns must be gotten from row we're adding to
                    let columnsInDestinationRow =
                        props.items[dropTargetIndex].columns.length;

                    const startingPosition = draggableNode.current.offsetTop;
                    const destinationPosition = document
                        .getElementById(props.items[dropTargetIndex].id)
                        .getBoundingClientRect().top; //over.rect.top;
                    const newPosition = destinationPosition - startingPosition;

                    translateY = newPosition;

                    const columnWidth =
                        (props.gridWidth - 24 * columnsInDestinationRow) /
                        (columnsInDestinationRow + 1);

                    translateX =
                        columnWidth * columnsInDestinationRow +
                        24 * columnsInDestinationRow;

                    let newWidth = `${(props.gridWidth -
                        24 * columnsInDestinationRow) /
                        (columnsInDestinationRow + 1)}px`;
                    flexBasis = newWidth;
                } else {
                    let start = Math.min(dragStartingLocation, dropTargetIndex);
                    let end = Math.max(dragStartingLocation, dropTargetIndex);
                    if (props.relativeHoverPosition !== "bottom") {
                        end -= 1;
                    }

                    for (let i = start + 1; i <= end; i++) {
                        translateY += document
                            .getElementById(props.items[i].id)
                            .getBoundingClientRect().height;
                    }
                }
            } else if (dragStartingLocation - dropTargetIndex > 0) {
                // dragging upward

                if (
                    props.relativeHoverPosition === "center" &&
                    !props.columnTimerActive
                ) {
                    // Number of columns must be gotten from row we're adding to
                    let columnsInDestinationRow =
                        props.items[dropTargetIndex].columns.length;

                    const startingPosition = draggableNode.current.offsetTop;
                    const destinationPosition = document
                        .getElementById(props.items[dropTargetIndex].id)
                        .getBoundingClientRect().top; //over.rect.top;
                    const newPosition = destinationPosition - startingPosition;

                    translateY = newPosition;

                    const columnWidth =
                        (props.gridWidth - 24 * columnsInDestinationRow) /
                        (columnsInDestinationRow + 1);

                    translateX =
                        columnWidth * columnsInDestinationRow +
                        24 * columnsInDestinationRow;

                    let newWidth = `${(props.gridWidth -
                        24 * columnsInDestinationRow) /
                        (columnsInDestinationRow + 1)}px`;
                    flexBasis = newWidth;
                } else {
                    let start = Math.min(dragStartingLocation, dropTargetIndex);
                    let end = Math.max(dragStartingLocation, dropTargetIndex);
                    if (props.relativeHoverPosition !== "top") {
                        start += 1;
                    }
                    for (let i = start; i < end; i++) {
                        translateY -= document
                            .getElementById(props.items[i].id)
                            .getBoundingClientRect().height;
                    }
                }
            }
        }
        // This column is one of the ones NOT being dragged
        else {
            if (
                dropTargetIndex === props.rowIndex &&
                props.relativeHoverPosition === "center" &&
                !props.columnTimerActive
            ) {
                let newWidth = `${(props.gridWidth - 24 * noOfColumns) /
                    (noOfColumns + 1)}px`;
                flexBasis = newWidth;
            }

            if (
                ((dropTargetIndex === props.rowIndex &&
                    props.relativeHoverPosition === "bottom") ||
                    dropTargetIndex > props.rowIndex) &&
                dragStartingLocation <= props.rowIndex
            ) {
                // shift element upward
                translateY = -(heightOfDraggingElement + 24);
            } else if (
                ((dropTargetIndex === props.rowIndex &&
                    props.relativeHoverPosition === "top") ||
                    dropTargetIndex < props.rowIndex) &&
                dragStartingLocation >= props.rowIndex
            ) {
                // shift element downward
                translateY = heightOfDraggingElement + 24;
            }
        }

        style.transition = "transform 300ms ease 0s, flex-basis 300ms ease 0s";
        style.transform = `translate(${translateX}px, ${translateY}px)`;

        if (flexBasis !== null) {
            style.flexBasis = flexBasis;
        }

        if (height !== null) {
            style.height = height;
        }
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
