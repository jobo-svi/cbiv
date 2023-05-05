import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DefaultDroppable = (props) => {
    const { isOver, setNodeRef } = useDroppable({
        id: "initial-droppable",
    });
    return (
        <div
            id="initial-droppable"
            ref={setNodeRef}
            style={{
                height: "100px",
                background: isOver ? "#cae4ff" : "#FFF",
                borderStyle: "dashed",
                borderColor: "#A2A2A2",
            }}
        ></div>
    );
};

export default DefaultDroppable;