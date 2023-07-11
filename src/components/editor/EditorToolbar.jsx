import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  usePlateEditorState,
  someNode,
  focusEditor,
  getEditorString,
  findNode,
  getPluginType,
} from "@udecode/plate-common";
import { ELEMENT_LINK } from "@udecode/plate";
import {
  insertLink,
  upsertLink,
  validateUrl,
  triggerFloatingLinkInsert,
} from "@udecode/plate-link";

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

          const at = editor.selection;

          // selection contains at one edge edge or between the edges
          const linkEntry = findNode(editor, {
            at,
            match: { type: getPluginType(editor, ELEMENT_LINK) },
          });
          const [linkNode, linkPath] = linkEntry ?? [];

          let url = window.prompt("enter link", "https://google.com");

          if (url) {
            insertLink(editor, { url: url, text: "link text" });
          }
        }}
      >
        insert link
      </button>
    </div>
  );
};

export default EditorToolbar;
