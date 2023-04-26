import React, { useState } from "react";
import DroppableElement from "./DroppableElement";
import { Components, constructComponent } from "./ComponentFactory";
import uuid from "react-uuid";
import { useDroppable } from "@dnd-kit/core";
import Droppable from "./Droppable";
import SortableItem from "../SortableItem";

const Grid = React.forwardRef(({ items, setItems, onGridItemClick, dropTargetIndex }, ref) => {
    const { isOver, setNodeRef } = useDroppable({
        id: "initial-droppable",
    });

    return (
        <div className="grid-wrapper" ref={ref}>
            <div className="grid">
                {items.length === 0 && (
                    <div
                        id="initial-droppable"
                        ref={setNodeRef}
                        style={{
                            height: "100px",
                            background: isOver ? "#DDE6EF" : "#EBEBEB",
                            borderStyle: "dashed",
                            borderColor: "#393939",
                        }}
                    ></div>
                )}
                {items.length > 0 &&
                    items.map((item, i) => {
                        return (
                            <SortableItem id={item._uid} key={item._uid}>
                                {/* {i === dropTargetIndex && <div className="preview"></div>} */}
                                <div
                                    onClick={() => onGridItemClick(item)}
                                    className={`grid-item`}
                                    id={item._uid}
                                >
                                    {constructComponent(item)}
                                </div>
                                {/* {dropTargetIndex >= items.length && i === items.length - 1 && <div className="preview"></div>} */}
                            </SortableItem>
                        );
                    })}
            </div>
        </div>
    );
});

export default Grid;
