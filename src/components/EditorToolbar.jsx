import { useCallback, useEffect, useState } from "react";
import {
    $getRoot,
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const EditorToolbar = () => {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));
            setIsUnderline(selection.hasFormat("underline"));
        }
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            })
        );
    }, [updateToolbar, editor]);

    return (
        <div>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-bold" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(
                        FORMAT_TEXT_COMMAND,
                        "strikethrough"
                    );
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-strikethrough" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-italic" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-underline" />
            </button>

            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-align-left" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-align-center" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-align-right" />
            </button>
            <button
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
                }}
            >
                <FontAwesomeIcon icon="fa-solid fa-align-justify" />
            </button>
        </div>
    );
};

export default EditorToolbar;
