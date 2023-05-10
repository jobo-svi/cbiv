import React from "react";
import { useDroppable } from "@dnd-kit/core";

const Droppable = (props) => {
    const { setNodeRef } = useDroppable({
        id: props.id,
        data: {
            type: props.type,
        },
    });

    return (
        <div className={props.className} ref={setNodeRef}>
            {props.children}
        </div>
    );
};

export default Droppable;
