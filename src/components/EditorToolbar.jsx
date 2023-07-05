import { Slate, Editable, withReact, useSlate } from "slate-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomEditor from "./CustomEditor";

const MarkButton = ({ format, children }) => {
    const editor = useSlate();
    return (
        <button
            onClick={() => {
                CustomEditor.toggleMark(editor, format);
            }}
            style={{
                border: CustomEditor.isMarkActive(editor, format)
                    ? "1px solid black"
                    : "",
            }}
        >
            {children}
        </button>
    );
};

const BlockButton = ({ format, children }) => {
    const editor = useSlate();
    return (
        <button
            onClick={() => {
                CustomEditor.toggleBlock(editor, format);
            }}
            style={{
                border: CustomEditor.isBlockActive(editor, format)
                    ? "1px solid black"
                    : "",
            }}
        >
            {children}
        </button>
    );
};

const EditorToolbar = () => {
    return (
        <div>
            <MarkButton format="bold">
                <FontAwesomeIcon icon="fa-solid fa-bold" />
            </MarkButton>
            <MarkButton format="italic">
                <FontAwesomeIcon icon="fa-solid fa-italic" />
            </MarkButton>
            <MarkButton format="underline">
                <FontAwesomeIcon icon="fa-solid fa-underline" />
            </MarkButton>
            <MarkButton format="strikethrough">
                <FontAwesomeIcon icon="fa-solid fa-strikethrough" />
            </MarkButton>
            <MarkButton format="superscript">
                <FontAwesomeIcon icon="fa-solid fa-superscript" />
            </MarkButton>
            <MarkButton format="subscript">
                <FontAwesomeIcon icon="fa-solid fa-subscript" />
            </MarkButton>

            <BlockButton format="h1">
                <FontAwesomeIcon icon="fa-solid fa-1" />
            </BlockButton>
            <BlockButton format="h2">
                <FontAwesomeIcon icon="fa-solid fa-2" />
            </BlockButton>
            <BlockButton format="h3">
                <FontAwesomeIcon icon="fa-solid fa-3" />
            </BlockButton>
            <BlockButton format="left">
                <FontAwesomeIcon icon="fa-solid fa-align-left" />
            </BlockButton>
            <BlockButton format="center">
                <FontAwesomeIcon icon="fa-solid fa-align-center" />
            </BlockButton>
            <BlockButton format="right">
                <FontAwesomeIcon icon="fa-solid fa-align-right" />
            </BlockButton>
            <BlockButton format="justify">
                <FontAwesomeIcon icon="fa-solid fa-align-justify" />
            </BlockButton>
            {/* <button
                onClick={() => {
                    CustomEditor.toggleBackgroundColor(editor);
                }}
            >
                bg color
            </button> */}
        </div>
    );
};

export default EditorToolbar;
