import React from "react";
import Builder from "./components/Builder";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faImage,
    faHeading,
    faParagraph,
    faTriangleExclamation,
    faUpDownLeftRight,
    faRotateLeft,
    faRotateRight,
    faTrashCan,
    faGripVertical,
    faBold,
    faStrikethrough,
    faItalic,
    faUnderline,
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
    faAlignJustify,
    faSubscript,
    faSuperscript,
    fa1,
    fa2,
    fa3,
    fa4,
    fa5,
    fa6,
} from "@fortawesome/free-solid-svg-icons";

library.add(
    faImage,
    faHeading,
    faParagraph,
    faTriangleExclamation,
    faUpDownLeftRight,
    faRotateLeft,
    faRotateRight,
    faTrashCan,
    faGripVertical,
    faBold,
    faStrikethrough,
    faItalic,
    faUnderline,
    faAlignLeft,
    faAlignCenter,
    faAlignRight,
    faAlignJustify,
    faSubscript,
    faSuperscript,
    fa1,
    fa2,
    fa3,
    fa4,
    fa5,
    fa6
);

function App() {
    return <Builder />;
}

export default App;
