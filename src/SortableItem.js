import React from "react";
import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// function animateLayoutChanges(args) {
//     const {isSorting, wasDragging} = args;
  
//     if (isSorting || wasDragging) {
//       return defaultAnimateLayoutChanges(args);
//     }
  
//     return true;
//   }

const SortableItem = (props) => {
    const Element = props.element || "div";
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ /*animateLayoutChanges,*/ id: props.id, data: props.data });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
      };

    return (
        <Element ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </Element>
    );
};

export default SortableItem;
