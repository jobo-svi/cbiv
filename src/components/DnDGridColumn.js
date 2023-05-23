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
        node: droppableNode,
        over,
        isOver,
    } = useDroppable({
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
        transform,
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

    if (
        over &&
        dropTargetIndex !== null &&
        props.relativeHoverPosition !== null
    ) {
        const noOfColumns = props.row.columns.length;

        // Which row drag was started from
        const dragStartingRow = props.items.findIndex((item) =>
            item.columns.find((c) => c.id === active.id)
        );

        const startingRowIsMultiColumn =
            props.items[dragStartingRow].columns.length > 1;

        let heightOfDraggingElement = (heightOfDraggingElement =
            active.rect.current.initial.height - 2); // -2 is for ignoring the hovering border height

        // If this is the column being dragged
        if (isDragging) {
            let start = Math.min(dragStartingRow, dropTargetIndex);
            let end = Math.max(dragStartingRow, dropTargetIndex);
            let isCombining = false;

            // manually set height of the column so that the layout doesn't shift when combining columns
            height = heightOfDraggingElement;

            // Shift the element position into a multicolumn
            if (
                props.relativeHoverPosition === "center" &&
                dragStartingRow - dropTargetIndex !== 0 && // make sure column isn't being dragged over itself
                !props.columnTimerActive
            ) {
                isCombining = true;
                // Number of columns must be gotten from row we're adding to
                let columnsInDestinationRow =
                    props.items[dropTargetIndex].columns.length;

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
            }

            // Shift the dragged element upwards/downwards, accounting for combining columns as well
            if (dragStartingRow - dropTargetIndex < 0) {
                // dragging downward
                if (props.relativeHoverPosition !== "bottom") {
                    end -= 1;
                }

                for (let i = start + 1; i <= end; i++) {
                    translateY += document
                        .getElementById(props.items[i].id)
                        .getBoundingClientRect().height;
                }

                if (isCombining) {
                    translateY += heightOfDraggingElement + 24;
                }
            } else if (dragStartingRow - dropTargetIndex > 0) {
                // dragging upward
                console.log("dragging upward");
                if (props.relativeHoverPosition !== "top") {
                    start += 1;
                }
                for (let i = start; i < end; i++) {
                    translateY -= document
                        .getElementById(props.items[i].id)
                        .getBoundingClientRect().height;
                }

                if (isCombining) {
                    let h = document
                        .getElementById(props.items[dropTargetIndex].id)
                        .getBoundingClientRect().height;
                    translateY -= h;
                }
            }
        }
        // This column is one of the ones NOT being dragged
        else {
            // Row is getting a new column, so adjust the widths of existing columns accordingly
            if (
                dropTargetIndex !== dragStartingRow &&
                dropTargetIndex === props.rowIndex &&
                props.relativeHoverPosition === "center" &&
                !props.columnTimerActive
            ) {
                let newWidth = `${(props.gridWidth - 24 * noOfColumns) /
                    (noOfColumns + 1)}px`;
                flexBasis = newWidth;
            }

            const moveColumnUpward =
                ((dropTargetIndex === props.rowIndex &&
                    props.relativeHoverPosition === "bottom") ||
                    dropTargetIndex > props.rowIndex) &&
                dragStartingRow <= props.rowIndex;

            const moveColumnDownward =
                ((dropTargetIndex === props.rowIndex &&
                    props.relativeHoverPosition === "top") ||
                    dropTargetIndex < props.rowIndex) &&
                dragStartingRow >= props.rowIndex;

            // Dragging an element out of a multicolumn
            const uncombiningColumn = startingRowIsMultiColumn;
            if (uncombiningColumn) {
                // Column is being dragged into its own new row, so other rows should shift.
                // If column is being dragged above its current row, that row will need to shift too.
                if (props.relativeHoverPosition !== "center") {
                    let start =
                        props.relativeHoverPosition === "top"
                            ? dropTargetIndex
                            : dropTargetIndex + 1;
                    if (props.rowIndex >= start) {
                        translateY = heightOfDraggingElement + 24;
                    }
                }
            } else if (moveColumnDownward) {
                // Column is being dragged downward, so shift elements below it upward
                translateY = heightOfDraggingElement + 24;
            } else if (moveColumnUpward) {
                // Column is being dragged upward, so shift elements above it downward
                translateY = -(heightOfDraggingElement + 24);
            }
        }

        style.transition =
            "transform 300ms ease-out 0s, flex-basis 300ms ease-out 0s";
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
            translateY={translateY}
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