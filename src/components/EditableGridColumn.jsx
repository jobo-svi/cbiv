import {
    PlateProvider,
    createPlateEditor,
    isText,
    withPlate,
} from "@udecode/plate-common";
import { useMemo } from "react";
import { createPortal } from "react-dom";
import { jsx } from "slate-hyperscript";
import EditorToolbar from "./EditorToolbar";
import PropertiesEditor from "./editor/PropertiesEditor";
import {
    ELEMENT_H1,
    ELEMENT_H2,
    ELEMENT_H3,
    ELEMENT_H4,
    ELEMENT_H5,
    ELEMENT_H6,
    ELEMENT_PARAGRAPH,
    MARK_BOLD,
    MARK_ITALIC,
    MARK_UNDERLINE,
    MARK_STRIKETHROUGH,
    MARK_SUPERSCRIPT,
    MARK_SUBSCRIPT,
    serializeHtml,
} from "@udecode/plate";
import { createAlignPlugin } from "@udecode/plate-alignment";
import {
    createBoldPlugin,
    createCodePlugin,
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

// Let Plate know which plugins we want to use
const plugins = createPlugins(
    [
        createParagraphPlugin(),
        createBlockquotePlugin(),
        createHeadingPlugin(),
        createBoldPlugin(),
        createItalicPlugin(),
        createUnderlinePlugin(),
        createStrikethroughPlugin(),
        createCodePlugin(),
        createFontColorPlugin(),
        createFontBackgroundColorPlugin(),
        createFontSizePlugin(),
        createSubscriptPlugin(),
        createSuperscriptPlugin(),
        createLineHeightPlugin(),
        createTablePlugin(),
        createIndentPlugin({
            inject: {
                props: {
                    validTypes: [
                        ELEMENT_PARAGRAPH,
                        ELEMENT_H1,
                        ELEMENT_H2,
                        ELEMENT_H3,
                        ELEMENT_H4,
                        ELEMENT_H5,
                        ELEMENT_H6,
                    ],
                },
            },
        }),
        createAlignPlugin({
            inject: {
                props: {
                    validTypes: [
                        ELEMENT_PARAGRAPH,
                        ELEMENT_H1,
                        ELEMENT_H2,
                        ELEMENT_H3,
                        ELEMENT_H4,
                        ELEMENT_H5,
                        ELEMENT_H6,
                    ],
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
            [MARK_BOLD]: makeLeafComponent("strong"),
            [MARK_ITALIC]: makeLeafComponent("em"),
            [MARK_UNDERLINE]: makeLeafComponent("u"),
            [MARK_STRIKETHROUGH]: makeLeafComponent("s"),
            [MARK_SUPERSCRIPT]: makeLeafComponent("sup"),
            [MARK_SUBSCRIPT]: makeLeafComponent("sub"),
        },
    }
);

// Convert nodes to html on save
const serialize = (node) => {
    if (isText(node)) {
        let string = node.text; //escapeHtml(node.text);

        if (node.strikethrough) {
            string = `<s>${string}</s>`;
        }

        if (node.underline) {
            string = `<u>${string}</u>`;
        }

        if (node.italic) {
            string = `<em>${string}</em>`;
        }

        if (node.bold) {
            string = `<strong>${string}</strong>`;
        }

        if (node.superscript) {
            string = `<sup>${string}</sup>`;
        }

        if (node.subscript) {
            string = `<sub>${string}</sub>`;
        }

        const markStyles = [];
        if (node.color) {
            markStyles.push(`color: ${node.color}`);
        }

        if (node.fontSize) {
            markStyles.push(`font-size: ${node.fontSize}`);
        }
        return `<span style="${markStyles.join(";")}">${string}</span>`;
    }

    const children = node.children.map((n) => serialize(n)).join("");

    const blockStyles = [];

    if (node.align) {
        blockStyles.push(`text-align: ${node.align}`);
    }

    if (node.backgroundColor) {
        blockStyles.push(`background-color: ${node.backgroundColor}`);
    }

    if (node.lineHeight) {
        blockStyles.push(`line-height: ${node.lineHeight}`);
    }

    if (node.indent) {
        console.log(node.indent);
        blockStyles.push(`margin-left: ${node.marginLeft}`);
    }

    switch (node.type) {
        case "h1":
            return `<h1 style="${blockStyles.join(";")}">${children}</h1>`;
        case "h2":
            return `<h2 style="${blockStyles.join(";")}">${children}</h2>`;
        case "h3":
            return `<h3 style="${blockStyles.join(";")}">${children}</h3>`;
        case "p":
            return `<p style="${blockStyles.join(";")}">${children}</p>`;
        default:
            return children;
    }
};

// convert html to nodes when opening the editor
const deserialize = (el, markAttributes = {}) => {
    if (el.nodeType === Node.TEXT_NODE) {
        return jsx("text", markAttributes, el.textContent);
    } else if (el.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    const nodeAttributes = { ...markAttributes };

    if (el.nodeName === "S") {
        nodeAttributes.strikethrough = true;
    }

    if (el.nodeName === "U") {
        nodeAttributes.underline = true;
    }

    if (el.nodeName === "EM") {
        nodeAttributes.italic = true;
    }

    if (el.nodeName === "STRONG") {
        nodeAttributes.bold = true;
    }

    if (el.nodeName === "SUP") {
        nodeAttributes.superscript = true;
    }

    if (el.nodeName === "SUB") {
        nodeAttributes.subscript = true;
    }

    if (el.style.color) {
        nodeAttributes.color = el.style.color;
    }

    if (el.style.fontSize) {
        nodeAttributes.fontSize = el.style.fontSize;
    }

    const children = Array.from(el.childNodes)
        .map((node) => deserialize(node, nodeAttributes))
        .flat();

    if (children.length === 0) {
        children.push(jsx("text", nodeAttributes, ""));
    }

    const blockLevelAttributes = {};

    if (el.style.textAlign) {
        blockLevelAttributes.align = el.style.textAlign;
    }

    if (el.style.backgroundColor) {
        blockLevelAttributes.backgroundColor = el.style.backgroundColor;
    }

    if (el.style.lineHeight) {
        blockLevelAttributes.lineHeight = el.style.lineHeight;
    }

    if (el.style.marginLeft) {
        blockLevelAttributes.marginLeft = el.style.marginLeft;
    }

    switch (el.nodeName) {
        case "BODY":
            return jsx("fragment", {}, children);
        //   case 'BR':
        //     return '\n'
        case "H1":
            return jsx(
                "element",
                { type: "h1", ...blockLevelAttributes },
                children
            );
        case "H2":
            return jsx(
                "element",
                { type: "h2", ...blockLevelAttributes },
                children
            );
        case "H3":
            return jsx(
                "element",
                { type: "h3", ...blockLevelAttributes },
                children
            );
        case "P":
            return jsx(
                "element",
                { type: "p", ...blockLevelAttributes },
                children
            );
        default:
            return children;
    }
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

const EditableGridColumn = (props) => {
    const initialValue = useMemo(() => {
        // Deserialize html into Slate nodes
        const document = new DOMParser().parseFromString(
            props.column.props.text,
            "text/html"
        );
        const deserialized = deserialize(document.body);
        return deserialized;
    }, []);

    const style = {
        width: !props.column.gridWidth
            ? `${100 / props.row.columns.length}%`
            : `${props.column.gridWidth}%`,
    };

    const handleEditComplete = (editor) => {
        props.handleEdit(serialize(editor));
    };

    const editableProps = {
        placeholder: "Type...",
        autoFocus: true,
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
            <Plate
                editableProps={editableProps}
                initialValue={initialValue}
                plugins={plugins}
            >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <EditorToolbar />
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
        </div>
    );
};

export default EditableGridColumn;
