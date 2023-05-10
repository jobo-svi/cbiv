import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { useCombinedRefs } from "@dnd-kit/utilities";
import GridColumn from "./GridColumn";

const DnDGridColumn = (props) => {
    const { setNodeRef: setDroppableNodeRef } = useDroppable({
        id: props.id,
        data: {
            type: "column",
            rowId: props.rowId,
        },
    });

    const {
        setNodeRef: setDraggableNodeRef,
        listeners,
        attributes,
        isDragging,
    } = useDraggable({
        id: props.id,
        data: { rowId: props.rowId, ...props.data },
    });

    const setNodeRef = useCombinedRefs(
        setDroppableNodeRef,
        setDraggableNodeRef
    );

    const [showDragHandle, setShowDragHandle] = useState(false);

    const hoverStyle = {};
    if (showDragHandle) {
        hoverStyle.position = "relative";
        hoverStyle.border = `1px solid #343536`;
        hoverStyle.margin = "-1px";
    }

    const draggingStyle = {};
    if (isDragging) {
        draggingStyle.opacity = ".5";
    }

    return (
        <GridColumn
            ref={setNodeRef}
            showDragHandle={showDragHandle}
            setShowDragHandle={setShowDragHandle}
            hoverStyle={hoverStyle}
            draggingStyle={draggingStyle}
            {...props}
        >
            {props.children}
            <div
                {...listeners}
                {...attributes}
                style={{
                    display: showDragHandle ? "flex" : "none",
                    position: "absolute",
                    right: "0px",
                    top: "50%",
                    transform: "translate(50%, -50%)",
                    background: "#343536",
                    color: "#D7D7D7",
                    zIndex: "1",
                    height: 25,
                    width: 25,
                    borderRadius: "50%",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "18px",
                    cursor: "grab",
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
            </div>
        </GridColumn>
    );
};

export default DnDGridColumn;
