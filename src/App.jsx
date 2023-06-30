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
    faAlignJustify
);

function App() {
    return <Builder />;
}

export default App;
