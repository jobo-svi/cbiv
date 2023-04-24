import React from "react";
import Builder from "./components/Builder";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faImage,
  faHeading,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

library.add(faImage, faHeading, faTriangleExclamation);

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Builder />
    </DndProvider>
  );
}

export default App;
