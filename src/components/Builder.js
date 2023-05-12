import React, { useState, useEffect, useRef } from "react";
import {
    DndContext,
    closestCenter,
    DragOverlay,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import uuid from "react-uuid";
import Grid from "./Grid";
import BuilderElementsMenu from "./BuilderElementsMenu";
import ItemEditor from "./ItemEditor";
import BuilderNavbar from "./BuilderNavbar";
import PlacementPreview from "./PlacementPreview";
import { Components, constructComponent } from "./ComponentFactory";
import useTimeout from "../hooks/useTimeout";
import useMousePosition from "../hooks/useMousePosition";
import { data } from "../data";
import "../css/App.css";

const PageBuilder = () => {
    // dndkit sensors
    const mouseSensor = useSensor(MouseSensor, {
        // Require the mouse to move by 1 pixel before activating, so we can differentiate between drag and click
        activationConstraint: {
            distance: 1,
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        // Press, with tolerance of 5px of movement
        activationConstraint: {
            tolerance: 5,
        },
    });

    const sensors = useSensors(mouseSensor, touchSensor);

    // The lesson elements
    const [items, setItems] = useState(data.content.body);

    // What element we're currently dragging, needed so we can measure it and show a placeholder in the dom
    const [draggingElement, setDraggingElement] = useState(null);

    // Closest element to your cursor when dragging, as determined by dnd-kit
    const [closestRow, setClosestRow] = useState(null);

    // Elements your drag element is intersecting with while dragging
    const [collisions, setCollisions] = useState(null);

    // Track the position of the mouse for positioning the drag preview
    const mousePosition = useMousePosition();

    // Keep a reference to the placement preview, for measuring its height
    const placementPreviewRef = useRef(null);

    const defaultPlacementPreviewStyle = {
        visibility: "hidden",
        height: 0,
    };
    const [placementPreviewStyle, setPlacementPreviewStyle] = useState(
        defaultPlacementPreviewStyle
    );

    const [
        debouncedPlacementPreviewStyle,
        setDebouncedPlacementPreviewStyle,
    ] = useState(placementPreviewStyle);

    const [itemToEdit, setItemToEdit] = useState(null);

    // Position of the dragged element relative to the element being hovered over (above, below, center)
    const [relativeHoverPosition, setRelativeHoverPosition] = useState(null);
    const [
        debouncedRelativeHoverPosition,
        setDebouncedRelativeHoverPosition,
    ] = useState(relativeHoverPosition);

    // Where a new element will be inserted into the item array
    const [dropTargetIndex, setDropTargetIndex] = useState(null);
    const [debouncedDropTargetIndex, setDebouncedDropTargetIndex] = useState(
        dropTargetIndex
    );

    // Whether or not the timer is active while hovering over an element while dragging
    const [columnTimerActive, setColumnTimerActive] = useState(false);

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

    // Persists debug settings across sessions
    useEffect(() => {
        localStorage.setItem("translateTiming", translateTiming);
        localStorage.setItem("columnDelayTiming", columnDelayTiming);
        localStorage.setItem("gridGap", gridGap);
        localStorage.setItem("slopTiming", slopTiming);
    }, [translateTiming, columnDelayTiming, gridGap, slopTiming]);

    // Timer for how long to hover before combining elements into multicolumn
    useTimeout(
        () => {
            setDropTargetIndex(dropTargetIndex);
            setRelativeHoverPosition("center");
            setColumnTimerActive(false);
        },
        !columnTimerActive ? null : columnDelayTiming
    );

    // Timer for how long to wait before UI updates aka "slop for the code piggies."
    // For some reason, dndkit fires ondragmove AFTER ondragend if you drag and drop very quickly,
    // so we have to check if we're actually dragging before applying UI updates.
    const [uiTimerActive, setUITimerActive] = useState(false);
    useTimeout(
        () => {
            // Double make sure that we're actually dragging.
            if (draggingElement !== null) {
                setDebouncedPlacementPreviewStyle(placementPreviewStyle);
                setDebouncedDropTargetIndex(dropTargetIndex);
                setDebouncedRelativeHoverPosition(relativeHoverPosition);
            } else {
                console.log("timer triggered but dragging element was null");
            }

            setUITimerActive(false);
        },
        !uiTimerActive ? null : slopTiming
    );

    useEffect(() => {
        // Make sure we're actually dragging and that a timer isn't already running
        if (draggingElement !== null && !uiTimerActive) {
            setUITimerActive(true);
        }
    }, [placementPreviewStyle, dropTargetIndex, relativeHoverPosition]);

    // Position the placement preview
    useEffect(() => {
        if (!draggingElement || !closestRow || !items.length) {
            return;
        }

        // get the dimensions of the element that matches the droptarget
        let item = items[dropTargetIndex];
        if (dropTargetIndex === items.length) {
            item = items[items.length - 1];
        }

        if (columnTimerActive) {
            let c = collisions.find((c) => c.id === item._uid);
            if (c) {
                c = c.data.droppableContainer.rect.current;

                // Transition the placement preview to height = 0 while we wait for the timer
                let newStyle = {
                    transition: `height 300ms ease 0s, top 300ms ease 0s`,
                    top: placementPreviewRef.current.style.top,
                    left: c.left,
                    width: c.width,
                    height: 0,
                };

                updatePlacementPreviewStyle(placementPreviewStyle, newStyle);
            }
        }

        let previewHeight = getPreviewHeight();

        if (relativeHoverPosition === "center" && !columnTimerActive) {
            // We've been hovering long enough and can now show the preview
            const columnCount = items.find((i) => i._uid === closestRow.id)
                .columns.length;

            const columnWidth =
                (closestRow.data.droppableContainer.rect.current.width -
                    gridGap * columnCount) /
                (columnCount + 1);

            const columnXOffset =
                closestRow.data.droppableContainer.rect.current.left +
                columnWidth * columnCount +
                gridGap * columnCount;

            // There are certain invalid states where we don't want to show a drag preview
            const validPlacement = isValidPlacement(
                draggingElement,
                items,
                dropTargetIndex
            );

            if (validPlacement) {
                let newStyle = {
                    top: closestRow.data.droppableContainer.rect.current.top,
                    left: columnXOffset,
                    width: columnWidth,
                    height: previewHeight,
                    transition: `height 300ms ease 0s, top 300ms ease 0s`,
                };
                updatePlacementPreviewStyle(placementPreviewStyle, newStyle);
            } else {
                setDebouncedDropTargetIndex(null);
                setDebouncedRelativeHoverPosition(null);
                setDebouncedPlacementPreviewStyle(defaultPlacementPreviewStyle);
                setUITimerActive(false);
            }
        } else if (!columnTimerActive) {
            // Render the placement preview
            if (collisions) {
                let c = collisions.find((c) => c.id === item._uid);

                if (c) {
                    const rect = c.data.droppableContainer.rect.current;

                    let additional = 0;
                    if (dropTargetIndex === items.length) {
                        additional += rect.height + gridGap;
                    }

                    // There are certain invalid states where we don't want to show a drag preview
                    const validPlacement = isValidPlacement(
                        draggingElement,
                        items,
                        dropTargetIndex
                    );

                    if (validPlacement) {
                        // Render the placement preview
                        let newStyle = {
                            visibility: "visible",
                            width: rect.width,
                            height: previewHeight,
                            top: rect.top + additional,
                            left: rect.left,
                            transition: `transform ${translateTiming}ms ease 0s, height 400ms ease 0s, top 400ms ease 0s`,
                        };
                        updatePlacementPreviewStyle(
                            placementPreviewStyle,
                            newStyle
                        );
                    } else {
                        setDebouncedDropTargetIndex(null);
                        setDebouncedRelativeHoverPosition(null);
                        setDebouncedPlacementPreviewStyle({
                            ...placementPreviewStyle,
                            height: 0,
                        });
                        setUITimerActive(false);
                    }
                }
            }
        }
    }, [
        relativeHoverPosition,
        closestRow,
        dropTargetIndex,
        collisions,
        columnTimerActive,
    ]);

    const handleGridItemClick = (item) => {
        //setItemToEdit(item);
        console.log("clicked grid item", item);
    };

    const handleSaveChanges = (updatedItem) => {
        setItems(
            items.map((item) =>
                item._uid === updatedItem._uid ? updatedItem : item
            )
        );
        setItemToEdit(null);
    };

    function handleDragStart(event) {
        const { active, over, collisions } = event;
        setDraggingElement(active);
        setClosestRow(getClosestRow(collisions));
        setCollisions(collisions);
    }

    function handleDragEnd(event) {
        const { active, collisions } = event;
        const closestRow = getClosestRow(collisions);
        if (closestRow) {
            if (items.length === 0) {
                setItems(addElement(0, active.data.current.type, false));
            } else {
                let dropIndex = items.map((i) => i._uid).indexOf(closestRow.id);
                if (dropIndex !== -1) {
                    // If hovering below the object, drop target index will be 1 more than current index
                    if (relativeHoverPosition === "bottom") {
                        dropIndex += 1;
                    }

                    const item = getElementById(draggingElement.id);
                    if (!item) {
                        setItems(
                            addElement(
                                dropIndex,
                                active.data.current.type,
                                relativeHoverPosition === "center" &&
                                    !columnTimerActive
                            )
                        );
                    } else {
                        setItems(
                            moveElement(
                                item,
                                dropIndex,
                                relativeHoverPosition === "center" &&
                                    !columnTimerActive
                            )
                        );
                    }
                }
            }
        }

        setDraggingElement(null);
        setClosestRow(null);
        setCollisions(null);

        // We want dropped elements to appear immediately, so update the debounced values directly
        setDebouncedDropTargetIndex(null);
        setDebouncedRelativeHoverPosition(null);
        setDebouncedPlacementPreviewStyle(defaultPlacementPreviewStyle);
        setUITimerActive(false);
    }

    function handleDragMove(event) {
        const { active, over, collisions } = event;

        const clientOffset = mousePosition.current;

        const closestRow = getClosestRow(collisions);

        if (closestRow) {
            setClosestRow(closestRow);
            setCollisions(collisions);

            // The coordinates of the element we're hovering over
            const hoverRect = closestRow.data.droppableContainer.rect.current;

            // Determine mouse position relative to dndkit's closest match
            const elementHeight =
                closestRow.data.droppableContainer.rect.current.height;
            const borderTop = hoverRect.top;
            const borderBottom = hoverRect.bottom;
            const topRange = borderTop + elementHeight / 3.5;
            const bottomRange = borderBottom - elementHeight / 3.5;

            const hoveringWithinElement =
                clientOffset.y >= hoverRect.top &&
                clientOffset.y <= hoverRect.bottom &&
                clientOffset.x >= hoverRect.left &&
                clientOffset.x <= hoverRect.right;

            const insideTop =
                hoveringWithinElement &&
                clientOffset.y <= topRange &&
                clientOffset.y >= borderTop;

            const insideBottom =
                hoveringWithinElement &&
                clientOffset.y >= bottomRange &&
                clientOffset.y <= borderBottom;

            const insideCenter =
                hoveringWithinElement && !insideTop && !insideBottom;

            const aboveElement =
                !hoveringWithinElement &&
                clientOffset.y < hoverRect.top + elementHeight / 2;

            const belowElement =
                !hoveringWithinElement &&
                clientOffset.y > hoverRect.top + elementHeight / 2;

            // Determine position of element if it were dropped
            let dropTarget = items.map((i) => i._uid).indexOf(closestRow.id);
            let hoverPosition = null;
            if (dropTarget !== -1) {
                // Where are we hovering near
                if (aboveElement || insideTop) {
                    hoverPosition = "top";
                } else if (belowElement || insideBottom) {
                    hoverPosition = "bottom";
                    dropTarget += 1;
                } else if (insideCenter) {
                    hoverPosition = "center";
                }

                setDropTargetIndex(dropTarget);
                setRelativeHoverPosition(hoverPosition);

                // Cancel the column timer if we ever hover outside the center of the element
                if (hoverPosition !== "center") {
                    setColumnTimerActive(false);
                }

                // Start the column timer if we're hovering within an element and weren't already hovering
                if (
                    hoverPosition === "center" &&
                    relativeHoverPosition !== "center"
                ) {
                    setColumnTimerActive(true);
                }
            }
        }
    }

    const getClosestRow = (collisions) => {
        if (!collisions || !collisions.length) {
            return null;
        }

        return collisions.filter(
            (c) =>
                c.data.droppableContainer.data.current &&
                c.data.droppableContainer.data.current.type === "row"
        )[0];
    };

    function addElement(index, elementType, within) {
        const newItems = [...items];

        if (!within) {
            // Add a whole new row
            const newOb = {
                _uid: uuid(),
                columns: [
                    {
                        _uid: uuid(),
                        component: elementType,
                        props: { ...Components[elementType].props },
                    },
                ],
            };

            newItems.splice(index, 0, newOb);
        } else {
            // Add a column to an existing row
            let row = newItems[index];
            if (row) {
                row.columns.push({
                    _uid: uuid(),
                    component: elementType,
                    props: { ...Components[elementType].props },
                });
            }
        }
        return newItems;
    }

    function moveElement(item, rowIndex, within) {
        let newItems = [...items];

        // Find the row where the item currently lives
        newItems.map((row) => {
            let column = row.columns.find((col) => col._uid === item._uid);
            if (column) {
                row.columns = row.columns.filter((c) => c._uid !== column._uid);
            }
        });

        if (!within) {
            const newOb = {
                _uid: uuid(),
                columns: [item],
            };
            newItems.splice(rowIndex, 0, newOb);
        } else {
            // Add a column to an existing row
            let row = newItems[rowIndex];
            if (row) {
                row.columns.push(item);
            }
        }

        // Rows without any columns are empty and should be removed
        newItems = newItems.filter((row) => row.columns.length > 0);

        return newItems;
    }

    const getComponentForPreview = () => {
        if (draggingElement) {
            const item = getElementById(draggingElement.id);
            if (item) {
                // if dragged ele exists in items array, it's an existing element being dragged
                return constructComponent(Components[item.component]);
            } else {
                // new element being dragged
                return constructComponent(
                    Components[draggingElement.data.current.type]
                );
            }
        }
    };

    const getElementById = (id) => {
        return items.flatMap((row) => row.columns).find((c) => c._uid === id);
    };

    // TODO: Because this is an object, React will re-render every time we update it, even if no properties have changed.
    // So for now, do a poor man's equality check on the object so we don't update it if it hasn't actually changed.
    const shouldUpdatePlacementPreviewStyle = (previewStyle, newStyle) => {
        return (
            previewStyle.visibility !== newStyle.visibility ||
            previewStyle.width !== newStyle.width ||
            previewStyle.height !== newStyle.height ||
            previewStyle.top !== newStyle.top ||
            previewStyle.left !== newStyle.left ||
            previewStyle.transition !== newStyle.transition ||
            previewStyle.transform !== newStyle.transform
        );
    };

    const getPreviewHeight = () => {
        // Get the height that the preview should be
        let previewHeight = 0;

        // Dragging a new item, so the height will be included in its data
        if (
            draggingElement &&
            draggingElement.data.current &&
            draggingElement.data.current.height
        ) {
            // If combining into columns, use the height of the row instead
            if (relativeHoverPosition === "center") {
                previewHeight =
                    closestRow.data.droppableContainer.rect.current.height;
            } else {
                previewHeight = draggingElement.data.current.height;
            }
        }
        // Dragging an existing item
        else {
            // Get the height by querying the dom for the element we're currently dragging- better way to handle this?
            previewHeight = document
                .getElementById(draggingElement.id)
                .getBoundingClientRect().height;
        }

        return previewHeight;
    };

    const isValidPlacement = (draggingElement, items, dropTargetIndex) => {
        let validPlacement = true;
        if (draggingElement.data.current.rowId) {
            const rowIndex = items.findIndex(
                (i) => i._uid === draggingElement.data.current.rowId
            );
            const columnCount = items[rowIndex].columns.length;

            // Can't drop an element on itself or directly adjacent to itself
            if (
                columnCount === 1 &&
                (dropTargetIndex === rowIndex ||
                    dropTargetIndex === rowIndex + 1) &&
                relativeHoverPosition !== "center"
            ) {
                validPlacement = false;
            }

            // If item is already in a column, don't show drag preview.
            // This will change once we implement column reordering.
            if (
                relativeHoverPosition === "center" &&
                dropTargetIndex === rowIndex
            ) {
                validPlacement = false;
            }
        }

        return validPlacement;
    };

    const updatePlacementPreviewStyle = (oldStyle, newStyle) => {
        if (shouldUpdatePlacementPreviewStyle(oldStyle, newStyle)) {
            setPlacementPreviewStyle(newStyle);
        }
    };

    return (
        <div
            className="builder"
            style={{ cursor: draggingElement ? "grabbing" : "" }}
        >
            <BuilderNavbar />
            <div className="lessons">lessons</div>
            <DndContext
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
                collisionDetection={closestCenter}
                modifiers={[snapCenterToCursor]}
                sensors={sensors}
            >
                <div className="lesson-content">
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "20px",
                            marginBottom: "40px",
                        }}
                    >
                        <label>
                            <div>Translate speed (ms)</div>
                            <input
                                type="number"
                                value={translateTiming}
                                onChange={(event) =>
                                    setTranslateTiming(
                                        parseInt(event.target.value)
                                    )
                                }
                            />
                        </label>
                        <label>
                            <div>Column hover time (ms)</div>
                            <input
                                type="number"
                                value={columnDelayTiming}
                                onChange={(event) =>
                                    setColumnDelayTiming(
                                        parseInt(event.target.value)
                                    )
                                }
                            />
                        </label>
                        <label>
                            <div>Slop time (ms)</div>
                            <input
                                type="number"
                                value={slopTiming}
                                onChange={(event) =>
                                    setSlopTiming(parseInt(event.target.value))
                                }
                            />
                        </label>
                        <label>
                            <div>Space between rows/cols</div>
                            <input
                                type="number"
                                value={gridGap}
                                onChange={(event) =>
                                    setGridGap(parseInt(event.target.value))
                                }
                            />
                        </label>
                    </div>
                    <Grid
                        items={items}
                        setItems={setItems}
                        onGridItemClick={handleGridItemClick}
                        dropTargetIndex={debouncedDropTargetIndex}
                        placementPreviewStyle={debouncedPlacementPreviewStyle}
                        relativeHoverPosition={debouncedRelativeHoverPosition}
                        translateTiming={translateTiming}
                        columnTimerActive={columnTimerActive}
                        gridGap={gridGap}
                    />
                </div>
                <div className="sidebar" style={{ overflow: "auto" }}>
                    {itemToEdit !== null ? (
                        <ItemEditor
                            item={itemToEdit}
                            onSaveChanges={handleSaveChanges}
                        />
                    ) : (
                        <BuilderElementsMenu />
                    )}
                </div>
                <DragOverlay dropAnimation={null}>
                    <div
                        style={{
                            opacity: ".5",
                            overflow: "hidden",
                            maxHeight: "200px",
                            maxWidth: "200px",
                        }}
                    >
                        {getComponentForPreview()}
                    </div>
                </DragOverlay>
                <PlacementPreview
                    ref={placementPreviewRef}
                    style={debouncedPlacementPreviewStyle}
                >
                    {getComponentForPreview()}
                </PlacementPreview>
            </DndContext>
        </div>
    );
};

export default PageBuilder;
