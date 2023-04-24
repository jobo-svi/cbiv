import React, { useState, useEffect } from "react";

const ItemEditor = (props) => {
  const [item, setItem] = useState(props.item);

  const handleTextChange = (e) => {
    // console.log( e.target.value );
    let temp = { ...props.item };
    temp.props.text = e.target.value;
    setItem(temp);
  };

  return (
    <div
      className="item-editor"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <input type="text" onChange={handleTextChange} value={item.props.text} />
      <button onClick={() => props.onSaveChanges(item)}>SAVE</button>
    </div>
  );
};

export default ItemEditor;
