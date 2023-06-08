import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const UndefinedElement = (props) => {
    return (
        <div className="undefined-element">
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
            <span className="message">
                The element '{props.element}' could not be found
            </span>
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
        </div>
    );
};

export default UndefinedElement;
