import { useDroppable } from "@dnd-kit/core";

const Droppable = (props) => {
    const { setNodeRef, node, active, over, transition, transform } =
        useDroppable({
            id: props.id,
            data: {
                id: props.id,
                rowIndex: props.rowIndex,
                type: props.type,
            },
        });

    // Manually set the height of the grid row while we're dragging stuff over it, so that if we remove all columns the layout won't shift until we're done dragging
    let height = null;
    if (node.current && active && over && !props.isPlaceholder) {
        if (props.items[props.rowIndex].columns.length === 0) {
            height = node.current.clientHeight;
        }
    }

    return (
        <div
            id={props.id}
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
