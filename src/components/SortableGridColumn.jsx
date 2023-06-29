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
        id: props.column.id,
        disabled: props.editId !== null,
        transition: {
            duration: 300, // milliseconds
            easing: "ease",
        },
        data: {
            id: props.column.id,
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
        id: "resize-" + props.column.id,
        data: {
            id: props.column.id,
            index: props.index,
            type: "resize",
            resizePosition: props.index === 0 ? "right" : "left",
        },
    });

    const dragType = active?.data.current.type;
    const [columnStatus, setColumnStatus] = useState("idle");

    // We don't want anything to scale
    if (transform) {
        transform.scaleX = 1;
        transform.scaleY = 1;
    }

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: dragType !== "resize" ? transition : null, // if resizing, the transition defined in CSS takes over
        opacity:
            isDragging || props.column.id.includes("placeholder") ? ".5" : 1,
        width: !props.column.gridWidth
            ? `${100 / props.row.columns.length}%`
            : `${props.column.gridWidth}%`,
    };

    const classes = [];
    if (columnStatus === "hovered" && !active) {
        classes.push("hovered");
    }

    return (
        <div
            id={props.column.id}
            key={props.column.id}
            ref={setNodeRef}
            className={`grid-column ${classes.join(" ")}`}
            onClick={() => {
                props.setEditId(props.column.id);
            }}
            onMouseOver={() => setColumnStatus("hovered")}
            onMouseOut={() => setColumnStatus("idle")}
            style={{
                ...style,
                ...(props.column.props.style ? props.column.props.style : {}),
            }}
        >
            {constructComponent(props.column)}
            <div
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
                className="drag-handle"
                style={{
                    touchAction: "none",
                    display:
                        props.editId === null &&
                        columnStatus === "hovered" &&
                        !active
                            ? ""
                            : "none",
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
            </div>
            <div
                className="delete"
                style={{
                    display:
                        props.editId === null &&
                        columnStatus === "hovered" &&
                        !active
                            ? ""
                            : "none",
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    props.handleDelete(props.column.id);
                }}
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
                        visibility:
                            props.editId === null &&
                            columnStatus === "hovered" &&
                            !active
                                ? "visible"
                                : "hidden",
                    }}
                >
                    <FontAwesomeIcon icon="fa-solid fa-grip-vertical" />
                </div>
            )}
        </div>
    );
};

export default SortableGridColumn;
