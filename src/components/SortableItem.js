import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SortableItem = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
    data: {
      id: props.id,
      rowIndex: props.rowIndex,
      relativePosition: props.relativePosition,
    },
  });

  const [showDragHandle, setShowDragHandle] = useState(false);

  // We don't want anything to scale
  if (transform) {
    transform.scaleX = 1;
    transform.scaleY = 1;
  }
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? ".5" : 1,
  };

  const classes = [];
  if (showDragHandle) {
    classes.push("drag-handle-visible");
  }

  return (
    <div
      ref={setNodeRef}
      id={props.id}
      style={style}
      className={classes.join(" ")}
      {...attributes}
      {...listeners}
    >
      {props.children}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className="drag-handle"
        style={{
          display: showDragHandle ? "" : "none",
        }}
      >
        <FontAwesomeIcon icon="fa-solid fa-up-down-left-right" />
      </div>
    </div>
  );
};

export default SortableItem;
