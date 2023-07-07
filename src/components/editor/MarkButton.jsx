import {
  usePlateEditorState,
  isMarkActive,
  toggleMark,
} from "@udecode/plate-common";

const MarkButton = ({ mark, children }) => {
  const editor = usePlateEditorState();
  return (
    <button
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, { key: mark });
      }}
      style={{
        border: isMarkActive(editor, mark) ? "1px solid black" : "",
      }}
    >
      {children}
    </button>
  );
};

export default MarkButton;
