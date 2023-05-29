import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  horizontalListSortingStrategy,
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
import Droppable from "./Droppable";

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

    const spaceSize = 24;
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
        // distBetween = Math.abs(
        //     parseFloat(centerOfRectangle(rect).y) -
        //         parseFloat(
        //             isEnabled ? centerRect.y : centerCurrectRect.y
        //         )
        // );

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
  // const itemIds = useMemo(
  //     () => items.flatMap((item) => item.columns).map((item) => item.id),
  //     [items]
  // );

  const [activeId, setActiveId] = useState(null);
  const [clonedItems, setClonedItems] = useState([]);

  const lastOverId = useRef(null);
  const recentlyMovedToNewContainer = useRef(false);

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

  function createSpacerRow({ id }) {
    return {
      id: uuid(),
      columns: [
        {
          id,
          component: "spacer",
          title: "spacer",
        },
      ],
    };
  }

  function createSpacerCol({ id }) {
    const height = document.getElementById(id).getBoundingClientRect().height;
    return {
      id,
      component: "spacer",
      title: "spacer",
      props: {
        height: height,
      },
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
      return constructComponent(Components[activeSidebarField.component]);
    } else if (activeField) {
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

    setActiveId(active.id);
    setClonedItems(items);
  };

  const replaceColumnWithSpacer = (rowIndex, colIndex, spacerColumn) => {
    let updateItems = [...items];
    updateItems[rowIndex].columns.splice(colIndex, 1, spacerColumn);
    return updateItems;
  };

  const findContainer = (id) => {
    return items.find(
      (row) => row.id === id || row.columns.find((col) => col.id === id)
    );
  };

  const handleDragOver = (e) => {
    const { active, over, collisions } = e;

    if (!active || !over) {
      return;
    }

    const overId = over ? over.id : null;
    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    const overRowIndex = over.data.current.rowIndex;
    let modifier = 0;
    if (over.data.current.relativePosition === "above") {
      modifier = -1;
    } else if (over.data.current.relativePosition === "below") {
      modifier = 1;
    }

    let updateItems = [...items];
    if (active.data.current.isNewElement) {
      if (
        over.id === "new-column-placeholder" &&
        active.data.current.isNewElement
      ) {
        return;
      }
      // remove placeholders, and then "commit" in ondragend by searching and replacing the id
      updateItems.map((row) => {
        row.columns = row.columns.filter(
          (col) => col.id !== "new-column-placeholder"
        );
      });
      updateItems = updateItems.filter((row) => row.columns.length > 0);

      //   updateItems = updateItems.filter(
      //     (row) => row.id !== "new-row-placeholder"
      //   );
      if (over.data.current.relativePosition !== "within") {
        // insert new row
        const newOb = {
          id: "new-row-placeholder",
          columns: [
            {
              id: "new-column-placeholder",
              component: active.data.current.component,
              props: { ...Components[active.data.current.component].props },
            },
          ],
        };

        const index = overRowIndex + modifier < 0 ? 0 : overRowIndex + modifier;
        updateItems.splice(index, 0, newOb);
        setItems(updateItems);
      } else {
        // insert new column
        const index =
          overRowIndex + modifier > updateItems.length - 1
            ? updateItems.length - 1
            : overRowIndex + modifier;
        updateItems[index].columns.push({
          id: "new-column-placeholder",
          component: active.data.current.component,
          props: { ...Components[active.data.current.component].props },
        });
        setItems(updateItems);
      }
    } else {
      const eleToMove = updateItems
        .flatMap((row) => row.columns)
        .find((col) => col.id === active.id);
      if (over.data.current.relativePosition !== "within") {
        // remove ele from its original location
        updateItems.map((row) => {
          row.columns = row.columns.filter((col) => col.id !== active.id);
        });

        updateItems.splice(overRowIndex + modifier, 0, {
          id: uuid(),
          columns: [eleToMove],
        });
        updateItems = updateItems.filter((row) => row.columns.length > 0);
        setItems(updateItems);
        recentlyMovedToNewContainer.current = true;
      } else {
        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          // remove ele from its original location
          updateItems.map((row) => {
            row.columns = row.columns.filter((col) => col.id !== active.id);
          });

          updateItems[overRowIndex].columns.push(eleToMove);

          setItems(updateItems);
          recentlyMovedToNewContainer.current = true;
        }
      }
    }
  };

  const handleDragMove = (e) => {
    const { over, collisions } = e;
  };

  const handleDragEnd = (e) => {
    const { over, active, collisions } = e;

    let updateItems = [...items];
    updateItems = updateItems.filter((row) => row.columns.length > 0);
    setItems(updateItems);
    setActiveId(null);
  };

  function moveElement(currentItems, item, rowIndex, eleToCombine) {
    let newItems = [...currentItems];

    // Find the row where the item currently lives
    newItems.map((row, rowIndex) => {
      let column = row.columns.find((col) => col.id === item.id);
      if (column) {
        row.columns = row.columns.filter((c) => c.id !== column.id);
      }
    });

    if (!eleToCombine) {
      // Rows without any columns are empty and should be removed
      newItems = newItems.filter(
        (row) => row.columns && row.columns.length > 0
      );

      const newOb = {
        id: uuid(),
        columns: [item],
      };
      newItems.splice(rowIndex, 0, newOb);
    } else {
      // Add a column to an existing row
      let combineRowIndex = items.findIndex((item) =>
        item.columns.find((col) => col.id === eleToCombine.id)
      );
      let row = newItems[combineRowIndex];
      if (row) {
        row.columns.push(item);
      }

      // Rows without any columns are empty and should be removed
      newItems = newItems.filter(
        (row) => row.columns && row.columns.length > 0
      );
    }

    return newItems;
  }

  const replaceSpacerWithRealElement = (element) => {
    let updateItems = [...items];
    const spacerRowIndex = updateItems.findIndex((f) =>
      f.columns.find((col) => col.component === "spacer")
    );

    // remove the spacer and replace with the actual element
    updateItems.forEach(function(row, rowIndex) {
      if (rowIndex === spacerRowIndex) {
        let spacerColIndex = row.columns.findIndex(
          (col) => col.component === "spacer"
        );

        row.columns.splice(spacerColIndex, 1, element);
      }
    });

    return updateItems;
  };

  const { listeners, setNodeRef, transform, transition } = useDroppable({
    id: "canvas_droppable",
    data: {
      parent: null,
      isContainer: true,
    },
  });

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

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
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div className="lesson-content">
          <div className="grid-wrapper">
            <div className="grid" style={{ position: "relative" }}>
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
                  >
                    <SortableContext
                      items={row.columns.map((col) => col.id)}
                      strategy={rectSortingStrategy}
                    >
                      {items[rowIndex].columns.map((column, colIndex) => {
                        return (
                          <div className="grid-column" key={column.id}>
                            <SortableItem
                              id={column.id}
                              index={colIndex}
                              rowIndex={rowIndex}
                              relativePosition="within"
                            >
                              {constructComponent(column)}
                            </SortableItem>
                          </div>
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
          <div
            style={{
              background: "gray",
              color: "white",
              opacity: ".5",
              height: "48px",
            }}
          >
            drag placeholder
          </div>
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default PageBuilder;
