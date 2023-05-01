import React, { useState, useEffect } from "react";
import { Components, constructComponent } from "./ComponentFactory";
import uuid from "react-uuid";
import Droppable from "./Droppable";
import DefaultDroppable from "./DefaultDroppable";

const Grid = ({
    items,
    onGridItemClick,
    dropTargetIndex,
    placementPreviewRef,
    closestElement,
}) => {
    function getItemStyle(itemIndex) {
        let style = {};
        if (
            closestElement.current &&
            closestElement.current.hoveringWithinCenter &&
            itemIndex === dropTargetIndex
        ) {
            style.border = "1px solid red";
            style.transition = "transform 150ms ease 0s";

            console.log(closestElement.current.relativePositionY);
            if (closestElement.current.relativePositionY === "top") {
                style.transform = `translate3d(0px, ${placementPreviewRef
                    .current.clientHeight + 16}px, 0px)`;
            }
        } else {
            if (
                dropTargetIndex !== null &&
                itemIndex >= dropTargetIndex &&
                placementPreviewRef.current &&
                closestElement &&
                !closestElement.hoveringWithinCenter
            ) {
                style.transition = "transform 150ms ease 0s";
                style.transform = `translate3d(0px, ${placementPreviewRef
                    .current.clientHeight + 16}px, 0px)`;
            } else if (
                dropTargetIndex !== null &&
                itemIndex < dropTargetIndex
            ) {
                console.log(3);
                style.transition = "transform 150ms ease 0s";
            }
        }

        return style;
    }

    return (
        <div className="grid-wrapper">
            <div className="grid">
                {items.length === 0 && <DefaultDroppable />}
                {items.length > 0 &&
                    items.map((row, i) => {
                        return (
                            <Droppable id={row._uid} key={row._uid}>
                                <div
                                    className="grid-row"
                                    style={getItemStyle(i)}
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
                            </Droppable>
                        );
                    })}
            </div>
        </div>
    );
};

export default Grid;
