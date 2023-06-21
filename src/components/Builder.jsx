import React, { useCallback, useRef, useState } from "react";
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
import DefaultDroppable from "./DefaultDroppable";
import VirtualizedGrid from "./VirtualizedGrid";

const PageBuilder = () => {
    // The lesson elements
    const [items, setItems] = useState(
        JSON.parse(localStorage.getItem("builder-session")) ?? []
    );

    const [previousItems, setPreviousItems] = useState(items);
    const [activeId, setActiveId] = useState(null);
    const lastOverId = useRef(null);
    const recentlyMovedToNewContainer = useRef(false);
    const columnTimerId = useRef(null);

    // Builder history
    const { undo, redo, clear, canUndo, canRedo, setHistoryEnabled } =
        useBuilderHistory(activeId, items, previousItems);

    const [itemToEdit, setItemToEdit] = useState(null);

    // How long you have to wait before item combines with an existing row
    const [columnDelayTiming, setColumnDelayTiming] = useState(450);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (e) => {
        const { active } = e;
        setPreviousItems(items);
        setActiveId(active.id);

        // Set the width of the drag overlay

        // Don't track history while actively dragging.
        setHistoryEnabled(false);
    };

    const handleDragOver = (e) => {
        const { active, over, collisions } = e;

        // Unset the column hover timer every time our over target changes
        clearTimeout(columnTimerId.current);
        columnTimerId.current = null;

        if (!active || !over) {
            return;
        }
        // If an element is being hovered over itself, there's nothing to be done
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

    const handleDragEnd = (e) => {
        const { over, active, collisions } = e;

        // Unset the column hover timer every time our over target changes
        clearTimeout(columnTimerId.current);
        columnTimerId.current = null;

        let updateItems = JSON.parse(JSON.stringify(items));

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

        // We can re-enable history tracking now that dragging has ended.
        setHistoryEnabled(true);
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
                    setItems(updateItems);
                    columnTimerId.current = null;
                }, columnDelayTiming);
            } else {
                setItems(updateItems);
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

            // If there are non-new columns in the row we're coming from, that indicates that they've been combined with other elements, and we should decombine them
            //const decombining = fromRow?.columns.length > 1;
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
            updateItems = updateItems.filter((row) => row.columns.length > 0);

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

            // Where to insert
            let index = updateItems.findIndex((row) => row.id === over.id);

            // Adjust insert index based on where we're hovering relative to the element
            if (collision.data.relativePosition === "below") {
                index += 1;
            }

            updateItems.splice(index, 0, newOb);
            recentlyMovedToNewContainer.current;
            setItems(updateItems);
        } else if (over.data.current.type === "column") {
            if (columnTimerId.current === null) {
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
                    recentlyMovedToNewContainer.current;
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

                console.log(args.active, items);

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

    const getComponentForPreview = () => {
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
                onDragEnd={handleDragEnd}
                measuring={{
                    droppable: {
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
                        {items.length > 0 ? (
                            <VirtualizedGrid
                                items={items}
                                activeId={activeId}
                                handleDelete={handleDelete}
                            />
                        ) : (
                            <DefaultDroppable />
                        )}
                    </div>
                </div>
                <div className="sidebar" style={{ overflow: "auto" }}>
                    <BuilderElementsMenu />
                </div>
                <DragOverlay dropAnimation={null}>
                    <div
                        className="drag-overlay hovered"
                        style={{ position: "relative", width: "1280px" }}
                    >
                        {getComponentForPreview()}
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
