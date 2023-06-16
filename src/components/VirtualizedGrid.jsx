import { useCallback, useRef } from "react";
import { useVirtualizer, defaultRangeExtractor } from "@tanstack/react-virtual";
import {
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Droppable from "./Droppable";
import SortableGridColumn from "./SortableGridColumn";
import SortableRow from "./SortableRow";

const VirtualizedGrid = ({ items, activeId }) => {
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
                            transform: `translateY(${vItems[0].start}px)`,
                        }}
                    >
                        {vItems.map((virtualRow) => {
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
                                        {/* <Droppable
                                            id={row.id}
                                            activeId={activeId}
                                            items={items}
                                            rowIndex={rowIndex}
                                        > */}
                                        <SortableContext
                                            items={row.columns.map(
                                                (col) => col.id
                                            )}
                                            strategy={
                                                horizontalListSortingStrategy
                                            }
                                        >
                                            {items[rowIndex].columns.map(
                                                (column, colIndex) => {
                                                    return (
                                                        <SortableGridColumn
                                                            id={column.id}
                                                            key={column.id}
                                                            index={colIndex}
                                                            rowIndex={rowIndex}
                                                            column={column}
                                                            type="column"
                                                        />
                                                    );
                                                }
                                            )}
                                        </SortableContext>
                                        {/* </Droppable> */}
                                    </SortableRow>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </SortableContext>
    );
};

export default VirtualizedGrid;
