import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    closestCenter,
    getFirstCollision,
    pointerWithin,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import uuid from "react-uuid";
import "../css/App.css";
import { useBuilderHistory } from "../hooks/useBuilderHistory";
import { snapDragHandleToCursor } from "../modifiers/snapDragHandleToCursor";
import BuilderElementsMenu from "./BuilderElementsMenu";
import BuilderNavbar from "./BuilderNavbar";
import { Components, constructComponent } from "./ComponentFactory";
import VirtualizedGrid from "./VirtualizedGrid";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

const PageBuilder = () => {
    // The lesson elements
    const [items, setItems] = useState(
        JSON.parse(localStorage.getItem("builder-session")) ?? []
    );

    const [previousItems, setPreviousItems] = useState(items);
    const [activeId, setActiveId] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    // How long you have to wait before item combines with an existing row
    const [columnDelayTiming, setColumnDelayTiming] = useState(450);
    const [dragOverlayWidth, setDragOverlayWidth] = useState(0);

    const lastOverId = useRef(null);
    const recentlyMovedToNewContainer = useRef(false);
    const columnTimerId = useRef(null);
    const gridWrapperRef = useRef(null);

    // The width that an element was at the beginning of resizing.
    // We have to track this because dndkit returns deltas based on the width of the element at the start of dragging, regardless of its current width.
    const initialResizeWidth = useRef(null);
    const initialNeighborWidth = useRef(null);

    // Builder history
    const { undo, redo, clear, canUndo, canRedo, setHistoryEnabled } =
        useBuilderHistory(activeId, items, previousItems);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        requestAnimationFrame(() => {
            recentlyMovedToNewContainer.current = false;
        });
    }, [items]);

    const handleDragStart = (e) => {
        const { active } = e;

        // Don't track history while actively dragging.
        setHistoryEnabled(false);
        setPreviousItems(items);

        if (active.data.current.type === "resize") {
            return;
        }

        setActiveId(active.id);
        // Dndkit doesn't know what element we're hovering over when dragging starts, so we gotta manually get the dimensions with vanilla js
        if (!active.data.current.isNewElement) {
            const columnDimensions = document
                .getElementById(active.id)
                .getBoundingClientRect();

            setDragOverlayWidth(columnDimensions.width);
        } else {
            setDragOverlayWidth(gridWrapperRef.current.clientWidth);
        }
    };

    const handleDragOver = (e) => {
        const { active, over, collisions } = e;

        if (active.data.current.type === "resize") {
            return;
        }

        // Unset the column hover timer every time our over target changes
        clearTimeout(columnTimerId.current);
        columnTimerId.current = null;
        if (!active || !over) {
            return;
        }

        // We handle the sorting of columns within a row in the drag end handler.
        const isHoveringOverSelf = active.id === over.id;
        if (isHoveringOverSelf) {
            return;
        }

        if (active.data.current.isNewElement) {
            addNewElement(over, active, collisions);
        } else {
            moveElement(over, active, collisions);
        }
    };

    const handleDragMove = (e) => {
        const { active, delta } = e;

        if (active.data.current.type !== "resize") {
            return;
        }

        let updateItems = getItems();
        const draggingRow = getRow(active.data.current.id, updateItems);
        const draggingCol = draggingRow.columns.find(
            (col) => col.id === active.data.current.id
        );

        const isResizeLeft = active.data.current.resizePosition === "left";
        const modifier = isResizeLeft ? -1 : 1;
        const neighboringCol =
            draggingRow.columns[active.data.current.index + modifier];

        if (draggingRow && draggingCol && neighboringCol) {
            // The width that an element was at the beginning of resizing.
            // We have to track this because dndkit returns deltas based on the width of the element at the start of dragging, regardless of its current width.
            if (initialResizeWidth.current === null) {
                initialResizeWidth.current = document
                    .getElementById(active.data.current.id)
                    .getBoundingClientRect().width;
            }

            if (initialNeighborWidth.current === null) {
                initialNeighborWidth.current = document
                    .getElementById(neighboringCol.id)
                    .getBoundingClientRect().width;
            }

            let newWidth = null;

            if (active.data.current.resizePosition === "left") {
                if (delta.x < 0) {
                    newWidth = Math.round(
                        initialResizeWidth.current + Math.abs(delta.x)
                    );
                } else if (delta.x > 0) {
                    newWidth = Math.round(
                        initialResizeWidth.current - Math.abs(delta.x)
                    );
                }
            } else {
                if (delta.x < 0) {
                    newWidth = Math.round(
                        initialResizeWidth.current - Math.abs(delta.x)
                    );
                } else if (delta.x > 0) {
                    newWidth = Math.round(
                        initialResizeWidth.current + Math.abs(delta.x)
                    );
                }
            }
            const totalWidth =
                gridWrapperRef.current.clientWidth -
                24 * (draggingRow.columns.length - 1);

            const startingWidth = Math.round(
                (initialResizeWidth.current / totalWidth) * 100
            );
            const percentageWidth = Math.round((newWidth / totalWidth) * 100);

            let snapPoints = [
                8.333, 16.667, 25, 33.333, 41.667, 50, 58.333, 66.667, 75,
                83.333, 91.667,
            ];

            // Figure out the max width the column can be
            let sumOfNonNeighboringWidths = 0;
            draggingRow.columns
                .filter(
                    (col) =>
                        col.id !== draggingCol.id &&
                        col.id !== neighboringCol.id
                )
                .map((col) => {
                    if (col.gridWidth) {
                        sumOfNonNeighboringWidths += col.gridWidth;
                    } else {
                        // manually calculate its width
                        sumOfNonNeighboringWidths += parseFloat(
                            document
                                .getElementById(col.id)
                                .style.width.replace("%", "")
                        );
                    }
                });

            snapPoints = snapPoints.filter(
                (s) => s < 100 - sumOfNonNeighboringWidths
            );

            var closest = snapPoints.reduce(function (prev, curr) {
                return Math.abs(curr - percentageWidth) <
                    Math.abs(prev - percentageWidth)
                    ? curr
                    : prev;
            });

            const neighborPercentageWidth = Math.round(
                (initialNeighborWidth.current / totalWidth) * 100
            );

            const newNeighborWidth =
                neighborPercentageWidth + (startingWidth - closest);

            var closestNeighborWidth = snapPoints.reduce(function (prev, curr) {
                return Math.abs(curr - newNeighborWidth) <
                    Math.abs(prev - newNeighborWidth)
                    ? curr
                    : prev;
            });

            if (draggingCol.gridWidth !== closest) {
                draggingCol.gridWidth = closest;
                neighboringCol.gridWidth = closestNeighborWidth;
                setItems(updateItems);
            }
        }
    };

    const handleDragEnd = (e) => {
        const { over, active } = e;

        // We can re-enable history tracking now that dragging has ended.
        setHistoryEnabled(true);

        if (active.data.current.type === "resize") {
            initialResizeWidth.current = null;
            initialNeighborWidth.current = null;
            return;
        }

        // Unset the column hover timer every time our over target changes
        clearTimeout(columnTimerId.current);
        columnTimerId.current = null;

        let updateItems = JSON.parse(JSON.stringify(items));

        // Handle reordering of columns
        if (
            over &&
            updateItems
                .flatMap((row) => row.columns)
                .find((col) => col.id === active.id)
        ) {
            const row = getRow(active.id, updateItems);

            const oldColIndex = row.columns.findIndex(
                (col) => col.id === active.id
            );

            const newColIndex = row.columns.findIndex(
                (col) => col.id === over.id
            );

            let toMove = row.columns.splice(oldColIndex, 1);
            row.columns.splice(newColIndex, 0, toMove[0]);
        }

        // Replace any placeholder elements with real ids
        updateItems.map((row) => {
            if (row.id.includes("new-row-placeholder")) {
                row.id = uuid();
            }

            row.columns.map((col) => {
                if (col.id.includes("new-column-placeholder")) {
                    col.id = uuid();
                }
            });
        });

        updateItems = updateItems.filter((row) => row.columns.length > 0);
        setItems(updateItems);
        setActiveId(null);
        lastOverId.current = null;
    };

    function moveElement(over, active, collisions) {
        let updateItems = JSON.parse(JSON.stringify(items));
        const fromRow = getRow(active.id, updateItems);
        const fromRowIndex = getRowIndex(active.id, updateItems);
        const fromCol = getColumn(active.id, updateItems);

        if (over.data.current.type === "column") {
            const toCol = getColumn(over.id, updateItems);
            const toRow = updateItems.find((row) =>
                row.columns.find((col) => col.id === toCol.id)
            );
            const toRowIndex = updateItems.findIndex((row) =>
                row.columns.find((col) => col.id === over.id)
            );
            const toColIndex = updateItems[toRowIndex].columns.findIndex(
                (col) => col.id === over.id
            );

            // Remove original location
            updateItems[fromRowIndex].columns = updateItems[
                fromRowIndex
            ].columns.filter((col) => col.id !== fromCol.id);
            // Figure out which side of column we're dragging element onto
            const isRightOfOverItem =
                over &&
                fromRowIndex !== toRowIndex &&
                active.rect.current.translated &&
                active.rect.current.translated.right >
                    over.rect.right - over.rect.width / 2;

            toRow.columns.splice(
                toColIndex + (isRightOfOverItem ? 1 : 0),
                0,
                fromCol
            );
            const isAddingNewColumn = fromRowIndex !== toRowIndex;
            if (isAddingNewColumn && columnTimerId.current === null) {
                columnTimerId.current = setTimeout(() => {
                    recentlyMovedToNewContainer.current = true;
                    // When we move columns in and out of rows, leave the empty rows so that the layout doesn't jump/shift around too much
                    updateItems = updateItems.filter(
                        (row) =>
                            row.columns.length > 0 ||
                            updateItems.findIndex((r) => r.id === row.id) <
                                toRowIndex
                    );
                    // If adding a new column, reset column widths to all be equal
                    updateItems[over.data.current.rowIndex].columns.map(
                        (col) => (col.gridWidth = null)
                    );
                    setItems(updateItems);
                    columnTimerId.current = null;

                    setDragOverlayWidth(
                        gridWrapperRef.current.clientWidth /
                            updateItems[over.data.current.rowIndex].columns
                                .length
                    );
                }, columnDelayTiming);
            }
        } else if (over.data.current.type === "row") {
            // If element is hovering over its own row, or close enough to its own row, no need to swap positions
            const hoveringOverSelf = fromRow?.id === over.id;

            const toRowIndex = updateItems.findIndex(
                (row) => row.id === over.id
            );
            const collision = collisions.find((c) => c.id === over.id);
            const hoveringNextToSelf =
                (collision.data.relativePosition === "below" &&
                    toRowIndex + 1 === fromRowIndex) ||
                (collision.data.relativePosition === "above" &&
                    toRowIndex - 1 === fromRowIndex);

            const decombining = fromRow?.columns.length > 1;

            if (!decombining && (hoveringOverSelf || hoveringNextToSelf)) {
                return;
            }

            // If decombining a column, reset column widths in the from row, to all be equal
            if (decombining) {
                updateItems[fromRowIndex].columns.map(
                    (col) => (col.gridWidth = null)
                );
            }

            // first remove orig location
            updateItems.map((row) => {
                row.columns = row.columns.filter((col) => col.id !== active.id);
            });

            // now move it to new location
            updateItems.splice(
                toRowIndex +
                    (collision.data.relativePosition === "above" ? 0 : 1),
                0,
                {
                    id: decombining ? uuid() : fromRow.id, // Decombined elements need a new row id to keep react from complaining about duplicate keys
                    columns: [fromCol],
                }
            );

            updateItems = updateItems.filter((row) => row.columns.length > 0);
            recentlyMovedToNewContainer.current = true;

            setItems(updateItems);
            setDragOverlayWidth(gridWrapperRef.current.clientWidth);
        }
    }

    function addNewElement(over, active, collisions) {
        let updateItems = JSON.parse(JSON.stringify(items));

        if (over.data.current.type === "row") {
            // Move all the new columns from one row to another row
            const fromRow = getRow("new-column-placeholder-0", updateItems);
            const fromRowIndex = getRowIndex(
                "new-column-placeholder-0",
                updateItems
            );
            const toRowIndex = updateItems.findIndex(
                (row) => row.id === over.id
            );

            // If element is hovering over its own row, or close enough to its own row, no need to swap positions
            const hoveringOverSelf = fromRow?.id === over.id;

            const collision = collisions.find((c) => c.id === over.id);
            const hoveringNextToSelf =
                (collision.data.relativePosition === "below" &&
                    toRowIndex + 1 === fromRowIndex) ||
                (collision.data.relativePosition === "above" &&
                    toRowIndex - 1 === fromRowIndex);

            // If there are non-new columns in the row we're coming from, that indicates that they've been combined with other elements, and we should decombine them
            const decombining = fromRow?.columns.some(
                (col) => !col.id.includes("new-column-placeholder-")
            );

            if (
                fromRow &&
                !decombining &&
                (hoveringOverSelf || hoveringNextToSelf)
            ) {
                return;
            }

            // is there already a placeholder? Remove it if so.
            updateItems.map((row) => {
                row.columns = row.columns.filter(
                    (col) => !col.id.includes("new-column-placeholder")
                );
            });

            // Adjust insert index based on where we're hovering relative to the element
            let insertIndex = updateItems.findIndex(
                (row) => row.id === over.id
            );
            if (collision.data.relativePosition === "below") {
                insertIndex += 1;
            }

            // insert new row
            const cols = Components[active.data.current.component].map(
                (c, index) => {
                    return {
                        id: "new-column-placeholder-" + index,
                        component: c.component,
                        props: {
                            ...c.props,
                        },
                    };
                }
            );
            const newOb = {
                id: `new-row-placeholder`,
                columns: [...cols],
            };

            updateItems.splice(insertIndex, 0, newOb);
            updateItems = updateItems.filter((row) => row.columns.length > 0);
            recentlyMovedToNewContainer.current = true;
            setItems(updateItems);
            setDragOverlayWidth(gridWrapperRef.current.clientWidth);
        } else if (over.data.current.type === "column") {
            if (columnTimerId.current === null) {
                const hoveringOverSelf = over?.id.includes(
                    "new-column-placeholder"
                );
                if (hoveringOverSelf) {
                    return;
                }

                columnTimerId.current = setTimeout(() => {
                    // Move all new columns from one row and combine them into another
                    updateItems.map((row) => {
                        row.columns = row.columns.filter(
                            (col) => !col.id.includes("new-column-placeholder")
                        );
                    });
                    // insert new column
                    const cols = Components[active.data.current.component].map(
                        (c, index) => {
                            return {
                                id: "new-column-placeholder-" + index,
                                component: c.component,
                                props: {
                                    ...c.props,
                                },
                            };
                        }
                    );
                    updateItems[over.data.current.rowIndex].columns.push(
                        ...cols
                    );

                    // If adding a new column, reset column widths to all be equal
                    updateItems[over.data.current.rowIndex].columns.map(
                        (col) => (col.gridWidth = null)
                    );

                    setItems(updateItems);
                    recentlyMovedToNewContainer.current = true;
                    columnTimerId.current = null;

                    // Update drag overlay width
                    const width =
                        (gridWrapperRef.current.clientWidth /
                            updateItems[over.data.current.rowIndex].columns
                                .length) *
                        cols.length;
                    setDragOverlayWidth(width);
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
     * Custom collision strategy for the course builder.
     *
     * - First, find any columns intersecting with the pointer.
     * - If there are no directly intersecting columns, find the closest row
     *
     */
    const collisionDetectionStrategy = useCallback(
        (args) => {
            // Start by finding any intersecting droppable.
            const pointerIntersections = pointerWithin(args);

            // For collisions where pointer is within, we only want collisions with columns, not container rows.
            const columnPointerIntersections = pointerIntersections.filter(
                (i) => i.data.droppableContainer.data.current.type !== "row"
            );
            let over = getFirstCollision(columnPointerIntersections);

            if (over != null) {
                // TODO: This anti jank logic, itself, is a bit janky when combining/decombining with large images, because the size of the threshold changes based on the height of the element.
                //       Maybe it should only apply when combining, and NOT when decombining.
                // If hovering near the top or bottom edge of a row, don't combine.
                // Only combine if hovering closer to the center of a row. This reduces jankiness somewhat.
                const rect = over.data.droppableContainer.rect.current;
                const nearTopEdge =
                    args.pointerCoordinates.y >= rect.top &&
                    args.pointerCoordinates.y <= rect.top + rect.height / 3;

                const nearBottomEdge =
                    args.pointerCoordinates.y >=
                        rect.bottom - rect.height / 3 &&
                    args.pointerCoordinates.y <= rect.bottom;
                const nearEdge = nearTopEdge || nearBottomEdge;

                // only apply if not near edge, or you ARE near the edge but you're in a combined column
                const row = items.find((row) =>
                    row.columns.find(
                        (col) =>
                            col.id === args.active.id ||
                            col.id.includes("new-column-placeholder")
                    )
                );
                const isInCombinedColumn = row?.columns.length > 1;
                if (!nearEdge || isInCombinedColumn) {
                    lastOverId.current = over.id;
                    return [{ id: over.id }];
                }
            }

            // explain this logic
            const closestCenters = closestCenter(args);
            const closestRows = closestCenters.filter(
                (c) => c.data.droppableContainer.data.current.type === "row"
            );

            over = getFirstCollision(closestRows);

            if (over != null) {
                // Figure out if we are hovering above or below the nearest element
                const rect = over.data.droppableContainer.rect.current;
                const centerOfOverRect = centerOfRectangle(rect);

                const { withinVerticalBounds, withinHorizontalBounds } =
                    isWithinBounds(rect, args);

                if (!withinVerticalBounds) {
                    return [
                        {
                            id: over.id,
                            data: {
                                relativePosition:
                                    args.pointerCoordinates.y <=
                                    centerOfOverRect.y
                                        ? "above"
                                        : "below",
                            },
                        },
                    ];
                }
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

    function isWithinBounds(rect, args) {
        const withinVerticalBounds =
            args.pointerCoordinates.y >= rect.top &&
            args.pointerCoordinates.y <= rect.bottom;

        const withinHorizontalBounds =
            args.pointerCoordinates.x >= rect.left &&
            args.pointerCoordinates.x <= rect.left + rect.width;

        return { withinVerticalBounds, withinHorizontalBounds };
    }

    function centerOfRectangle(rect, left = rect.left, top = rect.top) {
        return {
            x: left + rect.width * 0.5,
            y: top + rect.height * 0.5,
        };
    }

    const getDragPreview = () => {
        if (activeId !== null) {
            let col = items
                .flatMap((row) => row.columns)
                .find((col) => col.id === activeId);

            if (col) {
                // Copy the existing element into the drag preview
                return React.createElement(
                    Components[col.component][0].type,
                    col.props
                );
            } else {
                // Dragging a new item onto the grid, so construct the drag preview using the element defaults
                let componentType = activeId.replace("-menu-item", "");
                return (
                    <div className="preview-container">
                        {Components[componentType].map((c, index) => {
                            return (
                                <div key={uuid()} className="preview-column">
                                    {constructComponent(
                                        Components[componentType][index]
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            }
        }

        return null;
    };

    const handleDelete = (columnId) => {
        setPreviousItems(items);
        setHistoryEnabled(true);

        let updateItems = getItems();

        // If deleting a column, reset the widths of the remaining columns
        const row = getRow(columnId, updateItems);
        row.columns.map((col) => (col.gridWidth = null));

        updateItems.map((row) => {
            row.columns = row.columns.filter(
                (col) => !col.id.includes(columnId)
            );
        });
        updateItems = updateItems.filter((row) => row.columns.length > 0);
        setItems(updateItems);
    };

    const handleUndo = () => {
        setItems(undo());
    };

    const handleRedo = () => {
        setItems(redo());
    };

    const handleClear = () => {
        setItems([]);
        clear();
    };

    const handleSave = () => {
        // in place of saving to database, save to localstorage
        localStorage.setItem("builder-session", JSON.stringify(items));
    };

    function getItems() {
        return JSON.parse(JSON.stringify(items));
    }

    const handleStressTest = () => {
        setHistoryEnabled(false);

        setItems(() => {
            let stressTestItems = [];
            for (let i = 0; i < 3500; i++) {
                stressTestItems.push({
                    id: uuid(),
                    columns: [
                        {
                            id: uuid(),
                            component: "paragraph",
                            props: {
                                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.",
                            },
                        },
                        {
                            id: uuid(),
                            component: "paragraph",
                            props: {
                                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.",
                            },
                        },
                    ],
                });
            }
            return stressTestItems;
        });
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
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always,
                        frequency: 100,
                    },
                    draggable: {
                        strategy: MeasuringStrategy.Always,
                        frequency: 100,
                    },
                }}
            >
                <div className="canvas">
                    <div className="grid">
                        <div style={{ padding: "1rem" }}>
                            <button onClick={handleUndo} disabled={!canUndo}>
                                <FontAwesomeIcon icon="fa-solid fa-rotate-left" />
                                undo
                            </button>

                            <button onClick={handleRedo} disabled={!canRedo}>
                                <FontAwesomeIcon icon="fa-solid fa-rotate-right" />
                                redo
                            </button>

                            <button
                                onClick={handleClear}
                                disabled={!items.length}
                            >
                                RESET
                            </button>
                            <button onClick={handleSave}>SAVE</button>
                            <button onClick={handleStressTest}>
                                GENERATE 3500 PARAGRAPHS
                            </button>
                        </div>
                        <VirtualizedGrid
                            items={items}
                            ref={gridWrapperRef}
                            activeId={activeId}
                            handleDelete={handleDelete}
                        />
                    </div>
                </div>
                <div className="sidebar" style={{ overflow: "auto" }}>
                    <BuilderElementsMenu />
                </div>
                <DragOverlay
                    dropAnimation={null}
                    modifiers={!activeId ? [restrictToHorizontalAxis] : []}
                >
                    {!activeId && (
                        <FontAwesomeIcon icon="fa-solid fa-grip-vertical" />
                    )}
                    {activeId && (
                        <div
                            className="drag-overlay hovered"
                            style={{
                                position: "relative",
                                width: `${gridWrapperRef.current?.clientWidth}px`,
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}
                        >
                            <div
                                style={{
                                    width: `${dragOverlayWidth}px`,
                                    border: "1px solid rgba(0, 0, 0, 0.05)",
                                    boxShadow:
                                        "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                                    borderRadius: "4px",
                                    transition: "width 300ms ease",
                                    background: "#F8F8F8",
                                }}
                            >
                                {getDragPreview()}
                            </div>
                            <div className="drag-handle">
                                <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default PageBuilder;
