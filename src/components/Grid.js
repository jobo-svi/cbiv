import React, { useState, useEffect } from "react";
import { Components, constructComponent } from "./ComponentFactory";
import uuid from "react-uuid";
import Droppable from "./Droppable";
import Draggable from "./Draggable";
import DefaultDroppable from "./DefaultDroppable";

const Grid = ({
    items,
    onGridItemClick,
    dropTargetIndex,
    placementPreviewRef,
    relativeHoverPosition,
}) => {
    // When within element, we should remove flex: 1 from columns, and remove justify content from grid row, measure the width of the row, then set each column width to (row width) / (# of columns + 1)
    function getRowStyle(itemIndex) {
        let style = {};

        const isWithinElement =
            relativeHoverPosition === "center" && itemIndex === dropTargetIndex;

        if (isWithinElement) {
            style.border = "1px solid #343536";
            style.justifyContent = "unset";
            style.transition = "transform 150ms ease 0s";
        } else {
            if (
                dropTargetIndex !== null &&
                itemIndex >= dropTargetIndex &&
                placementPreviewRef.current &&
                relativeHoverPosition !== "center"
            ) {
                style.transition = "transform 150ms ease 0s";
                style.transform = `translate3d(0px, ${placementPreviewRef
                    .current.clientHeight + 16}px, 0px)`;
            } else if (
                dropTargetIndex !== null &&
                itemIndex < dropTargetIndex
            ) {
                style.transition = "transform 150ms ease 0s";
            }
        }

        return style;
    }

    function getColumnStyle(itemIndex, noOfColumns) {
        let style = {};
        const isWithinElement =
            relativeHoverPosition === "center" && itemIndex === dropTargetIndex;

        if (isWithinElement) {
            style.flex = "unset";

            const gap = 16 * noOfColumns;

            // There's definitely a better way to get row width, but this will do for now.
            const rowWidth = document
                .getElementById(items[itemIndex]._uid)
                .getBoundingClientRect().width;
            const columnWidth = (rowWidth - gap) / (noOfColumns + 1);
            style.width = `${columnWidth}px`;
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
                                    style={getRowStyle(i)}
                                    id={row._uid}
                                >
                                    {row.columns.map((item, itemIndex) => {
                                        return (
                                            <Draggable
                                                id={item._uid}
                                                key={item._uid}
                                                className={`grid-column`}
                                                dragHandleEnabled={true}
                                                onClick={() =>
                                                    onGridItemClick(item)
                                                }
                                                style={getColumnStyle(
                                                    i,
                                                    row.columns.length
                                                )}
                                            >
                                                {constructComponent(item)}
                                            </Draggable>
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
