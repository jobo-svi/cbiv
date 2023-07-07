import { usePlateEditorState, someNode } from "@udecode/plate-common";

const BlockButton = ({ format, blockType = "type", children }) => {
    const editor = usePlateEditorState();

    const isBlockActive = (editor, format, blockType = "type") => {
        const { selection } = editor;
        if (!selection) return false;

        return someNode(editor, { match: (n) => n[blockType] === format });
    };

    return (
        <button
            onMouseDown={(event) => {
                event.preventDefault();
                editor.setNodes({ [blockType]: format });
            }}
            style={{
                border: isBlockActive(editor, format, blockType)
                    ? "1px solid black"
                    : "",
            }}
        >
            {children}
        </button>
    );
};

export default BlockButton;
