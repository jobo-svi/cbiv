import React from 'react';
import {useDroppable} from '@dnd-kit/core';

const Droppable = (props) => {
    const { setNodeRef } = useDroppable({
        id: props.id
    });

    return <div ref={setNodeRef}>{props.children}</div>;
};

export default Droppable;