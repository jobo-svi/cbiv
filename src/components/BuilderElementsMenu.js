import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/App.css";
import BuilderElementsMenuItem from "./BuilderElementsMenuItem";
import { Components } from "./ComponentFactory";

const BuilderElementsMenu = (props) => {
    return (
        <div className="builder-elements-menu">
            <div className="element-wrapper">
                <BuilderElementsMenuItem
                    id="header-menu-item"
                    data={{
                        type: "header",
                        height: Components.header.defaultHeight,
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
                        height: Components.paragraph.defaultHeight,
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
                        height: Components.image.defaultHeight,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-image" />
                        IMAGE
                    </button>
                </BuilderElementsMenuItem>
            </div>
            <div className="element-wrapper">
                <BuilderElementsMenuItem
                    id="flipcard-menu-item"
                    data={{
                        type: "flipcard",
                        height: Components.flipcard.defaultHeight,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-image" />
                        FLIP CARD
                    </button>
                </BuilderElementsMenuItem>
            </div>
        </div>
    );
};

export default BuilderElementsMenu;
