import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createEditor, Editor, Transforms, Element, Text } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import EditorToolbar from "./EditorToolbar";
import CustomEditor from "./CustomEditor";

const Leaf = (props) => {
    const classes = [];
    if (props.leaf.bold) {
        classes.push("editor-textBold");
    }

    if (props.leaf.italic) {
        classes.push("editor-textItalic");
    }

    if (props.leaf.underline && props.leaf.strikethrough) {
        classes.push("editor-textUnderlineStrikethrough");
    } else if (props.leaf.underline) {
        classes.push("editor-textUnderline");
    } else if (props.leaf.strikethrough) {
        classes.push("editor-textStrikethrough");
    }

    return (
        <span {...props.attributes} className={classes.join(" ")}>
            {props.children}
        </span>
    );
};

const DefaultElement = ({ attributes, children, element }) => {
    const style = { textAlign: element.align };
    return (
        <p style={style} {...attributes}>
            {children}
        </p>
    );
};

const EditableGridColumn = (props) => {
    // Create a Slate editor object that won't change across renders.
    const [editor] = useState(() => withReact(createEditor()));

    const initialValue = useMemo(
        () =>
            JSON.parse(localStorage.getItem("content")) || [
                {
                    type: "paragraph",
                    children: [{ text: "A line of text in a paragraph." }],
                },
            ],
        []
    );

    // Define a rendering function based on the element passed to `props`. We use
    // `useCallback` here to memoize the function for subsequent renders.
    const renderElement = useCallback((props) => {
        switch (props.element.type) {
            default:
                return <DefaultElement {...props} />;
        }
    }, []);

    // Define a leaf rendering function that is memoized with `useCallback`.
    const renderLeaf = useCallback((props) => {
        return <Leaf {...props} />;
    }, []);

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

    const serialize = (node) => {
        if (Text.isText(node)) {
            let string = node.text; //escapeHtml(node.text);

            const classes = [];
            if (node.bold) {
                classes.push("editor-textBold");
            }

            if (node.italic) {
                classes.push("editor-textItalic");
            }

            if (node.underline && node.strikethrough) {
                classes.push("editor-textUnderlineStrikethrough");
            } else if (node.underline) {
                classes.push("editor-textUnderline");
            } else if (node.strikethrough) {
                classes.push("editor-textStrikethrough");
            }

            string = `<span class="${classes.join(" ")}">${string}</span>`;
            // if (node.bold) {
            //     string = `<strong>${string}</strong>`;
            // }

            // if (node.italic) {
            //     string =
            // }
            return string;
        }

        const children = node.children.map((n) => serialize(n)).join("");

        switch (node.type) {
            case "paragraph":
                return `<p>${children}</p>`;
            default:
                return children;
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
            <Slate
                editor={editor}
                initialValue={initialValue}
                onChange={(value) => {
                    const isAstChange = editor.operations.some(
                        (op) => "set_selection" !== op.type
                    );
                    if (isAstChange) {
                        // Save the value to Local Storage.
                        const content = JSON.stringify(value);
                        localStorage.setItem("content", content);

                        // Test out serializing to html
                        const res = serialize(editor);
                        console.log(res);
                    }
                }}
            >
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    onKeyDown={(event) => {
                        if (!event.ctrlKey) {
                            return;
                        }

                        // Replace the `onKeyDown` logic with our new commands.
                        switch (event.key) {
                            case "b": {
                                event.preventDefault();
                                CustomEditor.toggleBoldMark(editor);
                                break;
                            }

                            case "i": {
                                event.preventDefault();
                                CustomEditor.toggleItalicMark(editor);
                                break;
                            }

                            case "u": {
                                event.preventDefault();
                                CustomEditor.toggleUnderlineMark(editor);
                                break;
                            }
                        }
                    }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <EditorToolbar editor={editor} />
                    <button
                        style={{ margin: ".5rem", border: "1px solid #343536" }}
                        onClick={handleEditComplete}
                    >
                        DONE
                    </button>
                </div>
            </Slate>
        </div>
    );
};

export default EditableGridColumn;
