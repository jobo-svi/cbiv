import { Editor, Element as SlateElement, Transforms } from "slate";

export const LIST_TYPES = ["numbered-list", "bulleted-list"];
export const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];

const CustomEditor = {
    // Leaf (text) level
    isMarkActive(editor, format) {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    },

    toggleMark(editor, format) {
        const isActive = CustomEditor.isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    },

    toggleSuperscriptMark(editor) {
        const isActive = CustomEditor.isMarkActive(editor, "superscript");
        if (isActive) {
            Editor.removeMark(editor, "superscript");
        } else {
            Editor.removeMark(editor, "subscript");
            Editor.addMark(editor, "superscript", true);
        }
    },

    toggleSubscriptMark(editor) {
        const isActive = CustomEditor.isMarkActive(editor, "subscript");
        if (isActive) {
            Editor.removeMark(editor, "subscript");
        } else {
            Editor.removeMark(editor, "superscript");
            Editor.addMark(editor, "subscript", true);
        }
    },

    // Block level
    isBlockActive(editor, format, blockType = "type") {
        const { selection } = editor;
        if (!selection) return false;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: (n) =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n[blockType] === format,
            })
        );

        return !!match;
    },

    toggleBlock(editor, format) {
        const isActive = this.isBlockActive(
            editor,
            format,
            TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
        );
        const isList = LIST_TYPES.includes(format);

        Transforms.unwrapNodes(editor, {
            match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                LIST_TYPES.includes(n.type) &&
                !TEXT_ALIGN_TYPES.includes(format),
            split: true,
        });
        let newProperties = {};
        if (TEXT_ALIGN_TYPES.includes(format)) {
            newProperties = {
                align: isActive ? undefined : format,
            };
        } else {
            newProperties = {
                type: isActive ? "paragraph" : isList ? "list-item" : format,
            };
        }
        Transforms.setNodes(editor, newProperties);

        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    },

    isAlignmentActive(editor, alignment) {
        const { selection } = editor;
        if (!selection) return false;

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: (n) =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n["align"] === alignment,
            })
        );

        return !!match;
    },

    setMarkProperty(editor, format, value) {
        Editor.addMark(editor, format, value);
    },

    setBlockProperty(editor, format, value) {
        const newProperties = {
            [format]: value,
        };

        Transforms.setNodes(editor, newProperties);
    },
};

export default CustomEditor;
