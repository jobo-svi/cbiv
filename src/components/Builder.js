import "../css/App.css";
import React, { useState, useEffect, useMemo } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    MeasuringStrategy,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import Grid from "./Grid";
import { data } from "../data";
import BuilderElementsMenu from "./BuilderElementsMenu";
import ItemEditor from "./ItemEditor";
import BuilderNavbar from "./BuilderNavbar";
import uuid from "react-uuid";
import { Components } from "./ComponentFactory";
import useMousePosition from "../hooks/useMousePosition";

const PageBuilder = () => {
    const [activeId, setActiveId] = useState(null);
    const mousePosition = useMousePosition();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [items, setItems] = useState(data.content.body);
    const itemIds = useMemo(() => items.map((item) => item._uid), [items]); // ["1", "2", "3"]

    const [placementPreviewStyle, setPlacementPreviewStyle] = useState({
        position: "absolute",
    });

    const [itemToEdit, setItemToEdit] = useState(null);

    const [hoverSide, setHoverSide] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);

    const handleGridItemClick = (item) => {
        setItemToEdit(item);
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

        setActiveId(active.id);
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

        setDropTargetIndex(null);
        setHoverSide(null);
        setPlacementPreviewStyle({
            position: "absolute",
        });
    }

    function handleDragMove(event) {
        const { active, over, collisions } = event;
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

                // Render the placement preview
                setPlacementPreviewStyle({
                    position: "absolute",
                    background: "#DDE6EF",
                    height: "48px",
                    width: over.rect.width,
                    //top: over.rect.top,
                    transition: "transform 150ms ease 0s",
                    //transform: `translate3d(0px, ${60 * dropTarget}px, 0px)`,
                    transform: `translate3d(0px, ${60 * dropTarget}px, 0px)`,
                });
            }
        }
    }

    function handleDragOver(event) {
        const { over } = event;

        // if (over) {
        //     setPlacementPreviewStyle({position: "absolute", background: "#DDE6EF", height: over.rect.height, width: over.rect.width, left: over.rect.left, top: over.rect.top })
        // }
    }

    function addElement(index, elementType) {
        const newItems = [...items];
        newItems.splice(index, 0, {
            _uid: uuid(),
            component: elementType,
            props: { ...Components[elementType].defaults.props },
        });
        return newItems;
    }

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            sensors={sensors}
            collisionDetection={closestCenter}
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
        </DndContext>
    );
};

export default PageBuilder;
