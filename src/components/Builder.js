import "../css/App.css";
import React, { useEffect, useState } from "react";
import { DndContext, closestCenter, pointerWithin, rectIntersection } from "@dnd-kit/core";
import Grid from "./Grid";
import { data } from "../data";
import BuilderElementsMenu from "./BuilderElementsMenu";
import ItemEditor from "./ItemEditor";
import BuilderNavbar from "./BuilderNavbar";
import uuid from "react-uuid";
import { Components, constructComponent } from "./ComponentFactory";
import useMousePosition from "../hooks/useMousePosition";
import {min} from 'lodash';
import {Coordinates, CollisionDetection, LayoutRect} from '@dnd-kit/core';



/**
 * Returns the distance between two points
 */
function distanceBetween(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }
  
  /**
   * Returns the coordinates of the center of a given ClientRect
   */
  function centerOfRectangle(
    rect,
    left = rect.left,
    top = rect.top
  ) {
    return {
      x: left + rect.width * 0.5,
      y: top + rect.height * 0.5,
    };
  }
  
  const MAX_DISTANCE = 500;
  
  const customClosestCenter = (args) => {
    let rect = args.collisionRect;
    let rects = Array.from(args.droppableRects)

    const centerRect = centerOfRectangle(rect, rect.left, rect.top);
    const distances = rects.reduce((acc, [_, rect]) => {
      const distance = distanceBetween(centerOfRectangle(rect), centerRect);
      console.log(distance)
      // Do not match droppable if distance is greater than MAX_DISTANCE
      return distance > MAX_DISTANCE ? acc : [...acc, distance];
    }, []);
  
    const minValue = min(distances);
    const minValueIndex = distances.indexOf(minValue);

    return rects[minValueIndex] ? rects[minValueIndex][0] : null;
  };

const PageBuilder = () => {
    const mousePosition = useMousePosition();

    const [items, setItems] = useState(data.content.body);

    const [itemToEdit, setItemToEdit] = useState(null);

    const handleGridItemClick = (item) => {
        console.log(item);
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

    function handleDragStart() {
        //setIsDragging(true);
    }

    function handleDragEnd(event) {
        const { active, over } = event;
        if (over) {
            //console.log(event);

            if (items.length === 0) {
                setItems(addElement(0, active.data.current.type));
            } else {
                let dropTargetIndex = items.map((i) => i._uid).indexOf(over.id);
                if (dropTargetIndex !== -1) {
                    // if (position === "bottom") {
                    //     dropTargetIndex += 1;
                    // }
                    setItems(
                        addElement(
                            dropTargetIndex + 1,
                            active.data.current.type
                        )
                    );
                }
            }
        }
    }

    function handleDragOver(event) {
        //console.log(event);
        const { active, over } = event;
        if (!over) {
            return;
        }
        //console.log(over.id);

        // Determine rectangle on screen
        const hoverBoundingRect = over.rect;
        console.log(hoverBoundingRect.bottom);
        console.log(hoverBoundingRect.left);
        console.log(hoverBoundingRect.right);
        console.log(hoverBoundingRect.top);

        // // Get vertical middle
        // const hoverMiddleY =
        //     (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        //const clientOffset = monitor.getClientOffset();

        // // Get pixels to the top
        // const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // // Hovering top or bottom
        // if (hoverClientY < hoverMiddleY) {
        //   setHoverSide("top");
        // } else {
        //   setHoverSide("bottom");
        // }
    }

    function handleDragMove(event) {
        const { active, over } = event;
        //console.log(event);
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
            onDragOver={handleDragOver}
            onDragMove={handleDragMove}
            collisionDetection={customClosestCenter}
        >
            <div className="builder">
                <BuilderNavbar />
                <div className="lessons">lessons</div>
                <div className="lesson-content">
                    <Grid
                        items={items}
                        setItems={setItems}
                        onGridItemClick={handleGridItemClick}
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
                <p style={{ position: "absolute", bottom: "0%", padding: "5px"}}>
                    Your cursor position:
                    <br />
                    {JSON.stringify(mousePosition)}
                </p>
            </div>
        </DndContext>
    );
};

export default PageBuilder;
