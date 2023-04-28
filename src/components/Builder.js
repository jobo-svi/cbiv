import React, { useState, useEffect, useRef } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
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

    // What element we're currently dragging
    const [draggingElement, setDraggingElement] = useState(null);

    // Track the position of the mouse for positioning the drag preview
    const mousePosition = useMousePosition();

    // Keep a reference to the placement preview, for measuring its height
    const placementPreviewRef = useRef(null);
    const lessonContentRef = useRef(null);

    const [placementPreviewStyle, setPlacementPreviewStyle] = useState({
        position: "absolute",
        display: "none",
    });

    const [itemToEdit, setItemToEdit] = useState(null);

    const [relativeHoverPosition, setRelativeHoverPosition] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);

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
        if (over) {
            if (items.length === 0) {
                setItems(addElement(0, active.data.current.type, false));
            } else {
                let dropTargetIndex = items.map((i) => i._uid).indexOf(over.id);
                if (dropTargetIndex !== -1) {
                    if (relativeHoverPosition === "bottom") {
                        dropTargetIndex += 1;
                    }
                    setItems(
                        addElement(
                            dropTargetIndex,
                            active.data.current.type,
                            relativeHoverPosition === "center"
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
        console.log(lessonContentRef.current);
        let isWithinLessonContent =
            clientOffset.y >= lessonContentRef.current.top &&
            clientOffset.y <= lessonContentRef.current.bottom &&
            clientOffset.x >= lessonContentRef.current.left &&
            clientOffset.x <= lessonContentRef.current.right;

        if (over) {
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
                setPlacementPreviewStyle({
                    position: "absolute",
                    display: "none",
                });
                if (hoverPosition !== "center") {
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
        </DndContext>
    );
};

export default PageBuilder;
