import { useSlate } from "slate-react";
import CustomEditor from "../CustomEditor";

const MarkButton = ({ format, children }) => {
    const editor = useSlate();
    return (
        <button
            onMouseDown={(event) => {
                event.preventDefault();
                CustomEditor.toggleMark(editor, format);
            }}
            style={{
                border: CustomEditor.isMarkActive(editor, format)
                    ? "1px solid black"
                    : "",
            }}
        >
            {children}
        </button>
    );
};

export default MarkButton;
