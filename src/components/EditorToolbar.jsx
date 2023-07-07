import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarkButton from "./editor/MarkButton";
import BlockButton from "./editor/BlockButton";
import Input from "./editor/Input";
import { usePlateEditorRef, setMarks, toggleMark } from "@udecode/plate-common";
import { insertTable } from "@udecode/plate";

const EditorToolbar = () => {
    const editor = usePlateEditorRef();
    return (
        <div>
            <MarkButton mark="bold">
                <FontAwesomeIcon icon="fa-solid fa-bold" />
            </MarkButton>
            <MarkButton mark="italic">
                <FontAwesomeIcon icon="fa-solid fa-italic" />
            </MarkButton>
            <MarkButton mark="underline">
                <FontAwesomeIcon icon="fa-solid fa-underline" />
            </MarkButton>
            <MarkButton mark="strikethrough">
                <FontAwesomeIcon icon="fa-solid fa-strikethrough" />
            </MarkButton>
            <MarkButton mark="superscript">
                <FontAwesomeIcon icon="fa-solid fa-superscript" />
            </MarkButton>
            <MarkButton mark="subscript">
                <FontAwesomeIcon icon="fa-solid fa-subscript" />
            </MarkButton>

            {/* <button
                onClick={() => {
                    insertTable(editor, { rowCount: 1, colCount: 2 });
                }}
            >
                insert table
            </button> */}
        </div>
    );
};

export default EditorToolbar;
