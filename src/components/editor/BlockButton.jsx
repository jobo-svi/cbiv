import {
  usePlateEditorState,
  getPluginInjectProps,
  findDescendant,
  focusEditor,
} from "@udecode/plate-common";
import { setElements } from "@udecode/plate-common";

const BlockButton = ({ format, blockType, children }) => {
  const editor = usePlateEditorState();

  if (!editor.selection) {
  }
  const isBlockActive = (editor, format, blockType = "type") => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      editor.nodes({
        match: (n) => n[blockType] === format,
      })
    );
    return !!match;
  };

  return (
    <button
      onClick={() => {
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
