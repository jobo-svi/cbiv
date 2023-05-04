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
import "../css/App.css";
import { data } from "../data";
import useMousePosition from "../hooks/useMousePosition";
import Grid from "./Grid";
import BuilderElementsMenu from "./BuilderElementsMenu";
import ItemEditor from "./ItemEditor";
import BuilderNavbar from "./BuilderNavbar";
import PlacementPreview from "./PlacementPreview";
import { Components, constructComponent } from "./ComponentFactory";

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

    const [placementPreviewStyle, setPlacementPreviewStyle] = useState({
        display: "none",
    });

    const [itemToEdit, setItemToEdit] = useState(null);

    // Position of the dragged element relative to the element being hovered over (above, below, center)
    const [relativeHoverPosition, setRelativeHoverPosition] = useState(null);

    // Where a new element will be inserted into the item array
    const [dropTargetIndex, setDropTargetIndex] = useState(null);

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

    // Position the placement preview
    useEffect(() => {
        if (!closestElement || !items.length) {
            return;
        }

        if (relativeHoverPosition === "center") {
            const columnCount = items.find((i) => i._uid === closestElement.id)
                .columns.length;
            const columnWidth = closestElement.rect.width / (columnCount + 1);
            const columnXOffset =
                closestElement.rect.left + columnWidth * columnCount;
            setPlacementPreviewStyle({
                top: 0,
                left: columnXOffset,
                width: closestElement.rect.width / (columnCount + 1),
                transition: "transform 150ms ease 0s",
                transform: `translate3d(0px, ${closestElement.rect.top}px, 0px)`,
            });
        } else {
            // get the dimensions of the element that matches the droptarget
            let item = items[dropTargetIndex];
            if (dropTargetIndex === items.length) {
                item = items[items.length - 1];
            }

            let additional = 0;
            if (dropTargetIndex === items.length) {
                additional += closestElement.rect.height + 16;
            }

            // Render the placement preview
            setPlacementPreviewStyle({
                width: closestElement.rect.width,
                left: closestElement.rect.left,
                transition: "transform 150ms ease 0s",
                transform: `translate3d(0px, ${closestElement.rect.top +
                    additional}px, 0px)`,
            });

            if (collisions) {
                let c = collisions.find((c) => c.id === item._uid);

                if (c) {
                    c = c.data.droppableContainer.rect.current;

                    let additional = 0;
                    if (dropTargetIndex === items.length) {
                        additional += c.height + 16;
                    }

                    // Render the placement preview
                    setPlacementPreviewStyle({
                        width: c.width,
                        left: c.left,
                        transition: "transform 150ms ease 0s",
                        transform: `translate3d(0px, ${c.top +
                            additional}px, 0px)`,
                    });
                }
            }
        }
    }, [relativeHoverPosition, closestElement, dropTargetIndex, collisions]);

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
                                relativeHoverPosition === "center"
                            )
                        );
                    } else {
                        setItems(
                            moveElement(
                                item,
                                dropIndex,
                                relativeHoverPosition === "center"
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
        setPlacementPreviewStyle({
            display: "none",
        });
    }

    function handleDragMove(event) {
        const { active, over, collisions } = event;

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
            const bottomRange = borderBottom - elementHeight / 5;

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
                if (insideTop || aboveElement) {
                    hoverPosition = "top";
                } else if (insideBottom || belowElement) {
                    hoverPosition = "bottom";
                    dropTarget += 1;
                } else if (insideCenter) {
                    hoverPosition = "center";
                }

                setRelativeHoverPosition(hoverPosition);
                setDropTargetIndex(dropTarget);
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
                console.log("dragging new");
                return constructComponent(
                    Components[draggingElement.data.current.type]
                );
            }
        }
    };

    const getElementById = (id) => {
        return items.flatMap((row) => row.columns).find((c) => c._uid === id);
    };

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            collisionDetection={closestCenter}
            modifiers={[snapCenterToCursor]}
            sensors={sensors}
        >
            <div className="builder">
                <BuilderNavbar />
                <div className="lessons">lessons</div>
                <div className="lesson-content">
                    <Grid
                        items={items}
                        setItems={setItems}
                        onGridItemClick={handleGridItemClick}
                        dropTargetIndex={dropTargetIndex}
                        placementPreviewRef={placementPreviewRef}
                        relativeHoverPosition={relativeHoverPosition}
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
                    <h1 style={{ opacity: ".5" }}>Drag Preview</h1>
                </DragOverlay>
                <PlacementPreview
                    ref={placementPreviewRef}
                    style={placementPreviewStyle}
                >
                    {getComponentForPreview()}
                </PlacementPreview>
            </div>
        </DndContext>
    );
};

export default PageBuilder;
