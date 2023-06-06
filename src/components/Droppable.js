import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import { Transition } from "react-transition-group";

const duration = 450;

const defaultStyle = {
    transition: `opacity ${duration}ms`,
    opacity: 0,
};

const transitionStyles = {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
    exiting: { opacity: 1 },
    exited: { opacity: 0 },
};

const Droppable = (props) => {
    const { setNodeRef, node, active, over } = useDroppable({
        id: props.id,
        data: {
            id: props.id,
            rowIndex: props.rowIndex,
            relativePosition: props.relativePosition,
            isParentContainer: props.isParentContainer,
            isPlaceholder: props.isPlaceholder,
        },
    });

    // Manually set the height of the grid row while we're dragging stuff over it, so that if we remove all columns the layout won't shift until we're done dragging
    let height = null;
    if (node.current && active && over && !props.isPlaceholder) {
        if (props.items[props.rowIndex].columns.length === 0) {
            height = node.current.clientHeight;
        }
    }

    const [inProp, setInProp] = useState(false);
    useEffect(() => {
        setInProp(true);
    }, []);

    return (
        <Transition nodeRef={node} timeout={1} in={inProp}>
            {(state) => (
                <div
                    className="grid-row"
                    ref={setNodeRef}
                    style={{
                        height: height !== null ? `${height}px` : "",
                        ...defaultStyle,
                        ...transitionStyles[state],
                    }}
                >
                    {props.children}
                </div>
            )}
        </Transition>
    );
};

export default Droppable;
