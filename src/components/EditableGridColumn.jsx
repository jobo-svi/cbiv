import { useEffect, useRef } from "react";
import {
    $createParagraphNode,
    $getRoot,
    $insertNodes,
    $isElementNode,
    $isDecoratorNode,
} from "lexical";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import EditorToolbar from "./EditorToolbar";

const EditableGridColumn = (props) => {
    const editorStateRef = useRef();
    const editedContents = useRef(props.column.props.text);

    // https://lexical.dev/docs/getting-started/theming
    // good examples of css can also be found in lexical's playground css source code
    const exampleTheme = {
        text: {
            bold: "editor-textBold",
            italic: "editor-textItalic",
            strikethrough: "editor-textStrikethrough",
            subscript: "editor-textSubscript",
            superscript: "editor-textSuperscript",
            underline: "editor-textUnderline",
            underlineStrikethrough: "editor-textUnderlineStrikethrough",
        },
    };

    const initialConfig = {
        namespace: "MyEditor",
        theme: exampleTheme,
        onError,
        editorState: (editor) => prepopulateEditorState(editor),
        nodes: [HeadingNode],
    };

    function prepopulateEditorState(editor) {
        editor.update(() => {
            // In the browser you can use the native DOMParser API to parse the HTML string.
            const parser = new DOMParser();
            const dom = parser.parseFromString(
                editedContents.current,
                "text/html"
            );

            // Once you have the DOM instance it's easy to generate LexicalNodes.
            const nodes = $generateNodesFromDOM(editor, dom);
            console.log(nodes);

            // Select the root
            $getRoot().select();

            // Insert them at a selection.
            $insertNodes(nodes);
        });
    }

    // When the editor changes, you can get notified via the
    // LexicalOnChangePlugin!
    function onChange(editorState, editor) {
        editorState.read(() => {
            editorStateRef.current = editorState;
            const htmlString = $generateHtmlFromNodes(editor);
            editedContents.current = htmlString;
        });
    }

    // Catch any errors that occur during Lexical updates and log them
    // or throw them as needed. If you don't throw them, Lexical will
    // try to recover gracefully without losing user data.
    function onError(error) {
        console.error(error);
    }

    const style = {
        width: !props.column.gridWidth
            ? `${100 / props.row.columns.length}%`
            : `${props.column.gridWidth}%`,
    };

    const handleEditComplete = () => {
        if (editedContents.current) {
            props.handleEdit(editedContents.current);
        }
    };

    return (
        <div
            id={props.column.id}
            className="grid-column"
            style={{
                minHeight: "100px",
                ...style,
                ...(props.column.props.style ? props.column.props.style : {}),
                border: "1px dashed black",
                background: "#D1D1D1",
            }}
        >
            <LexicalComposer initialConfig={initialConfig}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            style={{
                                minHeight: "100px",
                                outline: "0px solid transparent",
                            }}
                        />
                    }
                    placeholder={
                        <div
                            style={{
                                position: "absolute",
                                top: "0",
                                left: "0",
                                pointerEvents: "none",
                            }}
                        >
                            Enter some text...
                        </div>
                    }
                />
                <OnChangePlugin onChange={onChange} />

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <EditorToolbar />
                    <button
                        style={{ margin: ".5rem", border: "1px solid #343536" }}
                        onClick={handleEditComplete}
                    >
                        DONE
                    </button>
                </div>
            </LexicalComposer>
        </div>
    );
};

export default EditableGridColumn;
