import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  usePlateEditorState,
  someNode,
  focusEditor,
} from "@udecode/plate-common";
import { insertLink, upsertLink, validateUrl } from "@udecode/plate-link";

import MarkButton from "./MarkButton";
import { useState } from "react";

const EditorToolbar = () => {
  const editor = usePlateEditorState();

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
      <button
        onMouseDown={(event) => {
          if (!editor) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();

          //focusEditor(editor);

          let url = window.prompt("enter link", "https://google.com");
          insertLink(editor, { url: url, text: "da text" });
        }}
      >
        asdf
      </button>
    </div>
  );
};

export default EditorToolbar;
