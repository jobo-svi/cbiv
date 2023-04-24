import React, { useState } from "react";
import DroppableElement from "./DroppableElement";
import { Components, constructComponent } from "./ComponentFactory";
import uuid from "react-uuid";

const CustomGrid = React.forwardRef(
  ({ items, setItems, onGridItemClick }, ref) => {
    const handleDrop = (insertType, dropTargetId, position) => {
      let dropTargetIndex = items.map((i) => i._uid).indexOf(dropTargetId);
      if (dropTargetIndex !== -1) {
        if (position === "bottom") {
          dropTargetIndex += 1;
        }

        const newItems = [...items];
        newItems.splice(dropTargetIndex, 0, {
          _uid: uuid(),
          component: insertType,
          props: { ...Components[insertType].defaults.props },
        });
        setItems(newItems);
      }
    };

    return (
      <div className="grid-wrapper" ref={ref}>
        <div className="grid">
          {items.map((item) => {
            return (
              <DroppableElement
                key={item._uid}
                _uid={item._uid}
                onDrop={handleDrop}
              >
                <div
                  onClick={() => onGridItemClick(item)}
                  className="grid-item"
                >
                  {constructComponent(item)}
                </div>
              </DroppableElement>
            );
          })}
        </div>
      </div>
    );
  }
);

export default CustomGrid;
