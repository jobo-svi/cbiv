import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableRow = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: props.id });

    // console.log(transform, transition);
    // We don't want anything to scale
    if (transform) {
        transform.scaleX = 1;
        transform.scaleY = 1;
    }
    const style = {
        transform: transform ? CSS.Transform.toString(transform) : "",
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </div>
    );
};

export default SortableRow;
