import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
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
        data: {
            id: props.id,
            index: props.index,
            rowIndex: props.rowIndex,
            type: props.type,
        },
    });

    const [showDragHandle, setShowDragHandle] = useState(false);
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
            showDragHandle={showDragHandle}
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
        </GridColumn>
    );
};

export default SortableGridColumn;
