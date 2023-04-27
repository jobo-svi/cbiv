import React, { useState, useEffect } from "react";
import { Components, constructComponent } from "./ComponentFactory";
import uuid from "react-uuid";
import { useDroppable } from "@dnd-kit/core";
import Droppable from "./Droppable";
import PlacementPreview from "./PlacementPreview";

const Grid = React.forwardRef(
    (
        {
            items,
            setItems,
            onGridItemClick,
            dropTargetIndex,
            placementPreviewStyle,
            draggingElement,
            placementPreviewRef,
        },
        ref
    ) => {
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
                            let style = {};
                            if (
                                dropTargetIndex !== null &&
                                i >= dropTargetIndex &&
                                placementPreviewRef.current
                            ) {
                                style["transition"] = "transform 150ms ease 0s";
                                style[
                                    "transform"
                                ] = `translate3d(0px, ${placementPreviewRef
                                    .current.clientHeight + 12}px, 0px)`;
                            } else if (
                                dropTargetIndex !== null &&
                                i < dropTargetIndex
                            ) {
                                style["transition"] = "transform 150ms ease 0s";
                            }

                            return (
                                <Droppable id={item._uid} key={item._uid}>
                                    <div
                                        onClick={() => onGridItemClick(item)}
                                        className={`grid-item`}
                                        id={item._uid}
                                        style={style}
                                    >
                                        {constructComponent(item)}
                                    </div>
                                </Droppable>
                            );
                        })}
                </div>
            </div>
        );
    }
);

export default Grid;
