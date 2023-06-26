import { forwardRef, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableGridColumn from "./SortableGridColumn";
import SortableRow from "./SortableRow";
import DefaultDroppable from "./DefaultDroppable";

const VirtualizedGrid = forwardRef(({ items, activeId, handleDelete }, ref) => {
    const parentRef = useRef(null);
    const count = items.length;
    const virtualizer = useVirtualizer({
        count,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 45,
        overscan: 5,
    });
    const vItems = virtualizer.getVirtualItems();

    return (
        <SortableContext
            items={items.map((row) => row.id)}
            strategy={verticalListSortingStrategy}
        >
            <div ref={parentRef} className="virtualize-container">
                <div
                    className="virtualize-inner-container"
                    style={{
                        height: virtualizer.getTotalSize(),
                    }}
                >
                    <div
                        className="virtualize-inner-scroller"
                        style={{
                            transform: `translateY(${
                                vItems.length > 0 ? vItems[0].start : 0
                            }px)`,
                        }}
                    >
                        <div className="grid-wrapper" ref={ref}>
                            {items.length === 0 && <DefaultDroppable />}
                            {items.length > 0 &&
                                vItems.map((virtualRow) => {
                                    const row = items[virtualRow.index];
                                    const rowIndex = virtualRow.index;
                                    return (
                                        <div
                                            key={row.id}
                                            data-index={virtualRow.index}
                                            ref={virtualizer.measureElement}
                                        >
                                            <SortableRow
                                                id={row.id}
                                                activeId={activeId}
                                                items={items}
                                                rowIndex={rowIndex}
                                                type="row"
                                            >
                                                <SortableContext
                                                    items={row.columns.map(
                                                        (col) => col.id
                                                    )}
                                                    strategy={
                                                        horizontalListSortingStrategy
                                                    }
                                                >
                                                    {items[
                                                        rowIndex
                                                    ].columns.map(
                                                        (column, colIndex) => {
                                                            return (
                                                                <SortableGridColumn
                                                                    id={
                                                                        column.id
                                                                    }
                                                                    key={
                                                                        column.id
                                                                    }
                                                                    index={
                                                                        colIndex
                                                                    }
                                                                    rowIndex={
                                                                        rowIndex
                                                                    }
                                                                    row={row}
                                                                    column={
                                                                        column
                                                                    }
                                                                    type="column"
                                                                    handleDelete={
                                                                        handleDelete
                                                                    }
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </SortableContext>
                                            </SortableRow>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </SortableContext>
    );
});

export default VirtualizedGrid;
