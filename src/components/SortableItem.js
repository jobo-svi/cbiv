import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
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

  return (
    <div
      ref={setNodeRef}
      id={props.id}
      style={style}
      {...attributes}
      {...listeners}
    >
      {props.children}
    </div>
  );
};

export default SortableItem;
