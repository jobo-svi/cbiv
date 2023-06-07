import React, { useState, useEffect, useRef, useCallback } from "react";

import { createPortal } from "react-dom";

import { Virtuoso } from "react-virtuoso";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    pointerWithin,
    rectIntersection,
    getFirstCollision,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import uuid from "react-uuid";
import BuilderElementsMenu from "./BuilderElementsMenu";
import BuilderNavbar from "./BuilderNavbar";
import { Components, constructComponent } from "./ComponentFactory";
import { data } from "../data";
import "../css/App.css";
import { snapDragHandleToCursor } from "../modifiers/snapDragHandleToCursor";
import DebugValues from "./DebugValues";
import Droppable from "./Droppable";
import SortableGridColumn from "./SortableGridColumn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DefaultDroppable from "./DefaultDroppable";
import { useBuilderHistory, undoHistory } from "../hooks/useBuilderHistory";

const PageBuilder = () => {
    // The lesson elements
    // const [items, setItems] = useState(
    //     JSON.parse(localStorage.getItem("builder-session")) ??
    //         data.content.body ??
    //         []
    // );
    const [items, setItems] = useState(data.content.body);

    const [activeId, setActiveId] = useState(null);
    const lastOverId = useRef(null);
    const recentlyMovedToNewContainer = useRef(false);
    const columnTimerId = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [itemToEdit, setItemToEdit] = useState(null);

    // Configurable debug settings
    const [slopTiming, setSlopTiming] = useState(
        +localStorage.getItem("slopTiming") || 150
    );

    const [translateTiming, setTranslateTiming] = useState(
        +localStorage.getItem("translateTiming") || 300
    );

    const [columnDelayTiming, setColumnDelayTiming] = useState(
        +localStorage.getItem("columnDelayTiming") || 1000
    );

    const [gridGap, setGridGap] = useState(
        +localStorage.getItem("gridGap") || 24
    );

    const [hasHistory, setHasHistory] = useBuilderHistory(activeId, items);

    const handleDragStart = (e) => {
        const { active } = e;
        let activeData = {};
        if (active.data.current) {
            activeData = active.data.current;
        }

        setActiveId(active.id);
    };

    const handleDragOver = (e) => {
        const { active, over, collisions } = e;

        // Unset the column hover timer every time our over target changes
        clearTimeout(columnTimerId.current);
        columnTimerId.current = null;

        if (!active || !over || !over.data.current.relativePosition) {
            return;
        }

        // If an element is being hovered over itself, there's nothing to be done
        const isHoveringOverSelf = active.id === over.id;
        if (isHoveringOverSelf) {
            return;
        }

        const overRowIndex = over.data.current.rowIndex;
        let modifier = 0;
        if (over.data.current.relativePosition === "above") {
            modifier = -1;
        } else if (over.data.current.relativePosition === "below") {
            modifier = 1;
        }

        if (active.data.current.isNewElement) {
            addNewElement(over, active, overRowIndex, modifier);
        } else {
            moveElement(over, active, modifier);
        }
    };

    const handleDragEnd = (e) => {
        const { over, active, collisions } = e;

        // Unset the column hover timer every time our over target changes
        clearTimeout(columnTimerId.current);
        columnTimerId.current = null;

        let updateItems = JSON.parse(JSON.stringify(items));

        // Special case: For the reorder columns sort animation to work properly when grid is virtualized, we have to wait until drag is finished to update state.
        const dragWasColumnReorder =
            active?.id !== over?.id &&
            !active?.data.current.isNewElement &&
            !over?.data.current.isPlaceholder;

        if (dragWasColumnReorder) {
            const row = getRow(over.id, updateItems);
            const fromColIndex = getColumnIndex(row, active.id);
            const toColIndex = getColumnIndex(row, over.id);
            row.columns = arrayMove(row.columns, fromColIndex, toColIndex);
            setItems(updateItems);
        }

        // Replace any placeholder elements with real ids
        updateItems.map((row) => {
            if (row.id.includes("new-row-placeholder")) {
                row.id = uuid();
            }

            row.columns.map((col) => {
                if (col.id === "new-column-placeholder") {
                    col.id = uuid();
                }
            });
        });

        updateItems = updateItems.filter((row) => row.columns.length > 0);
        setItems(updateItems);
        setActiveId(null);
        lastOverId.current = null;
    };

    function moveElement(over, active, modifier) {
        let updateItems = JSON.parse(JSON.stringify(items));
        const fromRow = getRow(active.id, updateItems);
        const fromRowIndex = getRowIndex(active.id, updateItems);
        const fromCol = getColumn(active.id, updateItems);
        const fromColIndex = getColumnIndex(fromRow, active.id);

        const destinationCol = getColumn(over.id, updateItems);

        const destinationIsNewRow = destinationCol === undefined;

        if (!destinationIsNewRow) {
            // adding a column to existing row
            const destinationRow = updateItems.find((row) =>
                row.columns.find((col) => col.id === destinationCol.id)
            );

            const destinationRowIndex = updateItems.findIndex((row) =>
                row.columns.find((col) => col.id === over.id)
            );
            const destinationColIndex = updateItems[
                destinationRowIndex
            ].columns.findIndex((col) => col.id === over.id);

            // Remove original location
            updateItems[fromRowIndex].columns = updateItems[
                fromRowIndex
            ].columns.filter((col) => col.id !== fromCol.id);

            // Figure out which side of column we're dragging element onto
            const isRightOfOverItem =
                over &&
                fromRowIndex !== destinationRowIndex &&
                active.rect.current.translated &&
                active.rect.current.translated.right >
                    over.rect.right - over.rect.width / 2;
            destinationRow.columns.splice(
                destinationColIndex + (isRightOfOverItem ? 1 : 0),
                0,
                fromCol
            );

            const isAddingNewColumn = fromRowIndex !== destinationRowIndex;
            if (isAddingNewColumn && columnTimerId.current === null) {
                columnTimerId.current = setTimeout(() => {
                    recentlyMovedToNewContainer.current = true;

                    // When we move columns in and out of rows, leave the empty rows so that the layout doesn't jump/shift around too much
                    updateItems = updateItems.filter(
                        (row) =>
                            row.columns.length > 0 ||
                            updateItems.findIndex((r) => r.id === row.id) <
                                destinationRowIndex
                    );
                    setItems(updateItems);
                    columnTimerId.current = null;
                }, columnDelayTiming);
            }
            // else {
            //     setItems(updateItems);
            // }
        } else {
            const destinationRowIndex = over.data.current.rowIndex;

            const hoveringOverBottomPlaceholder =
                fromRowIndex === destinationRowIndex &&
                fromRow.columns.length <= 1;

            const hoveringOverTopPlaceholder =
                fromRowIndex === destinationRowIndex + 1 &&
                over.data.current.isPlaceholder &&
                fromRow.columns.length === 1 &&
                over.id !== "row-placeholder-start";

            if (hoveringOverBottomPlaceholder || hoveringOverTopPlaceholder) {
                return;
            }

            const destinationColIndex = updateItems[
                destinationRowIndex
            ].columns.findIndex((col) => col.id === over.id);

            updateItems.map((row) => {
                row.columns = row.columns.filter((col) => col.id !== active.id);
            });

            const index =
                destinationRowIndex + modifier < 0
                    ? 0
                    : destinationRowIndex + modifier;

            updateItems.splice(index, 0, {
                id: uuid(),
                columns: [fromCol],
            });

            updateItems = updateItems.filter((row) => row.columns.length > 0);
            recentlyMovedToNewContainer.current = true;
            setItems(updateItems);
        }
    }

    function addNewElement(over, active, overRowIndex, modifier) {
        let updateItems = JSON.parse(JSON.stringify(items));

        const fromCol = getColumn("new-column-placeholder", updateItems);
        const fromRow = getRow("new-column-placeholder", updateItems);
        let fromRowIndex = null;

        if (fromCol && fromRow) {
            fromRowIndex = getRowIndex("new-column-placeholder", updateItems);
        }

        if (over.data.current.isPlaceholder) {
            // is ele being hovered over itself?
            const fromRow = getRow("new-column-placeholder", updateItems);
            let fromRowIndex = null;
            let isDecombiningColumn = false;
            if (fromRow) {
                fromRowIndex = getRowIndex(
                    "new-column-placeholder",
                    updateItems
                );

                isDecombiningColumn = fromRow.columns.length > 1;

                // Some movements aren't valid so we don't need to handle them, such as moving an element to a directly adjacent placeholder row.
                if (
                    !isDecombiningColumn &&
                    (fromRowIndex === over.data.current.rowIndex ||
                        (fromRowIndex === over.data.current.rowIndex + 1 &&
                            over.data.current.relativePosition !== "above"))
                ) {
                    return;
                }
            }
            let modifier = 0;

            if (!fromRow && over.data.current.relativePosition !== "above") {
                modifier = 1;
            } else if (isDecombiningColumn) {
                if (
                    over.data.current.rowIndex === fromRowIndex &&
                    over.data.current.relativePosition !== "above"
                ) {
                    modifier = 1;
                }
            } else if (over.data.current.relativePosition === "above") {
                modifier = -1;
            } else if (fromRowIndex > over.data.current.rowIndex) {
                modifier = 1;
            }

            // is there already a placeholder? Remove it if so.
            updateItems.map((row) => {
                row.columns = row.columns.filter(
                    (col) => col.id !== "new-column-placeholder"
                );
            });

            updateItems = updateItems.filter((row) => row.columns.length > 0);

            // insert new row
            const newOb = {
                id: `new-row-placeholder`,
                columns: [
                    {
                        id: "new-column-placeholder",
                        component: active.data.current.component,
                        props: {
                            ...Components[active.data.current.component].props,
                        },
                    },
                ],
            };

            let index = over.data.current.rowIndex + modifier;
            if (index < 0) {
                index = 0;
            }

            updateItems.splice(index, 0, newOb);

            setItems(updateItems);
        } else {
            if (columnTimerId.current === null) {
                columnTimerId.current = setTimeout(() => {
                    // is there already a placeholder? Remove it if so.
                    updateItems.map((row) => {
                        row.columns = row.columns.filter(
                            (col) => col.id !== "new-column-placeholder"
                        );
                    });

                    // insert new column
                    const index =
                        overRowIndex + modifier > updateItems.length - 1
                            ? updateItems.length - 1
                            : overRowIndex + modifier;
                    updateItems[index].columns.push({
                        id: "new-column-placeholder",
                        component: active.data.current.component,
                        props: {
                            ...Components[active.data.current.component].props,
                        },
                    });
                    setItems(updateItems);
                    columnTimerId.current = null;
                }, columnDelayTiming);
            }
        }
    }

    function getRow(colId, updateItems) {
        return updateItems.find((row) =>
            row.columns.find((col) => col.id === colId)
        );
    }

    function getRowIndex(colId, updateItems) {
        return updateItems.findIndex((row) =>
            row.columns.find((col) => col.id === colId)
        );
    }

    function getColumn(colId, updateItems) {
        return updateItems
            .flatMap((row) => row.columns)
            .find((col) => col.id === colId);
    }

    function getColumnIndex(row, colId) {
        return row.columns.findIndex((col) => col.id === colId);
    }

    /**
     * Custom collision detection strategy optimized for multiple containers
     *
     * - First, find any droppable containers intersecting with the pointer.
     * - If there are no intersecting containers, return the last matched intersection
     *
     */

    const collisionDetectionStrategy = useCallback(
        (args) => {
            // Start by finding any intersecting droppable
            const pointerIntersections = pointerWithin(args);

            // For collisions where pointer is within, we only want collisions with columns, not container rows
            const filteredPointerIntersections = pointerIntersections.filter(
                (i) => !i.data.droppableContainer.data.current.isParentContainer
            );
            let overId = getFirstCollision(filteredPointerIntersections, "id");

            if (overId != null) {
                lastOverId.current = overId;
                return [{ id: overId }];
            }

            // When a draggable item moves to a new container, the layout may shift
            // and the `overId` may become `null`. We manually set the cached `lastOverId`
            // to the id of the draggable item that was moved to the new container, otherwise
            // the previous `overId` will be returned which can cause items to incorrectly shift positions
            if (recentlyMovedToNewContainer.current) {
                lastOverId.current = activeId;
            }

            // If no droppable is matched, return the last match
            return lastOverId.current ? [{ id: lastOverId.current }] : [];
        },
        [activeId, items]
    );

    const getComponentForPreview = () => {
        if (activeId !== null) {
            let col = items
                .flatMap((row) => row.columns)
                .find((col) => col.id === activeId);

            if (col) {
                // Copy the existing element into the drag preview
                return React.createElement(
                    Components[col.component].type,
                    col.props
                );
            } else {
                // Dragging a new item onto the grid, so construct the drag preview using the element defaults
                let componentType = activeId.replace("-menu-item", "");
                return constructComponent(Components[componentType]);
            }
        }

        return null;
    };

    const handleUndo = () => {
        const history = undoHistory();
        if (history) {
            setItems(history);
        } else {
            setItems([]);
            setHasHistory(false);
        }
    };

    return (
        <div className="builder">
            <BuilderNavbar />
            <div className="lessons">lessons</div>
            <DndContext
                sensors={sensors}
                modifiers={[snapDragHandleToCursor]}
                collisionDetection={collisionDetectionStrategy}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="lesson-content">
                    {/* <DebugValues
                            translateTiming={translateTiming}
                            setTranslateTiming={setTranslateTiming}
                            columnDelayTiming={columnDelayTiming}
                            setColumnDelayTiming={setColumnDelayTiming}
                            slopTiming={slopTiming}
                            setSlopTiming={setSlopTiming}
                            gridGap={gridGap}
                            setGridGap={setGridGap}
                        /> */}

                    <div className="grid">
                        <div style={{ padding: "1rem" }}>
                            <button onClick={handleUndo} disabled={!hasHistory}>
                                <FontAwesomeIcon icon="fa-solid fa-rotate-left" />{" "}
                                undo
                            </button>
                        </div>
                        {items.length > 0 ? (
                            <>
                                <Virtuoso
                                    style={{
                                        height: "100%",
                                    }}
                                    totalCount={items.length}
                                    data={items}
                                    itemContent={(rowIndex, row) => {
                                        return (
                                            <div key={row.id}>
                                                {rowIndex === 0 && (
                                                    <Droppable
                                                        id={`row-placeholder-start`}
                                                        rowIndex={0}
                                                        relativePosition="above"
                                                        isPlaceholder={true}
                                                        activeId={activeId}
                                                        items={items}
                                                    >
                                                        <div
                                                            style={{
                                                                height: "24px",
                                                                width: "100%",
                                                            }}
                                                        ></div>
                                                    </Droppable>
                                                )}
                                                <Droppable
                                                    id={row.id}
                                                    isPlaceholder={false}
                                                    activeId={activeId}
                                                    isParentContainer={true}
                                                    items={items}
                                                    rowIndex={rowIndex}
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
                                                            (
                                                                column,
                                                                colIndex
                                                            ) => {
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
                                                                        column={
                                                                            column
                                                                        }
                                                                        relativePosition="within"
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </SortableContext>
                                                </Droppable>
                                                <Droppable
                                                    id={`row-placeholder-${rowIndex}`}
                                                    rowIndex={rowIndex}
                                                    relativePosition="below"
                                                    isPlaceholder={true}
                                                    activeId={activeId}
                                                    items={items}
                                                >
                                                    <div
                                                        style={{
                                                            height: "24px",
                                                            width: "100%",
                                                        }}
                                                    ></div>
                                                </Droppable>
                                            </div>
                                        );
                                    }}
                                />
                            </>
                        ) : (
                            <DefaultDroppable />
                        )}
                    </div>
                </div>
                <div className="sidebar" style={{ overflow: "auto" }}>
                    <BuilderElementsMenu />
                </div>
                <DragOverlay dropAnimation={null}>
                    <div className="drag-handle-visible">
                        <div className="dragging drag-overlay">
                            {getComponentForPreview()}
                        </div>
                        <div className="drag-handle">
                            <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
                        </div>
                    </div>
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default PageBuilder;
