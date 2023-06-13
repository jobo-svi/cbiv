import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSpring, animated } from "@react-spring/web";
import { useSortable } from "@dnd-kit/sortable";

const Droppable = (props) => {
    const { setNodeRef, node, active, over, transition, transform } =
        useSortable({
            id: props.id,
            data: {
                id: props.id,
                rowIndex: props.rowIndex,
                relativePosition: props.relativePosition,
                isParentContainer: props.isParentContainer,
                isPlaceholder: props.isPlaceholder,
            },
        });

    console.log(transition, transform);

    const [theProps, api] = useSpring(
        () => ({
            from: { opacity: 0 },
            to: { opacity: 1 },
            config: {
                duration: 250,
            },
        }),
        []
    );

    // Manually set the height of the grid row while we're dragging stuff over it, so that if we remove all columns the layout won't shift until we're done dragging
    let height = null;
    if (node.current && active && over && !props.isPlaceholder) {
        if (props.items[props.rowIndex].columns.length === 0) {
            height = node.current.clientHeight;
        }
    }

    return (
        <animated.div style={theProps}>
            <div
                className="grid-row"
                ref={setNodeRef}
                style={{
                    height: height !== null ? `${height}px` : "",
                }}
            >
                {props.children}
            </div>
        </animated.div>
    );
};

export default Droppable;
