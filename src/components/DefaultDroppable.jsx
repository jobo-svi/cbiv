import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DefaultDroppable = (props) => {
    const { isOver, setNodeRef } = useDroppable({
        id: "initial-droppable",
        data: {
            rowIndex: 0,
            type: "row",
        },
    });
    return (
        <div>
            <div
                id="initial-droppable"
                ref={setNodeRef}
                className="grid-row"
                style={{
                    height: "100px",
                    borderStyle: "dashed",
                    borderColor: "#A2A2A2",
                }}
            ></div>
        </div>
    );
};

export default DefaultDroppable;
