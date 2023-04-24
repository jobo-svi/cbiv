import "../css/App.css";
import React, { useEffect, useState } from "react";
import CustomGrid from "./CustomGrid";
import { data } from "../data";
import BuilderElementsMenu from "./BuilderElementsMenu";
import ItemEditor from "./ItemEditor";

const PageBuilder = () => {
  const [items, setItems] = useState(data.content.body);

  const [itemToEdit, setItemToEdit] = useState(null);

  const handleGridItemClick = (item) => {
    console.log(item);
    setItemToEdit(item);
  };

  const handleSaveChanges = (updatedItem) => {
    // items.map((item) => {
    //   console.log(item);
    // });
    // setItems(
    //   items.map((item) => (item._uid === updatedItem._uid ? updatedItem : item))
    // );
    setItemToEdit(null);
  };

  return (
    <div className="builder">
      <div className="sidebar">
        {itemToEdit !== null ? (
          <ItemEditor item={itemToEdit} onSaveChanges={handleSaveChanges} />
        ) : (
          <BuilderElementsMenu />
        )}
      </div>
      <div className="main">
        <CustomGrid
          items={items}
          setItems={setItems}
          onGridItemClick={handleGridItemClick}
        />
      </div>
    </div>
  );
};

export default PageBuilder;
