import React, { useState, useEffect } from "react";
import { Components, constructComponent } from "./ComponentFactory";
import uuid from "react-uuid";
import Droppable from "./Droppable";
import DefaultDroppable from "./DefaultDroppable";
import SortableItem from "./SortableItem";

const Grid = ({
    items,
    onGridItemClick,
    dropTargetIndex,
    placementPreviewRef,
    relativeHoverPosition,
}) => {
    function getItemStyle(itemIndex) {
        let style = {};

        // if (
        //     relativeHoverPosition === "center" &&
        //     itemIndex === dropTargetIndex
        // ) {
        //     style.border = "1px solid red";
        // } else {
        //     if (
        //         dropTargetIndex !== null &&
        //         itemIndex >= dropTargetIndex &&
        //         placementPreviewRef.current &&
        //         relativeHoverPosition !== "center"
        //     ) {
        //         style.transition = "transform 150ms ease 0s";
        //         style.transform = `translate3d(0px, ${placementPreviewRef
        //             .current.clientHeight + 16}px, 0px)`;
        //     } else if (
        //         dropTargetIndex !== null &&
        //         itemIndex < dropTargetIndex
        //     ) {
        //         style.transition = "transform 150ms ease 0s";
        //     }
        // }

        return style;
    }

    return (
        <div className="grid-wrapper">
            <div className="grid">
                {items.length === 0 && <DefaultDroppable />}
                {items.length > 0 &&
                    items.map((row, i) => {
                        return (
                            <SortableItem
                                id={row._uid}
                                key={row._uid}
                                dropTargetIndex={dropTargetIndex}
                            >
                                <div
                                    className="grid-row"
                                    style={getItemStyle(i)}
                                    id={row._uid}
                                >
                                    {row.columns.map((item, itemIndex) => {
                                        return (
                                            <div
                                                onClick={() =>
                                                    onGridItemClick(item)
                                                }
                                                className={`grid-column`}
                                                id={item._uid}
                                                key={item._uid}
                                            >
                                                {constructComponent(item)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </SortableItem>
                        );
                    })}
            </div>
        </div>
    );
};

export default Grid;
