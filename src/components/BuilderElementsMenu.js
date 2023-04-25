import React from "react";
import Draggable from "./Draggable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentsList } from "./ComponentFactory";
import uuid from "react-uuid";
import { useDraggable, DragOverEvent, DragOverlay } from "@dnd-kit/core";
import "../css/App.css";

const BuilderElementsMenu = (props) => {
    return (
        <div className="builder-elements-menu">
            <div className="element-wrapper">
                <Draggable
                    id="header-menu-item"
                    data={{
                        type: "header",
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-heading" /> HEADER
                    </button>
                </Draggable>
            </div>
            {/* <div className="element-wrapper">
                <DraggableElement
                    type="image-menu-item"
                    data={{
                        type: "image",
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="image" /> IMAGE
                    </button>
                </DraggableElement>
            </div> */}
            <DragOverlay dropAnimation={null}>
                <button className="element">
                    <FontAwesomeIcon icon="fa-solid fa-heading" /> HEADER
                </button>
            </DragOverlay>
        </div>
    );
};

export default BuilderElementsMenu;
