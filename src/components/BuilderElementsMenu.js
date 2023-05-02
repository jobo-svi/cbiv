import React from "react";
import Draggable from "./Draggable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentsList } from "./ComponentFactory";
import uuid from "react-uuid";
import { useDraggable, DragOverEvent, DragOverlay } from "@dnd-kit/core";
import "../css/App.css";
import SortableItem from "./SortableItem";

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
            <div className="element-wrapper">
                <Draggable
                    id="paragraph-menu-item"
                    data={{
                        type: "paragraph",
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-paragraph" />
                        PARAGRAPH
                    </button>
                </Draggable>
            </div>
            <div className="element-wrapper">
                <Draggable
                    id="image-menu-item"
                    data={{
                        type: "image",
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-image" />
                        IMAGE
                    </button>
                </Draggable>
            </div>
            {/* <div className="element-wrapper">
                <Draggable
                    type="image-menu-item"
                    data={{
                        type: "image",
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="image" /> IMAGE
                    </button>
                </Draggable>
            </div> */}
        </div>
    );
};

export default BuilderElementsMenu;
