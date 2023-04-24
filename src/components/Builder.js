import "../css/App.css";
import React, { useEffect, useState } from "react";
import CustomGrid from "./CustomGrid";
import { data } from "../data";
import BuilderElementsMenu from "./BuilderElementsMenu";
import ItemEditor from "./ItemEditor";
import BuilderNavbar from "./BuilderNavbar";

const PageBuilder = () => {
  const [items, setItems] = useState(data.content.body);

  const [itemToEdit, setItemToEdit] = useState(null);

  const handleGridItemClick = (item) => {
    console.log(item);
    setItemToEdit(item);
  };

  const handleSaveChanges = (updatedItem) => {
    setItems(
      items.map((item) => (item._uid === updatedItem._uid ? updatedItem : item))
    );
    setItemToEdit(null);
  };

  return (
    <div className="builder">
      <BuilderNavbar />
      <div className="lessons">lessons</div>
      <div className="lesson-content">
        <CustomGrid
          items={items}
          setItems={setItems}
          onGridItemClick={handleGridItemClick}
        />
      </div>
      <div className="sidebar">
        {itemToEdit !== null ? (
          <ItemEditor item={itemToEdit} onSaveChanges={handleSaveChanges} />
        ) : (
          <BuilderElementsMenu />
        )}
      </div>
    </div>
  );
};

export default PageBuilder;