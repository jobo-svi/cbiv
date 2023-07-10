import { useDraggable } from "@dnd-kit/core";

const BuilderElementsMenuItem = (props) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.id,
        data: props.data,
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ touchAction: "none" }}
        >
            {props.children}
        </div>
    );
};

export default BuilderElementsMenuItem;
