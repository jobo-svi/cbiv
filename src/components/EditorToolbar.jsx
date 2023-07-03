import { useCallback, useEffect, useRef, useState } from "react";
import { createEditor, Editor, Transforms, Element } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomEditor from "./CustomEditor";

const EditorToolbar = ({ editor }) => {
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    return (
        <div>
            <button
                onClick={() => {
                    CustomEditor.toggleBoldMark(editor);
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-bold" />
            </button>
            <button
                onClick={() => {
                    CustomEditor.toggleStrikethroughMark(editor);
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-strikethrough" />
            </button>
            <button
                onClick={() => {
                    CustomEditor.toggleItalicMark(editor);
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-italic" />
            </button>
            <button
                onClick={() => {
                    CustomEditor.toggleUnderlineMark(editor);
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-underline" />
            </button>

            <button
                onClick={() => {
                    CustomEditor.toggleAlignBlock(editor, "left");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-align-left" />
            </button>
            <button
                onClick={() => {
                    CustomEditor.toggleAlignBlock(editor, "center");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-align-center" />
            </button>
            <button
                onClick={() => {
                    CustomEditor.toggleAlignBlock(editor, "right");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-align-right" />
            </button>
            <button
                onClick={() => {
                    CustomEditor.toggleAlignBlock(editor, "justify");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-align-justify" />
            </button>
        </div>
    );
};

export default EditorToolbar;
