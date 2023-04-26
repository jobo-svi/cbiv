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

const measuringConfig = {
    droppable: {
        strategy: MeasuringStrategy.Always,
    },
};

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

        // Ensure we're not hovering over the same element
        if (active.id !== over.id) {
            const oldIndex = items.map((i) => i._uid).indexOf(active.id);
            let newIndex = items.map((i) => i._uid).indexOf(over.id);

            if (oldIndex === -1) {
                console.log(newIndex);
                if (hoverSide === "bottom") {
                    newIndex += 1;
                }
                setItems(addElement(newIndex, active.data.current.type));
            } else {
                console.log(newIndex);

                setItems(arrayMove(items, oldIndex, newIndex));
            }
        }

        setActiveId(null);
    }

    // function handleDragEnd(event) {
    //     const { active, over } = event;
    //     if (over) {
    //         if (items.length === 0) {
    //             setItems(addElement(0, active.data.current.type));
    //         } else {
    //             let dropTargetIndex = items.map((i) => i._uid).indexOf(over.id);
    //             if (dropTargetIndex !== -1) {
    //                 if (hoverSide === "bottom") {
    //                     dropTargetIndex += 1;
    //                 }
    //                 setItems(
    //                     addElement(dropTargetIndex, active.data.current.type)
    //                 );
    //             }
    //         }
    //     }

    //     setDropTargetIndex(null);
    //     setHoverSide(null);
    // }

    function handleDragMove(event) {
        const { active, over, collisions } = event;
        if (over) {
            // Determine rectangle on screen
            const hoverBoundingRect = over.rect;

            // Get vertical middle
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
            }
        }
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

    useEffect(() => {
        console.log(items);
    }, [items]);

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={measuringConfig}
        >
            <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
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
                    <h1 style={{ opacity: ".5" }}>My Header</h1>
                </DragOverlay>
            </SortableContext>
        </DndContext>
    );
};

export default PageBuilder;
