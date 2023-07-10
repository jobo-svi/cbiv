import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePlateEditorState, findNode } from "@udecode/plate-common";
import BlockButton from "./BlockButton";
import Input from "./Input";

const PropertiesEditor = (props) => {
    const editor = usePlateEditorState();

    const [fontSize, setFontSize] = useState(null);
    const [lineHeight, setLineHeight] = useState(null);
    const [textColor, setTextColor] = useState(null);
    const [backgroundColor, setBackgroundColor] = useState(null);

    useEffect(() => {
        const marks = editor.getMarks();
        setFontSize(marks?.fontSize ?? null);
        setTextColor(marks?.color ?? null);

        // Block level stuff
        const lh = findNode(editor, {
            match: (n) => n["lineHeight"],
        });

        if (lh) {
            setLineHeight(lh[0].lineHeight);
        }

        const bgColor = findNode(editor, {
            match: (n) => n["backgroundColor"],
        });

        if (bgColor) {
            setBackgroundColor(bgColor[0].backgroundColor);
        }
    }, [editor]);

    return (
        <div id="properties-editor">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "white",
                    marginBottom: "5px",
                }}
            >
                <BlockButton format="p">
                    <FontAwesomeIcon icon="fa-solid fa-paragraph" />
                </BlockButton>
                <BlockButton format="h1">
                    <FontAwesomeIcon icon="fa-solid fa-1" />
                </BlockButton>
                <BlockButton format="h2">
                    <FontAwesomeIcon icon="fa-solid fa-2" />
                </BlockButton>
                <BlockButton format="h3">
                    <FontAwesomeIcon icon="fa-solid fa-3" />
                </BlockButton>
                <BlockButton format="h4">
                    <FontAwesomeIcon icon="fa-solid fa-4" />
                </BlockButton>
                <BlockButton format="h5">
                    <FontAwesomeIcon icon="fa-solid fa-5" />
                </BlockButton>
                <BlockButton format="h6">
                    <FontAwesomeIcon icon="fa-solid fa-6" />
                </BlockButton>
                <BlockButton format="blockquote">
                    <FontAwesomeIcon icon="fa-solid fa-quote-left" />
                </BlockButton>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "white",
                    marginBottom: "5px",
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "white",
                    marginBottom: "5px",
                }}
            >
                <p>Font Size</p>
                <div>
                    <Input
                        placeholder="font size"
                        initialValue={fontSize}
                        onClick={(value) => {
                            editor.addMark("fontSize", value);
                        }}
                    />
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "white",
                    marginBottom: "5px",
                }}
            >
                <p>Line Height</p>
                <div>
                    <Input
                        placeholder="line height"
                        initialValue={lineHeight}
                        onClick={(value) => {
                            editor.setNodes({ lineHeight: value });
                        }}
                    />
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "white",
                    marginBottom: "5px",
                }}
            >
                <p>Text Color</p>
                <div>
                    <Input
                        placeholder="text color"
                        initialValue={textColor}
                        onClick={(value) => {
                            editor.addMark("color", value);
                        }}
                    />
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "white",
                    marginBottom: "5px",
                }}
            >
                <p>BG Color</p>
                <div>
                    <Input
                        placeholder="bg color"
                        initialValue={backgroundColor}
                        onClick={(value) => {
                            editor.setNodes({ backgroundColor: value });
                        }}
                    />
                </div>
            </div>
            {/* <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "white",
                    marginBottom: "5px",
                }}
            >
                <p>Indent</p>
                <div>
                    <button
                        onClick={() => {
                            editor.setNodes({ indent: 1 });
                            console.log(editor);
                        }}
                    >
                        increase indent
                    </button>
                </div>
            </div> */}
            {props.children}
        </div>
    );
};

export default PropertiesEditor;
