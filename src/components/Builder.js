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

    const [placementPreviewStyle, setPlacementPreviewStyle] = useState({
        position: "absolute",
        display: "none",
    });

    const [itemToEdit, setItemToEdit] = useState(null);

    const [hoverSide, setHoverSide] = useState(null);
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
                setItems(addElement(0, active.data.current.type));
            } else {
                let dropTargetIndex = items.map((i) => i._uid).indexOf(over.id);
                if (dropTargetIndex !== -1) {
                    if (hoverSide === "bottom") {
                        dropTargetIndex += 1;
                    }
                    setItems(
                        addElement(dropTargetIndex, active.data.current.type)
                    );
                }
            }
        }

        setDraggingElement(null);
        setDropTargetIndex(null);
        setHoverSide(null);
        setPlacementPreviewStyle({
            position: "absolute",
            display: "none",
        });
    }

    function handleDragMove(event) {
        const { active, over, collisions } = event;
        //console.log(event);
        if (over) {
            // The coordinates of the element we're hovering over
            const hoverBoundingRect = over.rect;

            // Get the vertical middle of the element
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = mousePosition.current;

            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            // Determine position of element if it were dropped
            let dropTarget = items.map((i) => i._uid).indexOf(over.id);

            if (dropTarget !== -1) {
                // Hovering top or bottom
                if (hoverClientY < hoverMiddleY) {
                    setHoverSide("top");
                } else {
                    setHoverSide("bottom");
                    dropTarget += 1;
                }

                setDropTargetIndex(dropTarget);

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
                        additional += c.height + 10;
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

    function handleDragOver(event) {
        const { over } = event;
    }

    function addElement(index, elementType) {
        const newItems = [...items];
        newItems.splice(index, 0, {
            _uid: uuid(),
            component: elementType,
            props: { ...Components[elementType].props },
        });
        return newItems;
    }

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            collisionDetection={closestCenter}
            modifiers={[snapCenterToCursor]}
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
                        placementPreviewStyle={placementPreviewStyle}
                        draggingElement={draggingElement}
                        placementPreviewRef={placementPreviewRef}
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
