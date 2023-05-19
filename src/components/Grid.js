import React, { forwardRef } from "react";
import { constructComponent } from "./ComponentFactory";
import DefaultDroppable from "./DefaultDroppable";
import GridRow from "./GridRow";
import DnDGridColumn from "./DnDGridColumn";

const Grid = forwardRef(
    (
        {
            items,
            onGridItemClick,
            dropTargetIndex,
            placementPreviewStyle,
            relativeHoverPosition,
            translateTiming,
            columnTimerActive,
            gridGap,
            draggingElement,
        },
        ref
    ) => {
        function getRowStyle(rowIndex) {
            let style = {};

            // const isWithinElement =
            //     relativeHoverPosition === "center" &&
            //     rowIndex === dropTargetIndex;

            // // Don't apply any transforms if we're not trying to drop anywhere
            // if (dropTargetIndex === null) {
            //     // Not sure why this works, but it prevents the elements from "jumping" when you finish dragging
            //     if (draggingElement !== null) {
            //         style.transition = `transform ${translateTiming}ms ease 0s`;
            //     }

            //     return style;
            // }

            // // Hovering within the element and we've waited long enough to combine columns
            // if (isWithinElement && !columnTimerActive) {
            //     style.justifyContent = "unset";
            //     style.transition = `transform ${translateTiming}ms ease 0s`;
            // }
            // // Shift rows downward if they're below where we're trying to drop
            // else if (
            //     rowIndex >= dropTargetIndex &&
            //     relativeHoverPosition !== "center"
            // ) {
            //     style.transition = `transform ${translateTiming}ms ease 0s`;
            //     style.transform = `translate3d(0px, ${placementPreviewStyle.height +
            //         gridGap}px, 0px)`;
            // }
            // // We're waiting on column timer, or cursor is below all elements, so shift all elements back to original position
            // else {
            //     style.transition = `transform ${translateTiming}ms ease 0s`;
            //     style.transform = `translate3d(0px, 0px, 0px)`;
            // }

            return style;
        }

        function getColumnStyle(rowIndex, columnIndex, noOfColumns) {
            let style = {
                transition: `width ${translateTiming}ms ease 0s`,
            };

            // const isWithinElement =
            //     relativeHoverPosition === "center" &&
            //     rowIndex === dropTargetIndex;
            // if (isWithinElement && !columnTimerActive) {
            //     // There's definitely a better way to get row width, but this will do for now.
            //     style.flex = "unset";
            //     const gap = gridGap * noOfColumns;
            //     const rowWidth = document
            //         .getElementById(items[rowIndex].id)
            //         .getBoundingClientRect().width;
            //     const columnWidth = (rowWidth - gap) / (noOfColumns + 1);
            //     style.width = `${columnWidth}px`;
            // }
            return style;
        }

        return (
            <div className="grid-wrapper" ref={ref}>
                <div className="grid">
                    {items.length === 0 && <DefaultDroppable />}
                    {items.length > 0 &&
                        items.map((row, rowIndex) => {
                            return (
                                <GridRow
                                    id={row.id}
                                    key={row.id}
                                    row={row}
                                    style={{
                                        ...getRowStyle(rowIndex),
                                        gap: gridGap,
                                    }}
                                >
                                    {row.columns.map((item, columnIndex) => {
                                        return (
                                            <DnDGridColumn
                                                id={item.id}
                                                key={item.id}
                                                rowIndex={rowIndex}
                                                row={row}
                                                column={item}
                                                items={items}
                                                columnTimerActive={
                                                    columnTimerActive
                                                }
                                                gridWidth={
                                                    ref.current
                                                        ? ref.current
                                                              .clientWidth
                                                        : 0
                                                }
                                                onClick={() =>
                                                    onGridItemClick(item)
                                                }
                                                positionStyle={getColumnStyle(
                                                    rowIndex,
                                                    columnIndex,
                                                    row.columns.length
                                                )}
                                                dropTargetIndex={
                                                    dropTargetIndex
                                                }
                                                relativeHoverPosition={
                                                    relativeHoverPosition
                                                }
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
    }
);

export default Grid;
