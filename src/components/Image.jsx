import React from "react";

const Image = (props) => {
  return (
    <div
      className="image-component"
      style={{
        justifyContent: props.horizontalAlignment,
        alignItems: props.verticalAlignment,
      }}
    >
      <img src={props.src} alt={props.alt} />
    </div>
  );
};

export default Image;
