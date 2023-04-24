import React from "react";
import DraggableElement from "./DraggableElement";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentsList } from "./ComponentFactory";
import uuid from "react-uuid";
import "../css/App.css";

const BuilderElementsMenu = (props) => {
  return (
    <div className="builder-elements-menu">
      <div className="element-wrapper">
        <DraggableElement
          type="header-menu-item"
          data={{
            type: "header",
          }}
        >
          <button className="element">
            <FontAwesomeIcon icon="fa-solid fa-heading" /> HEADER
          </button>
        </DraggableElement>
      </div>
      <div className="element-wrapper">
        <DraggableElement
          type="image-menu-item"
          data={{
            type: "image",
          }}
        >
          <button className="element">
            <FontAwesomeIcon icon="image" /> IMAGE
          </button>
        </DraggableElement>
      </div>
    </div>
  );
};

export default BuilderElementsMenu;
