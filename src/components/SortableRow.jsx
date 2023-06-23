import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableRow = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        node,
        active,
        over,
    } = useSortable({
        id: props.id,
        disabled: true,
        transition: {
            duration: 300, // milliseconds
            easing: "ease",
        },
        data: { type: props.type, rowIndex: props.rowIndex },
    });

    //console.log(transform, transition);
    // We don't want anything to scale
    if (transform) {
        transform.scaleX = 1;
        transform.scaleY = 1;
    }
    const style = {
        transform: transform ? CSS.Transform.toString(transform) : "",
        transition,
    };

    // Manually set the height of the grid row while we're dragging stuff over it, so that if we remove all columns the layout won't shift until we're done dragging
    let height = null;
    if (node.current && active && over && !props.isPlaceholder) {
        if (props.items[props.rowIndex].columns.length === 0) {
            height = node.current.clientHeight;
        }
    }

    const gridTemplateColumns = props.items[props.rowIndex].columns
        .map((col) => {
            console.log(col);
            if (col.gridWidth) {
                return col.gridWidth;
            }
            return "1fr";
        })
        .join(" ");

    return (
        <div
            ref={setNodeRef}
            className="grid-row"
            id={props.id}
            style={{
                gridTemplateColumns: gridTemplateColumns,
                height: height !== null ? `${height}px` : "",
                ...style,
            }}
            {...attributes}
            {...listeners}
            data-row-index={props.rowIndex}
        >
            {props.children}
        </div>
    );
};

export default SortableRow;
