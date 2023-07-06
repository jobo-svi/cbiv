import { Slate, Editable, withReact, useSlate } from "slate-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BlockButton from "./BlockButton";

const PropertiesEditor = (props) => {
    const editor = useSlate();
    return (
        <div id="properties-editor">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",

                    background: "white",
                }}
            >
                <p>Alignment</p>
                <div>
                    <BlockButton format="left" blockType="align">
                        <FontAwesomeIcon icon="fa-solid fa-align-left" />
                    </BlockButton>
                    <BlockButton format="center" blockType="align">
                        <FontAwesomeIcon icon="fa-solid fa-align-center" />
                    </BlockButton>
                    <BlockButton format="right" blockType="align">
                        <FontAwesomeIcon icon="fa-solid fa-align-right" />
                    </BlockButton>
                    <BlockButton format="justify" blockType="align">
                        <FontAwesomeIcon icon="fa-solid fa-align-justify" />
                    </BlockButton>
                </div>
            </div>
            <div>
                <button
                    style={{ marginTop: "1rem", background: "white" }}
                    onClick={props.onComplete}
                >
                    done
                </button>
            </div>
        </div>
    );
};

export default PropertiesEditor;
