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
                    id="blockquote-menu-item"
                    data={{
                        component: "blockquote",
                        height: Components.blockquote.defaultHeight,
                        isNewElement: true,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-quote-left" />
                        QUOTE
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
            <div className="element-wrapper">
                <BuilderElementsMenuItem
                    id="imageAndParagraph-menu-item"
                    data={{
                        component: "imageAndParagraph",
                        height: Components.paragraph.defaultHeight,
                        isNewElement: true,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-heading" /> IMAGE AND
                        PARAGRAPH
                    </button>
                </BuilderElementsMenuItem>
            </div>
            <div className="element-wrapper">
                <BuilderElementsMenuItem
                    id="fourFlipCards-menu-item"
                    data={{
                        component: "fourFlipCards",
                        height: Components.flipcard.defaultHeight,
                        isNewElement: true,
                    }}
                >
                    <button className="element">
                        <FontAwesomeIcon icon="fa-solid fa-heading" /> FOUR FLIP
                        CARDS
                    </button>
                </BuilderElementsMenuItem>
            </div>
        </div>
    );
};

export default BuilderElementsMenu;
