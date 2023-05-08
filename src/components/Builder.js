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
    // The lesson elements
    const [items, setItems] = useState(data.content.body);

    // What element we're currently dragging, needed so we can measure it and show a placeholder in the dom
    const [draggingElement, setDraggingElement] = useState(null);

    // Closest element to your cursor when dragging, as determined by dnd-kit
    const [closestElement, setClosestElement] = useState(null);

    // Elements your drag element is intersecting with while dragging
    const [collisions, setCollisions] = useState(null);

    // Track the position of the mouse for positioning the drag preview
    const mousePosition = useMousePosition();

    // Keep a reference to the placement preview, for measuring its height
    const placementPreviewRef = useRef(null);

    const defaultPlacementPreviewStyle = {
        display: "none",
    };
    const [placementPreviewStyle, setPlacementPreviewStyle] = useState(
        defaultPlacementPreviewStyle
    );

    const [itemToEdit, setItemToEdit] = useState(null);

    // Position of the dragged element relative to the element being hovered over (above, below, center)
    const [relativeHoverPosition, setRelativeHoverPosition] = useState(null);

    // Where a new element will be inserted into the item array
    const [dropTargetIndex, setDropTargetIndex] = useState(null);

    // Whether or not the timer is active while hovering over an element while dragging
    const [columnTimerActive, setColumnTimerActive] = useState(false);

    // Configurable debug settings
    const [translateTiming, setTranslateTiming] = useState(
        +localStorage.getItem("translateTiming") || 300
    );

    const [columnDelayTiming, setColumnDelayTiming] = useState(
        +localStorage.getItem("columnDelayTiming") || 1000
    );

    const [gridGap, setGridGap] = useState(
        +localStorage.getItem("gridGap") || 24
    );

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

    // Persists debug settings across sessions
    useEffect(() => {
        localStorage.setItem("translateTiming", translateTiming);
        localStorage.setItem("columnDelayTiming", columnDelayTiming);
        localStorage.setItem("gridGap", gridGap);
    }, [translateTiming, columnDelayTiming]);

    // Timer for how long to hover before combining elements into multicolumn
    useTimeout(
        () => {
            setDropTargetIndex(dropTargetIndex);
            setRelativeHoverPosition("center");
            setColumnTimerActive(false);
        },
        !columnTimerActive ? null : columnDelayTiming
    );

    // Position the placement preview
    useEffect(() => {
        if (!closestElement || !items.length) {
            return;
        }

        if (columnTimerActive) {
            let newStyle = defaultPlacementPreviewStyle;

            if (
                shouldUpdatePlacementPreviewStyle(
                    placementPreviewStyle,
                    newStyle
                )
            ) {
                setPlacementPreviewStyle(newStyle);
            }
        }

        if (relativeHoverPosition === "center" && !columnTimerActive) {
            const columnCount = items.find((i) => i._uid === closestElement.id)
                .columns.length;
            const columnWidth = closestElement.rect.width / (columnCount + 1);
            const columnXOffset =
                closestElement.rect.left + columnWidth * columnCount;

            let newStyle = {
                left: columnXOffset,
                width: closestElement.rect.width / (columnCount + 1),
                transition: `transform ${translateTiming}ms ease 0s`,
                transform: `translate3d(0px, ${closestElement.rect.top}px, 0px)`,
            };
            if (
                shouldUpdatePlacementPreviewStyle(
                    placementPreviewStyle,
                    newStyle
                )
            ) {
                setPlacementPreviewStyle(newStyle);
            }
        } else if (!columnTimerActive) {
            // get the dimensions of the element that matches the droptarget
            let item = items[dropTargetIndex];
            if (dropTargetIndex === items.length) {
                item = items[items.length - 1];
            }

            let additional = 0;
            if (dropTargetIndex === items.length) {
                additional += closestElement.rect.height + gridGap;
            }

            // Render the placement preview
            if (collisions) {
                let c = collisions.find((c) => c.id === item._uid);

                if (c) {
                    c = c.data.droppableContainer.rect.current;

                    let additional = 0;
                    if (dropTargetIndex === items.length) {
                        additional += c.height + gridGap;
                    }

                    // Render the placement preview
                    let newStyle = {
                        display: "block",
                        width: c.width,
                        left: c.left,
                        transition: `transform ${translateTiming}ms ease 0s`,
                        transform: `translate3d(0px, ${c.top +
                            additional}px, 0px)`,
                    };

                    if (
                        shouldUpdatePlacementPreviewStyle(
                            placementPreviewStyle,
                            newStyle
                        )
                    ) {
                        setPlacementPreviewStyle(newStyle);
                    }
                }
            }
        }
    }, [
        relativeHoverPosition,
        closestElement,
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
        setClosestElement(over);
        setCollisions(collisions);
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        if (over) {
            if (items.length === 0) {
                setItems(addElement(0, active.data.current.type, false));
            } else {
                let dropIndex = items.map((i) => i._uid).indexOf(over.id);
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
        setClosestElement(null);
        setCollisions(null);
        setDropTargetIndex(null);
        setRelativeHoverPosition(null);
        setPlacementPreviewStyle(defaultPlacementPreviewStyle);
    }

    function handleDragMove(event) {
        const { over, collisions } = event;

        const clientOffset = mousePosition.current;

        if (over) {
            setClosestElement(over);
            setCollisions(collisions);

            // The coordinates of the element we're hovering over
            const hoverRect = over.rect;

            // Determine mouse position relative to dndkit's closest match
            const elementHeight = over.rect.height;
            const borderTop = hoverRect.top;
            const borderBottom = hoverRect.bottom;
            const topRange = borderTop + elementHeight / 5;
            const bottomRange = borderBottom + elementHeight / 5;

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
            let dropTarget = items.map((i) => i._uid).indexOf(over.id);
            let hoverPosition = null;
            if (dropTarget !== -1) {
                // Where are we hovering near
                if (aboveElement) {
                    hoverPosition = "top";
                } else if (belowElement) {
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
                row.columns = row.columns.filter((c) => c._uid != column._uid);
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

    // TODO: find a better way to do this. Poor man's usememo - only update state if the object has changed
    const shouldUpdatePlacementPreviewStyle = (previewStyle, newStyle) => {
        return (
            previewStyle.display !== newStyle.display ||
            previewStyle.width !== newStyle.width ||
            previewStyle.left !== newStyle.left ||
            previewStyle.transition !== newStyle.transition ||
            previewStyle.transform !== newStyle.transform
        );
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
                        dropTargetIndex={dropTargetIndex}
                        placementPreviewRef={placementPreviewRef}
                        relativeHoverPosition={relativeHoverPosition}
                        translateTiming={translateTiming}
                        columnTimerActive={columnTimerActive}
                        gridGap={gridGap}
                    />
                </div>
                <div className="sidebar">
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
                    style={placementPreviewStyle}
                >
                    {getComponentForPreview()}
                </PlacementPreview>
            </DndContext>
        </div>
    );
};

export default PageBuilder;