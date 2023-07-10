import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarkButton from "./MarkButton";

const EditorToolbar = () => {
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
        </div>
    );
};

export default EditorToolbar;
