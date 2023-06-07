import React, { useState, useEffect } from "react";
import { Components, constructComponent } from "./ComponentFactory";

const ItemEditor = (props) => {
  // Create a deep copy of the item to be edited,
  const [item, setItem] = useState(JSON.parse(JSON.stringify(props.item)));

  const handleTextChange = (e) => {
    let temp = { ...item };
    temp.props.text = e.target.value;
    setItem(temp);
  };

  return (
    <div
      className="item-editor"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {constructComponent(props.item)}
      <input type="text" onChange={handleTextChange} value={item.props.text} />
      <button onClick={() => props.onSaveChanges(item)}>SAVE</button>
    </div>
  );
};

export default ItemEditor;