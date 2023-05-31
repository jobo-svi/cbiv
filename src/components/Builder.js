import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import uuid from "react-uuid";
import BuilderElementsMenu from "./BuilderElementsMenu";
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
import Droppable from "./Droppable";
import SortableGridColumn from "./SortableGridColumn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PageBuilder = () => {
  // The lesson elements
  const [items, setItems] = useState(data.content.body);

  const [activeId, setActiveId] = useState(null);

  const lastOverId = useRef(null);
  const recentlyMovedToNewContainer = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    if (activeId !== null) {
      let col = items
        .flatMap((row) => row.columns)
        .find((col) => col.id === activeId);

      if (col) {
        return constructComponent(Components[col.component]);
      } else if (activeId.includes("-menu-item")) {
        let componentType = activeId.replace("-menu-item", "");
        return constructComponent(Components[componentType]);
      }
    }

    return null;
  };

  const handleDragStart = (e) => {
    const { active } = e;
    let activeData = {};
    if (active.data.current) {
      activeData = active.data.current;
    }

    setActiveId(active.id);
  };

  const findContainer = (id) => {
    return items.find(
      (row) => row.id === id || row.columns.find((col) => col.id === id)
    );
  };

  const handleDragOver = (e) => {
    const { active, over, collisions } = e;
    console.log(over.id, over.data.current.relativePosition);
    if (!active || !over || !over.data.current.relativePosition) {
      return;
    }

    const overRowIndex = over.data.current.rowIndex;
    let modifier = 0;
    if (over.data.current.relativePosition === "above") {
      modifier = -1;
    } else if (over.data.current.relativePosition === "below") {
      modifier = 1;
    }

    let updateItems = [...items];
    if (active.data.current.isNewElement) {
      if (over.id === "new-column-placeholder") {
        return;
      }

      // remove placeholders, and then "commit" in ondragend by searching and replacing the id
      updateItems.map((row) => {
        row.columns = row.columns.filter(
          (col) => col.id !== "new-column-placeholder"
        );
      });
      updateItems = updateItems.filter((row) => row.columns.length > 0);

      if (over.data.current.relativePosition !== "within") {
        console.log(1);
        // insert new row
        const newOb = {
          id: "new-row-placeholder",
          columns: [
            {
              id: "new-column-placeholder",
              component: active.data.current.component,
              props: {
                ...Components[active.data.current.component].props,
              },
            },
          ],
        };

        const index = overRowIndex + modifier < 0 ? 0 : overRowIndex + modifier;
        updateItems.splice(index, 0, newOb);
        setItems(updateItems);
      } else {
        console.log(2);
        // insert new column
        const index =
          overRowIndex + modifier > updateItems.length - 1
            ? updateItems.length - 1
            : overRowIndex + modifier;
        updateItems[index].columns.push({
          id: "new-column-placeholder",
          component: active.data.current.component,
          props: {
            ...Components[active.data.current.component].props,
          },
        });
        setItems(updateItems);
      }
    } else {
      const fromCol = updateItems
        .flatMap((row) => row.columns)
        .find((col) => col.id === active.id);
      const fromRowIndex = updateItems.findIndex((row) =>
        row.columns.find((col) => col.id === active.id)
      );
      const fromColIndex = updateItems[fromRowIndex].columns.findIndex(
        (col) => col.id === active.id
      );

      const destinationCol = updateItems
        .flatMap((row) => row.columns)
        .find((col) => col.id === over.id);

      const destinationIsNewRow = destinationCol === undefined;

      if (!destinationIsNewRow) {
        // adding a column to existing row
        const destinationRow = updateItems.find((row) =>
          row.columns.find((col) => col.id === destinationCol.id)
        );

        const destinationRowIndex = updateItems.findIndex((row) =>
          row.columns.find((col) => col.id === over.id)
        );
        const destinationColIndex = updateItems[
          destinationRowIndex
        ].columns.findIndex((col) => col.id === over.id);

        // Remove original location
        updateItems[fromRowIndex].columns = updateItems[
          fromRowIndex
        ].columns.filter((col) => col.id !== fromCol.id);

        // Figure out which side of column we're hovering on...
        const isRightOfOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.right >
            over.rect.right - over.rect.width / 2;

        destinationRow.columns.splice(destinationColIndex, 0, fromCol);

        // We don't want the layout to jump while moving rows into columns, so don't remove empty rows yet...
        setItems(updateItems);
      } else {
        const destinationRowIndex = over.data.current.rowIndex;
        updateItems.map((row) => {
          row.columns = row.columns.filter((col) => col.id !== active.id);
        });

        const index =
          destinationRowIndex + modifier < 0
            ? 0
            : destinationRowIndex + modifier;
        updateItems.splice(index, 0, {
          id: uuid(),
          columns: [fromCol],
        });

        updateItems = updateItems.filter((row) => row.columns.length > 0);

        recentlyMovedToNewContainer.current = true;
        setItems(updateItems);
      }
    }
  };

  function getElementIndex(elementId, items) {
    let rowIndex = items.findIndex((row) =>
      row.columns.find((col) => col.id === elementId)
    );
    let colIndex = -1;
    if (rowIndex !== -1) {
      items.map((row) => {
        const col = row.columns.findIndex((col) => col.id === elementId);
        if (col !== -1) {
          colIndex = col;
        }
      });
    }

    if (rowIndex !== -1 && colIndex !== -1) {
      return [rowIndex, colIndex];
    }

    return [null, null];
  }

  const handleDragEnd = (e) => {
    const { over, active, collisions } = e;

    let updateItems = [...items];

    // Replace any placeholder elements with real ids
    updateItems.map((row) => {
      if (row.id === "new-row-placeholder") {
        row.id = uuid();
      }

      row.columns.map((col) => {
        if (col.id === "new-column-placeholder") {
          col.id = uuid();
        }
      });
    });

    updateItems = updateItems.filter((row) => row.columns.length > 0);
    setItems(updateItems);
    setActiveId(null);
  };

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  };

  const collisionDetectionStrategy = useCallback(
    (args) => {
      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      const filteredIntersections = intersections.filter(
        (i) => !i.data.droppableContainer.data.current.isParentContainer
      );
      let overId = getFirstCollision(filteredIntersections, "id");

      if (overId != null) {
        if (overId in items) {
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            const closestDroppables = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id)
              ),
            });
            overId =
              closestDroppables.length > 0 ? closestDroppables[0].id : null;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );

  return (
    <div
      className="builder"
      style={{ cursor: draggingElement ? "grabbing" : "" }}
    >
      <BuilderNavbar />
      <div className="lessons">lessons</div>
      <DndContext
        sensors={sensors}
        modifiers={[snapDragHandleToCursor]}
        collisionDetection={collisionDetectionStrategy}
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
          <div className="grid-wrapper">
            <div className="grid">
              <Droppable
                id={`row-placeholder-start`}
                rowIndex={0}
                relativePosition="above"
                isPlaceholder={true}
                activeId={activeId}
              >
                <div
                  style={{
                    height: "24px",
                    width: "100%",
                  }}
                ></div>
              </Droppable>
              {items.map((row, rowIndex) => (
                <div key={row.id}>
                  <Droppable
                    id={row.id}
                    isPlaceholder={false}
                    activeId={activeId}
                    isParentContainer={true}
                  >
                    <SortableContext
                      items={row.columns.map((col) => col.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {items[rowIndex].columns.map((column, colIndex) => {
                        return (
                          <SortableGridColumn
                            id={column.id}
                            key={column.id}
                            index={colIndex}
                            rowIndex={rowIndex}
                            column={column}
                            relativePosition="within"
                          />
                        );
                      })}
                    </SortableContext>
                  </Droppable>
                  <Droppable
                    id={`row-placeholder-${rowIndex}`}
                    rowIndex={rowIndex}
                    relativePosition="below"
                    isPlaceholder={true}
                    activeId={activeId}
                  >
                    <div
                      style={{
                        height: "24px",
                        width: "100%",
                      }}
                    ></div>
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sidebar" style={{ overflow: "auto" }}>
          <BuilderElementsMenu />
        </div>
        <DragOverlay dropAnimation={null}>
          <div className="drag-handle-visible">
            <div className="dragging drag-overlay">
              {getComponentForPreview()}
            </div>
            <div className="drag-handle">
              <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
            </div>
          </div>
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default PageBuilder;
