import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    CollisionDescriptor,
    CollisionDetection,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS, Coordinates } from "@dnd-kit/utilities";
import uuid from "react-uuid";
import SortableItem from "./SortableItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Grid from "./Grid";
import BuilderElementsMenu from "./BuilderElementsMenu";
import ItemEditor from "./ItemEditor";
import BuilderNavbar from "./BuilderNavbar";
import PlacementPreview from "./PlacementPreview";
import { Components, constructComponent } from "./ComponentFactory";
import useTimeout from "../hooks/useTimeout";
import usePrevious from "../hooks/usePrevious";
import useMousePosition from "../hooks/useMousePosition";
import { data } from "../data";
import "../css/App.css";
import { snapDragHandleToCursor } from "../modifiers/snapDragHandleToCursor";
import DebugValues from "./DebugValues";

const PageBuilder = () => {
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

    const closestCenter = ({
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
            : active.id;
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

    // The lesson elements
    const [items, setItems] = useState(data.content.body);
    const itemIds = useMemo(() => items.map((item) => item.id), [items]);
    const spacerInsertedRef = useRef();
    const currentDragFieldRef = useRef();
    const [activeSidebarField, setActiveSidebarField] = useState(); // only for fields from the sidebar
    const [activeField, setActiveField] = useState(); // only for fields that are in the form.
    const [sidebarFieldsRegenKey, setSidebarFieldsRegenKey] = useState(
        Date.now()
    );
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function createSpacer({ id }) {
        return {
            id,
            component: "spacer",
            title: "spacer",
        };
    }

    // What element we're currently dragging, needed so we can measure it and show a placeholder in the dom
    const [draggingElement, setDraggingElement] = useState(null);

    // Closest element to your cursor when dragging, as determined by dnd-kit
    const [closestRow, setClosestRow] = useState(null);

    // Elements your drag element is intersecting with while dragging. This array changes a lot so I made it a ref instead of state.
    const dragCollisions = useRef(null);

    // Track the position of the mouse for positioning the drag preview
    const mousePosition = useMousePosition();

    // Measure the height of the grid content
    const gridWrapperRef = useRef(null);

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
    const [dropTargetIndex, setDropTargetIndex] = useState(0);
    const [lastDropTargetIndex, setLastDropTargetIndex] = useState(
        dropTargetIndex
    );
    const [debouncedDropTargetIndex, setDebouncedDropTargetIndex] = useState(
        dropTargetIndex
    );
    const prevDropTargetIndex = usePrevious(debouncedDropTargetIndex);

    useEffect(() => {
        if (prevDropTargetIndex !== null) {
            setLastDropTargetIndex(prevDropTargetIndex);
        }
    }, [debouncedDropTargetIndex]);

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

    const getComponentForPreview = () => {
        if (activeSidebarField) {
            console.log(1);
            return constructComponent(Components[activeSidebarField.component]);
        } else if (activeField) {
            console.log(2);
            return constructComponent(Components[activeField.component]);
        } else {
            return null;
        }
    };

    const cleanUp = () => {
        setActiveSidebarField(null);
        setActiveField(null);
        currentDragFieldRef.current = null;
        spacerInsertedRef.current = false;
    };

    const handleDragStart = (e) => {
        const { active } = e;
        let activeData = {};
        if (active.data.current) {
            activeData = active.data.current;
        }

        // This is where the cloning starts.
        // We set up a ref to the field we're dragging
        // from the sidebar so that we can finish the clone
        // in the onDragEnd handler.
        if (activeData.isNewElement) {
            const { component } = activeData;
            setActiveSidebarField(activeData);
            // Create a new field that'll be added to the fields array
            // if we drag it over the canvas.
            currentDragFieldRef.current = {
                id: active.id,
                component,
                name: `${component}${items.length + 1}`,
                parent: null,
            };
            return;
        }

        // We aren't creating a new element so go ahead and just insert the spacer
        // since this field already belongs to the canvas.
        const { id, index } = activeData;

        const item = items.find((item) => item.id === id);
        setActiveField(item);
        currentDragFieldRef.current = item;

        let updateItems = [...items];
        updateItems.splice(index, 1, createSpacer({ id: active.id }));
        setItems(updateItems);
    };

    const handleDragOver = (e) => {
        const { active, over } = e;
        let activeData = {};
        if (active.data.current) {
            activeData = active.data.current;
        }

        // Once we detect that a sidebar field is being moved over the canvas
        // we create the spacer using the sidebar fields id with a spacer suffix and add into the
        // fields array so that it'll be rendered on the canvas.

        // 🐑 CLONING 🐑
        // This is where the clone occurs. We're taking the id that was assigned to
        // sidebar field and reusing it for the spacer that we insert to the canvas.
        if (activeData.isNewElement) {
            let overData = {};
            if (over.data.current) {
                overData = over.data.current;
            }

            if (!spacerInsertedRef.current) {
                const spacer = createSpacer({
                    id: active.id + "-spacer",
                });

                let updateItems = [...items];
                if (!updateItems.length) {
                    updateItems.push(spacer);
                    setItems(updateItems);
                } else {
                    const nextIndex =
                        overData.index > -1
                            ? overData.index
                            : updateItems.length;

                    updateItems.splice(nextIndex, 0, spacer);
                    setItems(updateItems);
                }
                spacerInsertedRef.current = true;
            } else if (!over) {
                // This solves the issue where you could have a spacer handing out in the canvas if you drug
                // a sidebar item on and then off
                let updateItems = [...items];
                updateItems = updateItems.filter(
                    (f) => f.component !== "spacer"
                );
                setItems(updateItems);
                spacerInsertedRef.current = false;
            } else {
                // Since we're still technically dragging the sidebar draggable and not one of the sortable draggables
                // we need to make sure we're updating the spacer position to reflect where our drop will occur.
                // We find the spacer and then swap it with the over skipping the op if the two indexes are the same
                let updateItems = [...items];
                const spacerIndex = updateItems.findIndex(
                    (f) => f.id === active.id + "-spacer"
                );

                const nextIndex =
                    overData.index > -1
                        ? overData.index
                        : updateItems.length - 1;

                if (nextIndex === spacerIndex) {
                    return;
                }

                updateItems = arrayMove(
                    updateItems,
                    spacerIndex,
                    overData.index
                );
                setItems(updateItems);
            }
        }
    };

    const handleDragEnd = (e) => {
        const { over } = e;

        // We dropped outside of the over so clean up so we can start fresh.
        if (!over) {
            cleanUp();

            let updateItems = [...items];
            updateItems = updateItems.filter((f) => f.component !== "spacer");
            setItems(updateItems);

            return;
        }

        // This is where we commit the clone.
        // We take the field from the this ref and replace the spacer we inserted.
        // Since the ref just holds a reference to a field that the context is aware of
        // we just swap out the spacer with the referenced field.
        let nextField = currentDragFieldRef.current;

        if (nextField) {
            let overData = {};
            if (over.data.current) {
                overData = over.data.current;
            }

            let updateItems = [...items];
            const spacerIndex = updateItems.findIndex(
                (f) => f.component === "spacer"
            );
            updateItems.splice(spacerIndex, 1, {
                id: uuid(),
                component: nextField.component,
                props: { ...Components[nextField.component].props },
            });

            updateItems = arrayMove(
                updateItems,
                spacerIndex,
                overData.index || 0
            );

            setItems(updateItems);
        }

        setSidebarFieldsRegenKey(Date.now());
        cleanUp();
    };

    const { listeners, setNodeRef, transform, transition } = useDroppable({
        id: "canvas_droppable",
        data: {
            parent: null,
            isContainer: true,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            className="builder"
            style={{ cursor: draggingElement ? "grabbing" : "" }}
        >
            <BuilderNavbar />
            <div className="lessons">lessons</div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="lesson-content">
                    {/* <DebugValues
                        translateTiming={translateTiming}
                        setTranslateTiming={setTranslateTiming}
                        columnDelayTiming={columnDelayTiming}
                        setColumnDelayTiming={setColumnDelayTiming}
                        slopTiming={slopTiming}
                        setSlopTiming={setSlopTiming}
                        gridGap={gridGap}
                        setGridGap={setGridGap}
                    /> */}
                    <SortableContext
                        items={itemIds}
                        strategy={verticalListSortingStrategy}
                    >
                        <div
                            ref={setNodeRef}
                            className="canvas"
                            style={style}
                            {...listeners}
                        >
                            {items.length > 0 &&
                                items.map((item, i) => (
                                    <SortableItem
                                        key={item.id}
                                        id={item.id}
                                        index={i}
                                    >
                                        {constructComponent(item)}
                                    </SortableItem>
                                ))}
                        </div>
                    </SortableContext>
                </div>
                <div className="sidebar" style={{ overflow: "auto" }}>
                    {/* {itemToEdit !== null ? (
                        <ItemEditor
                            item={itemToEdit}
                            onSaveChanges={handleSaveChanges}
                        />
                    ) : (
                        <BuilderElementsMenu />
                    )} */}
                    <BuilderElementsMenu />
                </div>
                <DragOverlay dropAnimation={null}>
                    <div style={{ background: "gray", color: "white" }}>
                        {getComponentForPreview()}
                    </div>
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default PageBuilder;
