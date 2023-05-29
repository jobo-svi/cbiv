import React from "react";
import { useSortable } from "@dnd-kit/sortable";

const Droppable = (props) => {
  const {
    activeIndex,
    attributes,
    listeners,
    setNodeRef,
    node,
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

  let height = null;
  if (node.current && !props.isPlaceholder && props.activeId) {
    height = node.current.clientHeight;
  }

  return (
    <div
      className="grid-row"
      ref={setNodeRef}
      style={{
        height: height !== null ? `${height}px` : "",
      }}
    >
      {props.children}
    </div>
  );
};

export default Droppable;
