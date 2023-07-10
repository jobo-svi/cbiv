import React from "react";

const RichText = (props) => {
    return <div dangerouslySetInnerHTML={{ __html: props.text }}></div>;
};

export default RichText;
