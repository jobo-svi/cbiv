import React from "react";
import Draggable from "./Draggable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/App.css";

const BuilderElementsMenu = (props) => {
    return (
        <div className="builder-elements-menu">
            <div className="element-wrapper">
                <Draggable
                    id="header-menu-item"
                    data={{
                        type: "header",
                        height: 48,
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
                        height: 96,
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
                        height: 826,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-image" />
                        IMAGE
                    </button>
                </Draggable>
            </div>
        </div>
    );
};

export default BuilderElementsMenu;
