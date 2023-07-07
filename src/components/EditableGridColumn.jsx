import {
    PlateProvider,
    createPlateEditor,
    selectEditor,
    focusEditor,
    isText,
    usePlateSelectors,
    withPlate,
} from "@udecode/plate-common";
import { useEffect, useMemo } from "react";
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
import { createEditor } from "slate";
import { ReactEditor } from "slate-react";
import RichTextEditor from "./editor/RichTextEditor";

const EditableGridColumn = (props) => {
    const style = {
        width: !props.column.gridWidth
            ? `${100 / props.row.columns.length}%`
            : `${props.column.gridWidth}%`,
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
            <RichTextEditor
                initialValue={props.column.props.text}
                handleEdit={props.handleEdit}
            />
        </div>
    );
};

export default EditableGridColumn;
