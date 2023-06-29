import React from "react";

const Paragraph = (props) => {
    return <div dangerouslySetInnerHTML={{ __html: props.text }}></div>;
};

export default Paragraph;
