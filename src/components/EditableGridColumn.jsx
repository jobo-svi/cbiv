import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  createEditor,
  Editor,
  Element as SlateElement,
  Transforms,
} from "slate";
import { isText } from "@udecode/plate-common";
import { Slate, Editable, withReact } from "slate-react";

import { jsx } from "slate-hyperscript";
import EditorToolbar from "./EditorToolbar";
import CustomEditor from "./CustomEditor";
import Leaf from "./editor/Leaf";
import Element from "./editor/Element";
import PropertiesEditor from "./editor/PropertiesEditor";

import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
} from "@udecode/plate-basic-marks";
import { createBlockquotePlugin } from "@udecode/plate-block-quote";
import {
  Plate,
  createPlugins,
  createPlateEditor,
  usePlateEditorRef,
} from "@udecode/plate-common";
import { createHeadingPlugin } from "@udecode/plate-heading";
import { createParagraphPlugin } from "@udecode/plate-paragraph";
import { createPlateUI } from "@udecode/plate";
import { serializeHtml } from "@udecode/plate-serializer-html";
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
} from "@udecode/plate-font";
import { createAlignPlugin } from "@udecode/plate-alignment";
import {
  ELEMENT_PARAGRAPH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  StyledElement,
  withProps,
} from "@udecode/plate";

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
    components: createPlateUI(),
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

  switch (el.nodeName) {
    case "BODY":
      return jsx("fragment", {}, children);
    //   case 'BR':
    //     return '\n'
    case "H1":
      return jsx("element", { type: "h1", ...blockLevelAttributes }, children);
    case "H2":
      return jsx("element", { type: "h2", ...blockLevelAttributes }, children);
    case "H3":
      return jsx("element", { type: "h3", ...blockLevelAttributes }, children);
    case "P":
      return jsx("element", { type: "p", ...blockLevelAttributes }, children);
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

/* [
                    {
                        type: "p",
                        align: "justify",
                        children: [
                            {
                                text: "This is editable plain text with react and history plugins, just like a <textarea>! This is editable plain text with react and history plugins, just like a <textarea>! This is editable plain text with react and history plugins, just like a <textarea>! This is editable plain text with react and history plugins, just like a <textarea>! This is editable plain text with react and history plugins, just like a <textarea>!",
                                bold: true,
                                backgroundColor: "#fff",
                            },
                        ],
                    },
                ] */

const EditableGridColumn = (props) => {
  // Create a Slate editor object that won't change across renders.
  const [editor] = useState(() => withReact(createEditor()));

  const initialValue = useMemo(() => {
    // Deserialize html into Slate nodes
    const document = new DOMParser().parseFromString(
      props.column.props.text,
      "text/html"
    );
    const deserialized = deserialize(document.body);
    return deserialized;
  }, []);

  // Define a rendering function based on the element passed to `props`. We use
  // `useCallback` here to memoize the function for subsequent renders.
  const renderElement = useCallback((props) => {
    return <Element {...props} />;
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

  const handleEditComplete = (editor) => {
    props.handleEdit(serialize(editor));
  };

  const editableProps = {
    placeholder: "Type...",
    autofocus: true,
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
          <PropertiesEditor onComplete={() => handleEditComplete(editor)} />,
          document.getElementById("sidebar")
        )}
      </Plate>
      {/* <Slate editor={editor} initialValue={initialValue}>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    autoFocus={true}
                    onFocus={(event) => {
                        if (!editor.selection) {
                            Transforms.select(editor, Editor.end(editor, []));
                        }
                    }}
                    onKeyDown={(event) => {
                        if (!event.ctrlKey) {
                            return;
                        }

                        // Replace the `onKeyDown` logic with our new commands.
                        switch (event.key) {
                            case "b": {
                                event.preventDefault();
                                CustomEditor.toggleMark(editor, "bold");
                                break;
                            }

                            case "i": {
                                event.preventDefault();
                                CustomEditor.toggleMark(editor, "italic");
                                break;
                            }

                            case "u": {
                                event.preventDefault();
                                CustomEditor.toggleMark(editor, "underline");
                                break;
                            }
                        }
                    }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <EditorToolbar editor={editor} />
                    <button
                        style={{ margin: ".5rem", border: "1px solid #343536" }}
                        onClick={() => handleEditComplete(editor)}
                    >
                        DONE
                    </button>
                </div>

                { "The property editor needs access to the Slate context, but needs to render in the sidebar which is outside of the context." }
                { "So the fucky-wucky solution is to use a portal. There's probably a better way to do this, but I'm just one little manlet whose brain is tired."}
                {createPortal(
                    <PropertiesEditor
                        onComplete={() => handleEditComplete(editor)}
                    />,
                    document.getElementById("sidebar")
                )}
            </Slate> */}
    </div>
  );
};

export default EditableGridColumn;
