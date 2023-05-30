import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GridColumn from "./GridColumn";
import { constructComponent } from "./ComponentFactory";

const SortableGridColumn = (props) => {
    const {
        attributes,
        listeners,
        node,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props.id,
        data: {
            id: props.id,
            index: props.index,
            rowIndex: props.rowIndex,
            relativePosition: props.relativePosition,
        },
    });

    const [showDragHandle, setShowDragHandle] = useState(false);

    // We don't want anything to scale
    if (transform) {
        transform.scaleX = 1;
        transform.scaleY = 1;
    }
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? ".5" : 1,
    };

    const classes = [];
    if (showDragHandle) {
        classes.push("drag-handle-visible");
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
            {constructComponent(props.column)}
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

export default SortableGridColumn;
