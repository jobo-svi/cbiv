import React from "react";
import { constructComponent } from "./ComponentFactory";
import DefaultDroppable from "./DefaultDroppable";
import GridRow from "./GridRow";
import DnDGridColumn from "./DnDGridColumn";

const Grid = ({
    items,
    onGridItemClick,
    dropTargetIndex,
    placementPreviewStyle,
    relativeHoverPosition,
    translateTiming,
    columnTimerActive,
    gridGap,
    draggingElement,
}) => {
    function getRowStyle(rowIndex) {
        let style = {};

        const isWithinElement =
            relativeHoverPosition === "center" && rowIndex === dropTargetIndex;

        // Don't apply any transforms if we're not trying to drop anywhere
        if (dropTargetIndex === null) {
            // Not sure why this works, but it prevents the elements from "jumping" when you finish dragging
            if (draggingElement !== null) {
                style.transition = `transform ${translateTiming}ms ease 0s`;
            }

            return style;
        }

        // Hovering within the element and we've waited long enough to combine columns
        if (isWithinElement && !columnTimerActive) {
            style.justifyContent = "unset";
            style.transition = `transform ${translateTiming}ms ease 0s`;
        }
        // Shift rows downward if they're below where we're trying to drop
        else if (
            rowIndex >= dropTargetIndex &&
            relativeHoverPosition !== "center"
        ) {
            style.transition = `transform ${translateTiming}ms ease 0s`;
            style.transform = `translate3d(0px, ${placementPreviewStyle.height +
                gridGap}px, 0px)`;
        }
        // We're waiting on column timer, or cursor is below all elements, so shift all elements back to original position
        else {
            style.transition = `transform ${translateTiming}ms ease 0s`;
            style.transform = `translate3d(0px, 0px, 0px)`;
        }

        return style;
    }

    function getColumnStyle(rowIndex, columnIndex, noOfColumns) {
        let style = {
            transition: `width ${translateTiming}ms ease 0s`,
        };

        // // manually de-transitioning width may not be possible while using flex. Might need to disable flex...?
        // const match = document.getElementById(items[rowIndex]._uid);
        // if (match) {
        //     const rowWidth = match.getBoundingClientRect().width;
        //     console.log("col width", rowWidth / noOfColumns);
        //     style.width = `${rowWidth / 2}px`;
        // }

        const isWithinElement =
            relativeHoverPosition === "center" && rowIndex === dropTargetIndex;
        if (isWithinElement && !columnTimerActive) {
            // There's definitely a better way to get row width, but this will do for now.
            style.flex = "unset";
            const gap = gridGap * noOfColumns;
            const rowWidth = document
                .getElementById(items[rowIndex]._uid)
                .getBoundingClientRect().width;
            const columnWidth = (rowWidth - gap) / (noOfColumns + 1);
            style.width = `${columnWidth}px`;
        }
        return style;
    }

    return (
        <div className="grid-wrapper">
            <div className="grid" style={{ gap: gridGap }}>
                {items.length === 0 && <DefaultDroppable />}
                {items.length > 0 &&
                    items.map((row, rowIndex) => {
                        return (
                            <GridRow
                                id={row._uid}
                                key={row._uid}
                                row={row}
                                style={{
                                    ...getRowStyle(rowIndex),
                                    gap: gridGap,
                                }}
                            >
                                {row.columns.map((item, columnIndex) => {
                                    return (
                                        <DnDGridColumn
                                            id={item._uid}
                                            rowId={row._uid}
                                            key={item._uid}
                                            column={item}
                                            onClick={() =>
                                                onGridItemClick(item)
                                            }
                                            positionStyle={getColumnStyle(
                                                rowIndex,
                                                columnIndex,
                                                row.columns.length
                                            )}
                                        >
                                            {constructComponent(item)}
                                        </DnDGridColumn>
                                    );
                                })}
                            </GridRow>
                        );
                    })}
            </div>
        </div>
    );
};

export default Grid;
