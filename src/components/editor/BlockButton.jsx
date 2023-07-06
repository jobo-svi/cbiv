import { useSlate } from "slate-react";
import CustomEditor from "../CustomEditor";

const BlockButton = ({ format, blockType, children }) => {
    const editor = useSlate();
    return (
        <button
            onClick={() => {
                CustomEditor.toggleBlock(editor, format);
            }}
            style={{
                border: CustomEditor.isBlockActive(editor, format, blockType)
                    ? "1px solid black"
                    : "",
            }}
        >
            {children}
        </button>
    );
};

export default BlockButton;
