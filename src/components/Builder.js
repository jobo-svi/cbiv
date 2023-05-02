import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    Announcements,
    CollisionDetection,
    DragOverlay,
    DndContext,
    DropAnimation,
    defaultDropAnimation,
    KeyboardSensor,
    Modifiers,
    MouseSensor,
    PointerSensor,
    MeasuringConfiguration,
    PointerActivationConstraint,
    ScreenReaderInstructions,
    TouchSensor,
    UniqueIdentifier,
    useSensor,
    MeasuringStrategy,
    useSensors,
    Collision,
    Active,
    rectIntersection,
} from "@dnd-kit/core";
import {
    arrayMove,
    useSortable,
    SortableContext,
    sortableKeyboardCoordinates,
    SortingStrategy,
    rectSortingStrategy,
    verticalListSortingStrategy,
    defaultAnimateLayoutChanges,
    defaultNewIndexGetter,
} from "@dnd-kit/sortable";
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
import SortableItem from "./SortableItem";

const PageBuilder = () => {
    const measuringConfig = {
        droppable: {
            strategy: MeasuringStrategy.Always,
        },
    };

    const [activeId, setActiveId] = useState(null);
    // The lesson elements
    const [items, setItems] = useState(data.content.body);
    const itemIds = useMemo(() => items.map((item) => item._uid), [items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
    const [relativeHoverPosition, setRelativeHoverPosition] = useState(null);
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

    //const sensors = useSensors(mouseSensor, touchSensor);

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

        setActiveId(active.id);
    }

    function handleReorder(event) {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i._uid === active.id);
                const newIndex = items.findIndex((i) => i._uid === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        if (!active && !over) {
            return;
        }

        if (active.id.includes("menu-item")) {
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
        } else {
            handleReorder(event);
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
            const borderTop = hoverRect.top;
            const borderBottom = hoverRect.bottom;
            const topRange = borderTop + 5; //borderTop + elementHeight / 4;
            const bottomRange = borderBottom - 5; //borderBottom - elementHeight / 4;

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

    const zeroCoordinates = { x: 0, y: 0 };

    function distanceBetween(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    function sortCollisionsAsc({ data: { value: a } }, { data: { value: b } }) {
        return a - b;
    }

    function centerOfRectangle(rect, left = rect.left, top = rect.top) {
        return {
            x: left + rect.width * 0.5,
            y: top + rect.height * 0.5,
        };
    }

    function isHovered(pointer, clientRect) {
        if (!pointer || !clientRect) {
            return false;
        }

        return (
            pointer.x > clientRect.x &&
            pointer.x < clientRect.x + clientRect.width &&
            pointer.y > clientRect.y &&
            pointer.y < clientRect.y + clientRect.height
        );
    }

    let previosValue = [];
    let initialValue = [];

    const closestCenterr = ({
        collisionRect,
        droppableRects,
        droppableContainers,
        active,
        pointerCoordinates,
    }) => {
        const centerRect = centerOfRectangle(
            collisionRect,
            collisionRect.left,
            collisionRect.top
        );

        const currentIndex = initialValue.findIndex((v) => v.id === active.id);
        const currentId = previosValue[currentIndex]
            ? previosValue[currentIndex].id
            : null || active.id;
        let collisions = [];

        const currentRect = droppableRects.get(currentId);

        const centerCurrectRect = currentRect
            ? centerOfRectangle(currentRect)
            : zeroCoordinates;

        const spaceSize = 16;
        const isEnabled =
            Math.abs(centerCurrectRect.x - centerRect.x) >
                collisionRect.width + spaceSize ||
            Math.abs(centerCurrectRect.y - centerRect.y) >
                collisionRect.height + spaceSize;

        for (const droppableContainer of droppableContainers) {
            const { id } = droppableContainer;
            const rect = droppableRects.get(id);
            const clientRect = droppableContainer.node.current
                ? droppableContainer.node.current.getBoundingClientRect()
                : null;

            if (rect) {
                let distBetween = distanceBetween(
                    centerOfRectangle(rect),
                    isEnabled ? centerRect : centerCurrectRect
                );

                collisions.push({
                    id,
                    data: {
                        droppableContainer,
                        value: distBetween,
                        hovered:
                            active.id !== id
                                ? isHovered(pointerCoordinates, clientRect)
                                : false,
                    },
                });
            }
        }

        previosValue = collisions.sort(sortCollisionsAsc);

        if (initialValue.length === 0) {
            initialValue = previosValue;
        }

        return previosValue;
    };

    return (
        // <DndContext
        //     sensors={sensors}
        //     collisionDetection={rectIntersection}
        //     onDragStart={({ active }) => {
        //         if (!active) {
        //             return;
        //         }

        //         setActiveId(active.id);
        //     }}
        //     onDragEnd={handleDragEnd}
        //     onDragCancel={() => setActiveId(null)}
        // >
        //     <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        //         {items.map((id, index) => (
        //             <SortableItem
        //                 key={id}
        //                 id={id}
        //                 handle={false}
        //                 index={index}
        //                 style={() => ({})}
        //                 wrapperStyle={() => ({})}
        //                 disabled={false}
        //                 //renderItem={renderItem}
        //                 //onRemove={handleRemove}
        //                 animateLayoutChanges={defaultAnimateLayoutChanges}
        //                 useDragOverlay={true}
        //                 getNewIndex={defaultNewIndexGetter}
        //             >
        //                 <div
        //                     style={{
        //                         border: "1px solid black",
        //                         height: "50px",
        //                     }}
        //                 >
        //                     {id}
        //                 </div>
        //             </SortableItem>
        //         ))}
        //     </SortableContext>
        // </DndContext>
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            modifiers={[snapCenterToCursor]}
            sensors={sensors}
            collisionDetection={closestCenterr}
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
            </SortableContext>
        </DndContext>
    );
};

export default PageBuilder;
