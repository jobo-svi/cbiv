import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDraggable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { constructComponent } from "./ComponentFactory";
import GridColumn from "./GridColumn";

const SortableGridColumn = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
        active,
    } = useSortable({
        id: props.id,
        transition: {
            duration: 300, // milliseconds
            easing: "ease",
        },
        data: {
            id: props.id,
            index: props.index,
            rowIndex: props.rowIndex,
            type: props.type,
        },
    });

    const {
        setNodeRef: setResizeNodeRef,
        listeners: resizeListeners,
        attributes: resizeAttributes,
    } = useDraggable({
        id: "resize-" + props.id,
        data: {
            id: props.id,
            index: props.index,
            type: "resize",
            resizePosition: props.index === 0 ? "right" : "left",
        },
    });

    const dragType = active?.data.current.type;
    const [hovered, setHovered] = useState(false);

    // We don't want anything to scale
    if (transform) {
        transform.scaleX = 1;
        transform.scaleY = 1;
    }

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: dragType !== "resize" ? transition : null, // if resizing, the transition defined in CSS takes over
        opacity: isDragging || props.id.includes("placeholder") ? ".5" : 1,
        width: !props.column.gridWidth
            ? `${100 / props.row.columns.length}%`
            : `${props.column.gridWidth}%`,
    };

    const classes = [];
    if (hovered && !active) {
        classes.push("hovered");
    }

    const handleMouseOver = () => {
        setHovered(true);
    };

    const handleMouseOut = () => {
        setHovered(false);
    };

    return (
        <GridColumn
            ref={setNodeRef}
            column={props.column}
            handleMouseOver={handleMouseOver}
            handleMouseOut={handleMouseOut}
            className={classes.join(" ")}
            style={style}
            {...props}
        >
            {constructComponent(props.column)}
            <div
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
                className="drag-handle"
                style={{
                    touchAction: "none",
                    display: hovered && !active ? "" : "none",
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
            </div>
            <div
                className="delete"
                style={{
                    display: hovered && !active ? "" : "none",
                }}
                onClick={() => props.handleDelete(props.id)}
            >
                <FontAwesomeIcon icon="fa-solid fa-trash-can" />
            </div>
            {props.row.columns.length > 1 && (
                <div
                    className={`resize ${props.index !== 0 ? "left" : "right"}`}
                    ref={setResizeNodeRef}
                    {...resizeListeners}
                    {...resizeAttributes}
                    style={{
                        visibility: hovered && !active ? "visible" : "hidden",
                    }}
                >
                    <FontAwesomeIcon icon="fa-solid fa-grip-vertical" />
                </div>
            )}
        </GridColumn>
    );
};

export default SortableGridColumn;
