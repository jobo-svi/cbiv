import React, { useState } from "react";
import DroppableElement from "./DroppableElement";
import { Components, constructComponent } from "./ComponentFactory";
import uuid from "react-uuid";
import { useDroppable } from "@dnd-kit/core";
import Droppable from "./Droppable";

const Grid = React.forwardRef(({ items, setItems, onGridItemClick }, ref) => {
    const { isOver, setNodeRef } = useDroppable({
        id: "initial-droppable",
    });

    const style = {
        color: isOver ? "green" : undefined,
    };

    return (
        <div className="grid-wrapper" ref={ref}>
            <div className="grid">
                {items.length === 0 && (
                    <div
                        id="initial-droppable"
                        ref={setNodeRef}
                        style={{
                            height: "100px",
                            background: isOver ? "#FFF" : "#EBEBEB",
                            borderStyle: "dashed",
                            borderColor: "#393939",
                        }}
                    ></div>
                )}
                {items.length > 0 &&
                    items.map((item) => {
                        return (
                            <Droppable id={item._uid} key={item._uid}>
                                <div
                                    onClick={() => onGridItemClick(item)}
                                    className="grid-item"
                                    id={item._uid}
                                >
                                    {constructComponent(item)}
                                </div>
                            </Droppable>
                        );
                    })}
            </div>
        </div>
    );
});

export default Grid;
