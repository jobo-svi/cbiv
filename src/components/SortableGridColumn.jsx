import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDraggable } from "@dnd-kit/core";
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
        active: sortIsActive,
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
        transform: resizeTransform,
    } = useDraggable({
        id: "resize-" + props.id,
        data: {
            id: props.id,
            index: props.index,
            type: "resize",
        },
    });

    const [hovered, setHovered] = useState(false);

    // We don't want anything to scale
    if (transform) {
        transform.scaleX = 1;
        transform.scaleY = 1;
    }

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition,
        opacity: isDragging || props.id.includes("placeholder") ? ".5" : 1,
    };

    const resizeStyle = {
        transform: CSS.Translate.toString(resizeTransform),
    };

    const classes = [];
    if (hovered && !sortIsActive) {
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
                    display: hovered && !sortIsActive ? "" : "none",
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
            </div>
            <div
                className="delete"
                style={{
                    display: hovered && !sortIsActive ? "" : "none",
                }}
                onClick={() => props.handleDelete(props.id)}
            >
                <FontAwesomeIcon icon="fa-solid fa-trash-can" />
            </div>
            <div
                className="resize"
                ref={setResizeNodeRef}
                {...resizeListeners}
                {...resizeAttributes}
                style={{
                    ...resizeStyle,
                    visibility: hovered && !sortIsActive ? "visible" : "hidden",
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-grip-vertical" />
            </div>
        </GridColumn>
    );
};

export default SortableGridColumn;
