import React from "react";
import Builder from "./components/Builder";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faImage,
  faHeading,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

library.add(faImage, faHeading, faTriangleExclamation);

function App() {
  return (
      <Builder />
  );
}

export default App;
