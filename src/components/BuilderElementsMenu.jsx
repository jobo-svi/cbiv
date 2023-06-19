import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/App.css";
import BuilderElementsMenuItem from "./BuilderElementsMenuItem";
import { Components } from "./ComponentFactory";

const BuilderElementsMenu = () => {
    return (
        <div className="builder-elements-menu">
            <div className="element-wrapper">
                <BuilderElementsMenuItem
                    id="header-menu-item"
                    data={{
                        component: "header",
                        height: Components.header.defaultHeight,
                        isNewElement: true,
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
                        component: "paragraph",
                        height: Components.paragraph.defaultHeight,
                        isNewElement: true,
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
                        component: "image",
                        height: Components.image.defaultHeight,
                        isNewElement: true,
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
                        component: "flipcard",
                        height: Components.flipcard.defaultHeight,
                        isNewElement: true,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-image" />
                        FLIP CARD
                    </button>
                </BuilderElementsMenuItem>
            </div>
            <div className="element-wrapper">
                <BuilderElementsMenuItem
                    id="headerAndParagraph-menu-item"
                    data={{
                        component: "headerAndParagraph",
                        height: Components.paragraph.defaultHeight,
                        isNewElement: true,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-heading" /> HEADER
                        AND PARAGRAPH
                    </button>
                </BuilderElementsMenuItem>
            </div>
        </div>
    );
};

export default BuilderElementsMenu;
