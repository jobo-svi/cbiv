import React from "react";
import { useDndContext } from "@dnd-kit/core";
import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function animateLayoutChanges(args) {
    const { isSorting, wasDragging } = args;

    if (isSorting || wasDragging) {
        return defaultAnimateLayoutChanges(args);
    }

    return true;
}

const SortableItem = (props) => {
    const Element = props.element || "div";
    const {
        active,
        items,
        newIndex,
        overIndex,
        isSorting,
        isDragging,
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        animateLayoutChanges,
        id: props.id,
        data: props.data,
    });

    const { collisions } = useDndContext();

    const getShouldCombine = (id, items, newIndex, collisions, active) => {
        if (!active || !items) {
            return false;
        }
        const newId = items[newIndex];

        if (active.id.includes("menu-item")) {
            if (!collisions || collisions.length < 1) {
                return false;
            }

            const {
                id: secondCollidingId,
                data: collisionData,
            } = collisions[0];

            if (!collisionData) {
                return false;
            }
            const collisionRatio = collisionData.value;
            console.log(collisionRatio);
            // NOTE: This can be improved with a custom dnd-kit collision detection
            return (
                secondCollidingId === newId &&
                collisionRatio != null &&
                id !== (active ? active.id : undefined) &&
                collisionRatio > 0.1 &&
                collisionRatio < 0.4
            );
        } else {
            if (!collisions || collisions.length < 2) {
                return false;
            }

            const {
                id: secondCollidingId,
                data: collisionData,
            } = collisions[1];

            if (!collisionData) {
                return false;
            }
            const collisionRatio = collisionData.value;

            // NOTE: This can be improved with a custom dnd-kit collision detection
            return (
                secondCollidingId === newId &&
                collisionRatio != null &&
                id !== (active ? active.id : undefined) &&
                collisionRatio > 0.01 &&
                collisionRatio < 0.4
            );
        }
    };

    const shouldCombine = getShouldCombine(
        props.id,
        items,
        newIndex,
        collisions,
        active
    );

    let isHovered = false;

    if (collisions) {
        let found = collisions.find((collision) => collision.id === props.id);
        if (found && found.data) {
            isHovered = found.data.hovered || false;
        }
    }

    let isOver = false;
    if (active && active.id.includes("menu-item")) {
        isOver = props.id === items[overIndex];
    }

    let newTransform = { ...transform };
    if (active && active.id.includes("menu-item")) {
        if (newIndex >= props.dropTargetIndex) {
            newTransform = { ...newTransform, y: 64 };
        }
    }

    // const style = {
    //     transition,
    //     transform: CSS.Translate.toString(newTransform),
    //     //background: isOver ? "gray" : "",
    //     opacity: shouldCombine ? ".5" : "1",
    // };

    const style = {
        //transform: CSS.Transform.toString(transform),
        transform: CSS.Translate.toString(newTransform),
        zIndex: (active ? active.id : null) === props.id ? 999 : 0,
        border: isHovered ? "1px solid red" : "",
        transition,
    };

    return (
        <Element ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </Element>
    );
};

export default SortableItem;
