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
import useDebounce from "../hooks/useDebounce";
import useTimeout from "../hooks/useTimeout";
import Grid from "./Grid";
import BuilderElementsMenu from "./BuilderElementsMenu";
import ItemEditor from "./ItemEditor";
import BuilderNavbar from "./BuilderNavbar";
import PlacementPreview from "./PlacementPreview";
import { Components, constructComponent } from "./ComponentFactory";

const PageBuilder = () => {
    const closestElement = useRef(null);

    // The lesson elements
    const [items, setItems] = useState(data.content.body);

    // What element we're currently dragging
    const [draggingElement, setDraggingElement] = useState(null);

    // Track the position of the mouse for positioning the drag preview
    const mousePosition = useMousePosition();

    // Keep a reference to the placement preview, for measuring its height
    const placementPreviewRef = useRef(null);
    const lessonContentRef = useRef(null);
    const [relativeHoverPosition, setRelativeHoverPosition] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);

    const [placementPreviewStyle, setPlacementPreviewStyle] = useState({
        position: "absolute",
        display: "none",
    });

    const [itemToEdit, setItemToEdit] = useState(null);

    // dndkit sensors for mouse and touch
    const mouseSensor = useSensor(MouseSensor, {
        // Require the mouse to move by 1 pixel before activating, so we can differentiate between drag and click
        activationConstraint: {
            distance: 1,
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        // Press, with tolerance of 5px of movement
        activationConstraint: {
            delay: 25,
            tolerance: 5,
        },
    });

    const sensors = useSensors(mouseSensor, touchSensor);

    const [hoverTimeout, setHoverTimeout] = useState(null);
    // useTimeout(() => {
    //     // setPlacementPreviewStyle({
    //     //     position: "absolute",
    //     //     display: "none",
    //     // });
    //     setHoverTimeout(null);
    // }, hoverTimeout);

    const handleGridItemClick = (item) => {
        //setItemToEdit(item);
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
        const { active } = event;
        setDraggingElement(active);
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        if (closestElement.current) {
            if (items.length === 0) {
                setItems(addElement(0, active.data.current.type, false));
            } else {
                let dropTargetIndex = items
                    .map((i) => i._uid)
                    .indexOf(closestElement.current.id);
                if (dropTargetIndex !== -1) {
                    if (
                        !closestElement.current.hoveringWithinCenter &&
                        closestElement.current.relativePositionY === "bottom"
                    ) {
                        dropTargetIndex += 1;
                    }

                    setItems(
                        addElement(
                            dropTargetIndex,
                            active.data.current.type,
                            closestElement.current.hoveringWithinCenter
                        )
                    );
                }
            }
        }

        setDraggingElement(null);
        setDropTargetIndex(null);
        setRelativeHoverPosition(null);
        setPlacementPreviewStyle({
            position: "absolute",
            display: "none",
        });
    }

    function handleDragMove(event) {
        const { active, over, collisions } = event;

        const clientOffset = mousePosition.current;

        if (over) {
            // The coordinates of the element we're hovering over
            const hoverRect = over.rect;

            // Determine mouse position relative to dndkit's closest match
            const elementHeight = over.rect.height;
            const elementWidth = over.rect.width;
            const borderTop = hoverRect.top;
            const borderBottom = hoverRect.bottom;
            const topRange = borderTop + elementHeight / 5;
            const bottomRange = borderBottom - elementHeight / 5;

            const hoveringWithinElement =
                clientOffset.y >= hoverRect.top &&
                clientOffset.y <= hoverRect.bottom &&
                clientOffset.x >= hoverRect.left &&
                clientOffset.x <= hoverRect.right;

            let relativePositionY = null;
            if (clientOffset.y < hoverRect.top + elementHeight / 2) {
                relativePositionY = "top";
            } else {
                relativePositionY = "bottom";
            }

            let relativePositionX = null;
            if (clientOffset.x < hoverRect.left + elementWidth / 2) {
                relativePositionX = "left";
            } else {
                relativePositionX = "right";
            }

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

            closestElement.current = {
                id: over.id,
                hoveringWithin: hoveringWithinElement,
                hoveringWithinCenter: insideCenter,
                relativePositionY: relativePositionY,
                relativePositionX: relativePositionX,
            };

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
                // setPlacementPreviewStyle({
                //     position: "absolute",
                //     display: "none",
                // });
                if (hoverPosition !== "center") {
                    setHoverTimeout(null);

                    // get the dimensions of the element that matches the droptarget
                    let item = items[dropTarget];
                    let additional = 0;
                    if (dropTarget === items.length) {
                        item = items[items.length - 1];
                    }

                    let c = collisions.find((c) => c.id === item._uid);

                    if (c) {
                        c = c.data.droppableContainer.rect.current;

                        if (dropTarget === items.length) {
                            additional += c.height + 16;
                        }

                        // Render the placement preview
                        setPlacementPreviewStyle({
                            position: "absolute",
                            background: "#cae4ff",
                            width: c.width,
                            top: 0,
                            left: c.left,
                            transition: "transform 150ms ease 0s",
                            transform: `translate3d(0px, ${c.top +
                                additional}px, 0px)`,
                        });
                    } else {
                        setPlacementPreviewStyle({
                            position: "absolute",
                            display: "none",
                        });
                    }
                } else {
                    setHoverTimeout(2000);
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
                <div className="lesson-content" ref={lessonContentRef}>
                    <Grid
                        items={items}
                        setItems={setItems}
                        onGridItemClick={handleGridItemClick}
                        dropTargetIndex={dropTargetIndex}
                        placementPreviewStyle={placementPreviewStyle}
                        draggingElement={draggingElement}
                        placementPreviewRef={placementPreviewRef}
                        closestElement={closestElement}
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
                    {draggingElement
                        ? constructComponent(
                              Components[draggingElement.data.current.type]
                          )
                        : null}
                </PlacementPreview>
            </div>
        </DndContext>
    );
};

export default PageBuilder;
