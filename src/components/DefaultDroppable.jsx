import React from "react";
import { useDroppable } from "@dnd-kit/core";

const DefaultDroppable = (props) => {
    const { isOver, setNodeRef } = useDroppable({
        id: "initial-droppable",
        data: {
            rowIndex: 0,
            relativePosition: "below",
            isParentContainer: false,
            isPlaceholder: true,
        },
    });
    return (
        <div style={{ marginLeft: "20px", marginRight: "20px" }}>
            <div
                id="initial-droppable"
                ref={setNodeRef}
                className="grid-row"
                style={{
                    padding: "0px",
                    height: "100px",
                    width: "100%",
                    borderStyle: "dashed",
                    borderColor: "#A2A2A2",
                }}
            ></div>
        </div>
    );
};

export default DefaultDroppable;
