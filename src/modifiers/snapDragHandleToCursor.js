import { getEventCoordinates } from "@dnd-kit/utilities";

// Custom drag handle modifier that "snaps" the drag handle to your cursor.
// Based on the "snapCenterToCursor" modifier from dnd-kit.
export const snapDragHandleToCursor = ({
    activatorEvent,
    draggingNodeRect,
    transform,
}) => {
    if (draggingNodeRect && activatorEvent) {
        const activatorCoordinates = getEventCoordinates(activatorEvent);

        if (!activatorCoordinates) {
            return transform;
        }

        const offsetX = activatorCoordinates.x - draggingNodeRect.left;
        const offsetY = activatorCoordinates.y - draggingNodeRect.top;

        return {
            ...transform,
            x: transform.x + offsetX - draggingNodeRect.width,
            y: transform.y + offsetY - draggingNodeRect.height / 2,
        };
    }

    return transform;
};
