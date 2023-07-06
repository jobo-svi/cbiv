import { useState } from "react";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomEditor from "./CustomEditor";
import MarkButton from "./editor/MarkButton";
import BlockButton from "./editor/BlockButton";
import Input from "./editor/Input";

const EditorToolbar = () => {
    const editor = useSlate();
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
            <Input
                placeholder="text color"
                onClick={(value) => {
                    CustomEditor.setMarkProperty(editor, "textColor", value);
                }}
            />

            <BlockButton format="h1">
                <FontAwesomeIcon icon="fa-solid fa-1" />
            </BlockButton>
            <BlockButton format="h2">
                <FontAwesomeIcon icon="fa-solid fa-2" />
            </BlockButton>
            <BlockButton format="h3">
                <FontAwesomeIcon icon="fa-solid fa-3" />
            </BlockButton>

            <Input
                placeholder="bg color"
                onClick={(value) => {
                    CustomEditor.setBlockProperty(editor, "background", value);
                }}
            />
        </div>
    );
};

export default EditorToolbar;
