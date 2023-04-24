import React, { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";

const DraggableElement = ({ type, data, children }) => {
  const ref = useRef(null);
  const [dragCollect, drag, dragPreview] = useDrag(() => ({
    type: type,
    item: {
      data: data,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(ref);

  return <div ref={ref}>{children}</div>;
};

export default DraggableElement;
