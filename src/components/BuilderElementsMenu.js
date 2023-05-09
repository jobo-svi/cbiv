import React from "react";
import Draggable from "./Draggable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/App.css";
import BuilderElementsMenuItem from "./BuilderElementsMenuItem";

const BuilderElementsMenu = (props) => {
    return (
        <div className="builder-elements-menu">
            <div className="element-wrapper">
                <BuilderElementsMenuItem
                    id="header-menu-item"
                    data={{
                        type: "header",
                        height: 48,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-heading" /> HEADER
                    </button>
                </BuilderElementsMenuItem>
            </div>
            <div className="element-wrapper">
                <BuilderElementsMenuItem
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
                </BuilderElementsMenuItem>
            </div>
            <div className="element-wrapper">
                <BuilderElementsMenuItem
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
                </BuilderElementsMenuItem>
            </div>
        </div>
    );
};

export default BuilderElementsMenu;
