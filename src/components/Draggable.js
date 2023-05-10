import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDraggable } from "@dnd-kit/core";

const Draggable = (props) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: props.id,
        data: props.data,
    });

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
        <div
            ref={setNodeRef}
            onClick={props.onClick}
            onMouseOver={() => setShowDragHandle(!isDragging)}
            onMouseOut={() => setShowDragHandle(false)}
            id={props.id}
            style={{
                ...draggingStyle,
                ...props.positionStyle,
                ...hoverStyle,
            }}
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
        </div>
    );
};

export default Draggable;
