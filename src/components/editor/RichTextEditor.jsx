import { selectEditor, focusEditor, isText } from "@udecode/plate-common";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import EditorToolbar from "./EditorToolbar";
import PropertiesEditor from "./PropertiesEditor";
import {
    ELEMENT_H1,
    ELEMENT_H2,
    ELEMENT_H3,
    ELEMENT_H4,
    ELEMENT_H5,
    ELEMENT_H6,
    ELEMENT_PARAGRAPH,
    ELEMENT_BLOCKQUOTE,
    MARK_BOLD,
    MARK_ITALIC,
    MARK_UNDERLINE,
    MARK_STRIKETHROUGH,
    MARK_SUPERSCRIPT,
    MARK_SUBSCRIPT,
    createSoftBreakPlugin,
} from "@udecode/plate";
import { createAlignPlugin } from "@udecode/plate-alignment";
import {
    createBoldPlugin,
    createItalicPlugin,
    createStrikethroughPlugin,
    createSubscriptPlugin,
    createSuperscriptPlugin,
    createUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { createBlockquotePlugin } from "@udecode/plate-block-quote";
import { Plate, createPlugins, usePlateEditorRef } from "@udecode/plate-common";
import {
    createFontBackgroundColorPlugin,
    createFontColorPlugin,
    createFontSizePlugin,
} from "@udecode/plate-font";
import { createHeadingPlugin } from "@udecode/plate-heading";
import { createParagraphPlugin } from "@udecode/plate-paragraph";
import { createLineHeightPlugin } from "@udecode/plate";
import { createTablePlugin } from "@udecode/plate-table";
import { createIndentPlugin } from "@udecode/plate";
import { PlateElement, PlateLeaf } from "@udecode/plate-utils";

import { serialize, deserialize } from "./editorHelpers";

const makeElementComponent =
    (Component) =>
    ({ className, children, ...props }) => {
        return (
            <PlateElement asChild className={className} {...props}>
                <Component children={children} />
            </PlateElement>
        );
    };

const makeLeafComponent =
    (Component) =>
    ({ className, children, ...props }) => {
        return (
            <PlateLeaf asChild className={className} {...props}>
                <Component children={children} />
            </PlateLeaf>
        );
    };

// Let Plate know which plugins we want to use, and which elements we can use them on. Be not afraid, my child...
const defaultValidTypes = [
    ELEMENT_PARAGRAPH,
    ELEMENT_H1,
    ELEMENT_H2,
    ELEMENT_H3,
    ELEMENT_H4,
    ELEMENT_H5,
    ELEMENT_H6,
    ELEMENT_BLOCKQUOTE,
];

const plugins = createPlugins(
    [
        createParagraphPlugin(),
        createBlockquotePlugin(),
        createHeadingPlugin(),
        createBoldPlugin(),
        createItalicPlugin(),
        createUnderlinePlugin(),
        createStrikethroughPlugin(),
        createFontColorPlugin({
            inject: {
                props: {
                    validTypes: defaultValidTypes,
                },
            },
        }),
        createFontBackgroundColorPlugin(),
        createFontSizePlugin(),
        createSubscriptPlugin(),
        createSuperscriptPlugin(),
        createLineHeightPlugin({
            inject: {
                props: {
                    validTypes: defaultValidTypes,
                },
            },
        }),
        createTablePlugin(),
        createSoftBreakPlugin(),
        createIndentPlugin({
            inject: {
                props: {
                    validTypes: defaultValidTypes,
                },
            },
        }),
        createAlignPlugin({
            inject: {
                props: {
                    validTypes: defaultValidTypes,
                },
            },
        }),
    ],
    {
        components: {
            [ELEMENT_H1]: makeElementComponent("h1"),
            [ELEMENT_H2]: makeElementComponent("h2"),
            [ELEMENT_H3]: makeElementComponent("h3"),
            [ELEMENT_H4]: makeElementComponent("h4"),
            [ELEMENT_H5]: makeElementComponent("h5"),
            [ELEMENT_H6]: makeElementComponent("h6"),
            [ELEMENT_PARAGRAPH]: makeElementComponent("p"),
            [ELEMENT_BLOCKQUOTE]: makeElementComponent("blockquote"),
            [MARK_BOLD]: makeLeafComponent("strong"),
            [MARK_ITALIC]: makeLeafComponent("em"),
            [MARK_UNDERLINE]: makeLeafComponent("u"),
            [MARK_STRIKETHROUGH]: makeLeafComponent("s"),
            [MARK_SUPERSCRIPT]: makeLeafComponent("sup"),
            [MARK_SUBSCRIPT]: makeLeafComponent("sub"),
        },
    }
);

const RichTextEditor = (props) => {
    const initialValue = useMemo(() => {
        // Deserialize html into Slate nodes
        const document = new DOMParser().parseFromString(
            props.initialValue,
            "text/html"
        );

        return deserialize(document.body);
    }, []);

    const handleEditComplete = (editor) => {
        props.handleEdit(serialize(editor));
    };

    const editableProps = {
        placeholder: "Add your content here...",
        autoFocus: true,
    };
    return (
        <Plate
            editableProps={editableProps}
            initialValue={initialValue}
            plugins={plugins}
        >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <EditorToolbar />
                <AutofocusPlugin />
                <DoneEditingButton onClick={handleEditComplete} />
            </div>
            {/* The property editor needs access to the Slate context, but needs to render in the sidebar which is outside of the context. */}
            {/* So the fucky-wucky solution is to use a portal. There's probably a better way to do this, but I'm just one little manlet whose brain is tired. */}
            {createPortal(
                <PropertiesEditor>
                    <div>
                        <DoneEditingButton onClick={handleEditComplete} />
                    </div>
                </PropertiesEditor>,
                document.getElementById("sidebar")
            )}
        </Plate>
    );
};

// Auto focus the editor when it loads, and set the cursor to the end of the content,
// so the user doesn't have to manually select the content before applying certain transforms.
const AutofocusPlugin = () => {
    const plateEditor = usePlateEditorRef();

    useEffect(() => {
        if (plateEditor.selection === null) {
            selectEditor(plateEditor, { edge: "end" });
            focusEditor(plateEditor);
        }
    }, []);

    return null;
};

const DoneEditingButton = ({ onClick }) => {
    const plateEditor = usePlateEditorRef();

    return (
        <button
            style={{ margin: ".5rem", border: "1px solid #343536" }}
            onClick={() => onClick(plateEditor)}
        >
            DONE
        </button>
    );
};

export default RichTextEditor;
