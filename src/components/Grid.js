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
            relativeHoverPosition,
            columnTimerActive,
            gridGap,
        },
        ref
    ) => {
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
