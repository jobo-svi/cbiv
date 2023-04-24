import React, { useRef, useState } from "react";
import { useDrop } from "react-dnd";

const DroppableElement = ({ _uid, type, children, onDrop }) => {
  const ref = useRef(null);

  const [hoverSide, setHoverSide] = useState(null);

  const [dropCollect, drop] = useDrop(
    () => ({
      accept: ["image-menu-item", "header-menu-item"],
      drop: (item, monitor) => {
        onDrop(item.data.type, _uid, hoverSide);
      },
      hover: (item, monitor) => {
        if (!ref.current) {
          return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Hovering top or bottom
        if (hoverClientY < hoverMiddleY) {
          setHoverSide("top");
        } else {
          setHoverSide("bottom");
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [hoverSide]
  );

  function renderPlacementPreview() {
    let style = {
      display: "none",
      position: "absolute",
      left: 0,
      right: 0,
      height: "4px",
      background: "red",
    };

    if (dropCollect.isOver && hoverSide) {
      style = {
        ...style,
        display: "block",
        [hoverSide]: "-7px",
      };
    }
    return <div style={style}></div>;
  }

  drop(ref);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
      }}
    >
      {children}
      {renderPlacementPreview()}
    </div>
  );
};

export default DroppableElement;