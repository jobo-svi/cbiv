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
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

    // // dndkit sensors
    // const mouseSensor = useSensor(MouseSensor, {
    //     // Require the mouse to move by 1 pixel before activating, so we can differentiate between drag and click
    //     activationConstraint: {
    //         distance: 1,
    //     },
    // });

    // const touchSensor = useSensor(TouchSensor, {
    //     // Press, with tolerance of 5px of movement
    //     activationConstraint: {
    //         tolerance: 5,
    //     },
    // });

    // const sensors = useSensors(mouseSensor, touchSensor);

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

    // // Timer for how long to hover before combining elements into multicolumn
    // useTimeout(
    //     () => {
    //         setDebouncedDropTargetIndex(dropTargetIndex);
    //         setDebouncedRelativeHoverPosition("center");
    //         setColumnTimerActive(false);
    //     },
    //     !columnTimerActive ? null : columnDelayTiming
    // );

    // // Timer for how long to wait before UI updates aka "slop for the code piggies."
    // // For some reason, dndkit fires ondragmove AFTER ondragend if you drag and drop very quickly,
    // // so we have to check if we're actually dragging before applying UI updates.
    // const [uiTimerActive, setUITimerActive] = useState(false);
    // useTimeout(
    //     () => {
    //         // Double make sure that we're actually dragging.
    //         if (draggingElement !== null) {
    //             setDebouncedPlacementPreviewStyle(placementPreviewStyle);
    //             setDebouncedDropTargetIndex(dropTargetIndex);
    //             setDebouncedRelativeHoverPosition(relativeHoverPosition);
    //         }

    //         setUITimerActive(false);
    //     },
    //     !uiTimerActive ? null : slopTiming
    // );

    // useEffect(() => {
    //     // Make sure we're actually dragging and that a timer isn't already running
    //     if (draggingElement !== null && !uiTimerActive) {
    //         setUITimerActive(true);
    //     }
    // }, [placementPreviewStyle, dropTargetIndex, relativeHoverPosition]);

    // // Position the placement preview
    // useEffect(() => {
    //     // if (!draggingElement || !closestRow || !items.length) {
    //     //     return;
    //     // }
    //     // // get the dimensions of the element that matches the droptarget
    //     // let item = items[dropTargetIndex];
    //     // if (dropTargetIndex === items.length) {
    //     //     item = items[items.length - 1];
    //     // }
    //     // if (columnTimerActive && dragCollisions.current) {
    //     //     let c = dragCollisions.current.find((c) => c.id === item.id);
    //     //     if (c) {
    //     //         c = c.data.droppableContainer.rect.current;
    //     //         // Transition the placement preview to height = 0 while we wait for the timer
    //     //         let newStyle = {
    //     //             transition: `height 300ms ease 0s, top 300ms ease 0s`,
    //     //             top: placementPreviewRef.current.style.top,
    //     //             left: c.left,
    //     //             width: c.width,
    //     //             height: 0,
    //     //         };
    //     //         updatePlacementPreviewStyle(placementPreviewStyle, newStyle);
    //     //     }
    //     // }
    //     // let previewHeight = getPreviewHeight();
    //     // if (relativeHoverPosition === "center" && !columnTimerActive) {
    //     //     // We've been hovering long enough and can now show the preview
    //     //     const columnCount = items.find((i) => i.id === closestRow.id)
    //     //         .columns.length;
    //     //     const columnWidth =
    //     //         (closestRow.data.droppableContainer.rect.current.width -
    //     //             gridGap * columnCount) /
    //     //         (columnCount + 1);
    //     //     const columnXOffset =
    //     //         closestRow.data.droppableContainer.rect.current.left +
    //     //         columnWidth * columnCount +
    //     //         gridGap * columnCount;
    //     //     // There are certain invalid states where we don't want to show a drag preview
    //     //     const validPlacement = isValidPlacement(
    //     //         draggingElement,
    //     //         items,
    //     //         dropTargetIndex
    //     //     );
    //     //     if (validPlacement) {
    //     //         let newStyle = {
    //     //             top: closestRow.data.droppableContainer.rect.current.top,
    //     //             left: columnXOffset,
    //     //             width: columnWidth,
    //     //             height: previewHeight,
    //     //             transition: `height 300ms ease 0s, top 300ms ease 0s`,
    //     //         };
    //     //         updatePlacementPreviewStyle(placementPreviewStyle, newStyle);
    //     //     } else {
    //     //         setDebouncedDropTargetIndex(null);
    //     //         setDebouncedRelativeHoverPosition(null);
    //     //         setDebouncedPlacementPreviewStyle(defaultPlacementPreviewStyle);
    //     //         setUITimerActive(false);
    //     //     }
    //     // } else if (!columnTimerActive) {
    //     //     // Render the placement preview
    //     //     if (dragCollisions.current) {
    //     //         let c = dragCollisions.current.find((c) => c.id === item.id);
    //     //         if (c) {
    //     //             const rect = c.data.droppableContainer.rect.current;
    //     //             let additional = 0;
    //     //             if (dropTargetIndex === items.length) {
    //     //                 additional += rect.height + gridGap;
    //     //             }
    //     //             // There are certain invalid states where we don't want to show a drag preview
    //     //             const validPlacement = isValidPlacement(
    //     //                 draggingElement,
    //     //                 items,
    //     //                 dropTargetIndex
    //     //             );
    //     //             if (validPlacement) {
    //     //                 // Render the placement preview
    //     //                 let newStyle = {
    //     //                     visibility: "visible",
    //     //                     width: rect.width,
    //     //                     height: previewHeight,
    //     //                     top: rect.top + additional,
    //     //                     left: rect.left,
    //     //                     transition: `transform ${translateTiming}ms ease 0s, height 400ms ease 0s, top 400ms ease 0s`,
    //     //                 };
    //     //                 updatePlacementPreviewStyle(
    //     //                     placementPreviewStyle,
    //     //                     newStyle
    //     //                 );
    //     //             } else {
    //     //                 setDebouncedDropTargetIndex(null);
    //     //                 setDebouncedRelativeHoverPosition(null);
    //     //                 setDebouncedPlacementPreviewStyle({
    //     //                     ...placementPreviewStyle,
    //     //                     height: 0,
    //     //                 });
    //     //                 setUITimerActive(false);
    //     //             }
    //     //         }
    //     //     }
    //     // }
    // }, [relativeHoverPosition, closestRow, dropTargetIndex, columnTimerActive]);

    // const handleGridItemClick = (item) => {
    //     //setItemToEdit(item);
    //     console.log("clicked grid item", item);
    // };

    // const handleSaveChanges = (updatedItem) => {
    //     setItems(
    //         items.map((item) =>
    //             item.id === updatedItem.id ? updatedItem : item
    //         )
    //     );
    //     setItemToEdit(null);
    // };

    // function handleDragStart(event) {
    //     const { active } = event;
    //     setDraggingElement(active);

    //     // While dragging, increase the height of the content area to account for the drag preview dimensions.
    //     gridWrapperRef.current.style.height = `${gridWrapperRef.current
    //         .clientHeight + active.data.current.height}px`;
    // }

    // function handleDragMove(event) {
    //     const { collisions } = event;
    //     dragCollisions.current = collisions;

    //     const closestRow = getClosestRow(collisions);
    //     setClosestRow(closestRow);

    //     if (closestRow) {
    //         // The coordinates of the element we're hovering over
    //         const hoverRect = closestRow.data.droppableContainer.rect.current;

    //         // Determine mouse position relative to dndkit's closest match
    //         const elementHeight =
    //             closestRow.data.droppableContainer.rect.current.height;
    //         const borderTop = hoverRect.top;
    //         const borderBottom = hoverRect.bottom;
    //         const topRange = borderTop + elementHeight / 4;
    //         const bottomRange = borderBottom - elementHeight / 4;

    //         const clientOffset = mousePosition.current;
    //         const hoveringWithinElement =
    //             clientOffset.y >= hoverRect.top &&
    //             clientOffset.y <= hoverRect.bottom &&
    //             clientOffset.x >= hoverRect.left &&
    //             clientOffset.x <= hoverRect.right;

    //         const insideTop =
    //             hoveringWithinElement &&
    //             clientOffset.y <= topRange &&
    //             clientOffset.y >= borderTop;

    //         const insideBottom =
    //             hoveringWithinElement &&
    //             clientOffset.y >= bottomRange &&
    //             clientOffset.y <= borderBottom;

    //         const insideCenter =
    //             hoveringWithinElement && !insideTop && !insideBottom;

    //         const aboveElement =
    //             !hoveringWithinElement &&
    //             clientOffset.y < hoverRect.top + elementHeight / 2;

    //         const belowElement =
    //             !hoveringWithinElement &&
    //             clientOffset.y > hoverRect.top + elementHeight / 2;

    //         // Determine position of element if it were dropped
    //         let dropTarget = items.map((i) => i.id).indexOf(closestRow.id);
    //         let hoverPosition = null;
    //         if (dropTarget !== -1) {
    //             // Where are we hovering near
    //             if (aboveElement || insideTop) {
    //                 hoverPosition = "top";
    //             } else if (belowElement || insideBottom) {
    //                 hoverPosition = "bottom";
    //                 //dropTarget += 1;
    //             } else if (insideCenter) {
    //                 hoverPosition = "center";
    //             }

    //             setDropTargetIndex(dropTarget);
    //             setRelativeHoverPosition(hoverPosition);

    //             // Cancel the column timer if we ever hover outside the center of the element
    //             if (hoverPosition !== "center") {
    //                 setColumnTimerActive(false);
    //             }

    //             // Start the column timer if we're hovering within an element and weren't already hovering
    //             if (
    //                 hoverPosition === "center" &&
    //                 relativeHoverPosition !== "center"
    //             ) {
    //                 setColumnTimerActive(true);
    //             }
    //         }
    //     }
    // }

    // function handleDragEnd(event) {
    //     const { active, collisions } = event;
    //     const closestRow = getClosestRow(collisions);

    //     if (
    //         closestRow
    //         // &&
    //         // isValidPlacement(draggingElement, items, dropTargetIndex)
    //     ) {
    //         if (items.length === 0) {
    //             setItems(addElement(0, active.data.current.type, false));
    //         } else {
    //             let dropIndex = items.map((i) => i.id).indexOf(closestRow.id);
    //             if (dropIndex !== -1) {
    //                 // If hovering below the object, drop target index will be 1 more than current index
    //                 if (relativeHoverPosition === "bottom") {
    //                     dropIndex += 1;
    //                 }

    //                 const item = getElementById(draggingElement.id);
    //                 if (!item) {
    //                     setItems(
    //                         addElement(
    //                             dropIndex,
    //                             active.data.current.type,
    //                             relativeHoverPosition === "center" &&
    //                                 !columnTimerActive
    //                         )
    //                     );
    //                 } else {
    //                     setItems(
    //                         moveElement(
    //                             item,
    //                             dropIndex,
    //                             relativeHoverPosition === "center" &&
    //                                 !columnTimerActive
    //                         )
    //                     );
    //                 }
    //             }
    //         }
    //     }

    //     setDraggingElement(null);
    //     setClosestRow(null);
    //     dragCollisions.current = null;
    //     gridWrapperRef.current.style.height = null;

    //     // We want dropped elements to appear immediately on drag end, so update the debounced values directly
    //     setDebouncedDropTargetIndex(null);
    //     setDebouncedRelativeHoverPosition(null);
    //     setDebouncedPlacementPreviewStyle(defaultPlacementPreviewStyle);
    //     setPlacementPreviewStyle(defaultPlacementPreviewStyle);
    //     setUITimerActive(false);
    // }

    // const getClosestRow = (collisions) => {
    //     if (!collisions || !collisions.length) {
    //         return null;
    //     }

    //     return collisions.filter(
    //         (c) =>
    //             c.data.droppableContainer.data.current &&
    //             c.data.droppableContainer.data.current.type === "row"
    //     )[0];
    // };

    // function addElement(index, elementType, within) {
    //     const newItems = [...items];

    //     if (!within) {
    //         // Add a whole new row
    //         const newOb = {
    //             id: uuid(),
    //             columns: [
    //                 {
    //                     id: uuid(),
    //                     component: elementType,
    //                     props: { ...Components[elementType].props },
    //                 },
    //             ],
    //         };

    //         newItems.splice(index, 0, newOb);
    //     } else {
    //         // Add a column to an existing row
    //         let row = newItems[index];
    //         if (row) {
    //             row.columns.push({
    //                 id: uuid(),
    //                 component: elementType,
    //                 props: { ...Components[elementType].props },
    //             });
    //         }
    //     }
    //     return newItems;
    // }

    // function moveElement(item, rowIndex, within) {
    //     let newItems = [...items];

    //     // Find the row where the item currently lives
    //     newItems.map((row) => {
    //         let column = row.columns.find((col) => col.id === item.id);
    //         if (column) {
    //             row.columns = row.columns.filter((c) => c.id !== column.id);
    //         }
    //     });

    //     if (!within) {
    //         const newOb = {
    //             id: uuid(),
    //             columns: [item],
    //         };
    //         newItems.splice(rowIndex, 0, newOb);
    //     } else {
    //         // Add a column to an existing row
    //         let row = newItems[rowIndex];
    //         if (row) {
    //             row.columns.push(item);
    //         }
    //     }

    //     // Rows without any columns are empty and should be removed
    //     newItems = newItems.filter((row) => row.columns.length > 0);

    //     return newItems;
    // }

    // const getElementById = (id) => {
    //     return items.flatMap((row) => row.columns).find((c) => c.id === id);
    // };

    // // TODO: Because this is an object, React will re-render every time we update it, even if no properties have changed.
    // // So for now, do a poor man's equality check on the object so we don't update it if it hasn't actually changed.
    // const shouldUpdatePlacementPreviewStyle = (previewStyle, newStyle) => {
    //     return (
    //         previewStyle.visibility !== newStyle.visibility ||
    //         previewStyle.width !== newStyle.width ||
    //         previewStyle.height !== newStyle.height ||
    //         previewStyle.top !== newStyle.top ||
    //         previewStyle.left !== newStyle.left ||
    //         previewStyle.transition !== newStyle.transition ||
    //         previewStyle.transform !== newStyle.transform
    //     );
    // };

    // const getPreviewHeight = () => {
    //     // Get the height that the preview should be
    //     let previewHeight = 0;

    //     // Dragging a new item, so the height will be included in its data
    //     if (
    //         draggingElement &&
    //         draggingElement.data.current &&
    //         draggingElement.data.current.height
    //     ) {
    //         // If combining into columns, use the height of the row instead
    //         if (relativeHoverPosition === "center") {
    //             previewHeight =
    //                 closestRow.data.droppableContainer.rect.current.height;
    //             console.log(previewHeight);
    //         } else {
    //             previewHeight = draggingElement.data.current.height;
    //         }
    //     }
    //     // Dragging an existing item
    //     else {
    //         // Get the height by querying the dom for the element we're currently dragging- better way to handle this?
    //         previewHeight = document
    //             .getElementById(draggingElement.id)
    //             .getBoundingClientRect().height;
    //     }

    //     return previewHeight;
    // };

    // const isValidPlacement = (draggingElement, items, dropTargetIndex) => {
    //     let validPlacement = true;
    //     if (draggingElement.data.current.rowId) {
    //         const rowIndex = items.findIndex(
    //             (i) => i.id === draggingElement.data.current.rowId
    //         );
    //         const columnCount = items[rowIndex].columns.length;

    //         // Can't drop an element on itself or directly adjacent to itself
    //         if (
    //             columnCount === 1 &&
    //             (dropTargetIndex === rowIndex ||
    //                 dropTargetIndex === rowIndex + 1) &&
    //             relativeHoverPosition !== "center"
    //         ) {
    //             validPlacement = false;
    //         }

    //         // If item is already in a column, don't show drag preview.
    //         // This will change once we implement column reordering.
    //         if (
    //             relativeHoverPosition === "center" &&
    //             dropTargetIndex === rowIndex
    //         ) {
    //             validPlacement = false;
    //         }
    //     }

    //     return validPlacement;
    // };

    // const updatePlacementPreviewStyle = (oldStyle, newStyle) => {
    //     if (shouldUpdatePlacementPreviewStyle(oldStyle, newStyle)) {
    //         setPlacementPreviewStyle(newStyle);
    //     }
    // };

    const getComponentForPreview = () => {
        // if (draggingElement) {
        //     const item = getElementById(draggingElement.id);
        //     if (item) {
        //         // if dragged ele exists in items array, it's an existing element being dragged
        //         return constructComponent(Components[item.component]);
        //     } else {
        //         // new element being dragged
        //         return constructComponent(
        //             Components[draggingElement.data.current.type]
        //         );
        //     }
        // }

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
                // onDragStart={handleDragStart}
                // onDragEnd={handleDragEnd}
                // onDragMove={handleDragMove}
                // collisionDetection={closestCenter}
                // sensors={sensors}
                // autoScroll={false}
                // modifiers={[snapDragHandleToCursor]}
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
                    {/* <Grid
                        items={items}
                        setItems={setItems}
                        onGridItemClick={handleGridItemClick}
                        dropTargetIndex={debouncedDropTargetIndex}
                        lastDropTargetIndex={lastDropTargetIndex}
                        placementPreviewStyle={debouncedPlacementPreviewStyle}
                        relativeHoverPosition={debouncedRelativeHoverPosition}
                        translateTiming={translateTiming}
                        columnTimerActive={columnTimerActive}
                        gridGap={gridGap}
                        draggingElement={draggingElement}
                        ref={gridWrapperRef}
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
                {/* <DragOverlay dropAnimation={null}>
                    <div className="drag-handle-visible">
                        <div className="dragging drag-overlay">
                            {getComponentForPreview()}
                        </div>
                        <div className="drag-handle">
                            <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
                        </div>
                    </div>
                </DragOverlay>
                <PlacementPreview
                    ref={placementPreviewRef}
                    style={debouncedPlacementPreviewStyle}
                >
                    {getComponentForPreview()}
                </PlacementPreview> */}
            </DndContext>
        </div>
    );
};

export default PageBuilder;