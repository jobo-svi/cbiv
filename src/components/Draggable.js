import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDraggable } from "@dnd-kit/core";

const Draggable = (props) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.id,
        data: props.data,
    });
    const dragHandleEnabled = props.dragHandleEnabled;
    const [showDragHandle, setShowDragHandle] = useState(false);

    const parentStyles = {};
    if (dragHandleEnabled && showDragHandle) {
        parentStyles.position = "relative";
        parentStyles.border = `1px solid #343536`;
    }
    return (
        <div
            ref={setNodeRef}
            onClick={props.onClick}
            onMouseOver={() => setShowDragHandle(true)}
            onMouseOut={() => setShowDragHandle(false)}
            id={props.id}
            className={props.className}
            style={{ ...props.style, ...parentStyles }}
            {...listeners}
            {...attributes}
        >
            {props.children}
            {dragHandleEnabled && showDragHandle && (
                <div
                    style={{
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
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "18px",
                    }}
                >
                    <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
                </div>
            )}
        </div>
    );
};

Draggable.defaultProps = {
    dragHandleEnabled: false,
};

export default Draggable;
