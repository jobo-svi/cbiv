import React from "react";

const Header = (props) => {
    return <div dangerouslySetInnerHTML={{ __html: props.text }}></div>;
};

export default Header;
