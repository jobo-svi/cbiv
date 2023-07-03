import { Editor, Element as SlateElement, Transforms } from "slate";

const CustomEditor = {
    isBoldMarkActive(editor) {
        const marks = Editor.marks(editor);
        return marks ? marks.bold === true : false;
    },

    isItalicMarkActive(editor) {
        const marks = Editor.marks(editor);
        return marks ? marks.italic === true : false;
    },

    isUnderlineMarkActive(editor) {
        const marks = Editor.marks(editor);
        return marks ? marks.underline === true : false;
    },

    isStrikethroughMarkActive(editor) {
        const marks = Editor.marks(editor);
        return marks ? marks.strikethrough === true : false;
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

    toggleAlignBlock(editor, alignment) {
        const isActive = this.isAlignmentActive(editor, alignment);

        const newProperties = {
            align: isActive ? undefined : alignment,
        };

        Transforms.setNodes(editor, newProperties);

        const [match] = Editor.nodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
        });
    },

    toggleBoldMark(editor) {
        const isActive = CustomEditor.isBoldMarkActive(editor);
        if (isActive) {
            Editor.removeMark(editor, "bold");
        } else {
            Editor.addMark(editor, "bold", true);
        }
    },

    toggleItalicMark(editor) {
        const isActive = CustomEditor.isItalicMarkActive(editor);
        if (isActive) {
            Editor.removeMark(editor, "italic");
        } else {
            Editor.addMark(editor, "italic", true);
        }
    },

    toggleUnderlineMark(editor) {
        const isActive = CustomEditor.isUnderlineMarkActive(editor);
        if (isActive) {
            Editor.removeMark(editor, "underline");
        } else {
            Editor.addMark(editor, "underline", true);
        }
    },

    toggleStrikethroughMark(editor) {
        const isActive = CustomEditor.isStrikethroughMarkActive(editor);
        if (isActive) {
            Editor.removeMark(editor, "strikethrough");
        } else {
            Editor.addMark(editor, "strikethrough", true);
        }
    },
};

export default CustomEditor;
