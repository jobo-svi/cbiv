import React from "react";
import ColumnLayout from "./ColumnLayout";
import FlipCard from "./FlipCard";
import Image from "./Image";
import Header from "./Header";
import UndefinedElement from "./UndefinedElement";

export const Components = {
  header: {
    type: Header,
    defaults: {
      props: {
        text: "My Header",
      },
    },
  },
  image: {
    type: Image,
    defaults: {
      props: {
        src: `https://source.unsplash.com/random/150x150?t=1234`,
        alt: "Alt Text",
      },
    },
  },
  flipcard: {
    type: FlipCard,
    validChildComponents: [Image],
  },
  columnlayout: {
    type: ColumnLayout,
  },
};

// TODO: need a map of what components can be children of what other components,
// and throw an error or ignore if invalid, ie: flipcard's child can't be another flipcard.

// Get the props for a component. Recursively handle nested sub-components
const getProps = (item) => {
  const props = {
    key: item._uid,
  };

  for (const [key, value] of Object.entries(item.props)) {
    const isChildComponent =
      value !== null &&
      typeof value === "object" &&
      value.hasOwnProperty("component");

    // const isArrayOfChildComponents = value !== null &&
    // typeof value === "array" &&
    // value.some((item) => )

    if (isChildComponent) {
      // TODO: make sure its children are valid children (maybe put this in getProps)
      // if (Components[item.component].validChildComponents) {
      //   console.log(
      //     Components[item.component].validChildComponents.includes(
      //       Components[item.component].type
      //     )
      //   );
      // }

      props[key] = React.createElement(
        Components[value.component].type,
        getProps(value)
      );
    } else {
      props[key] = value;
    }
  }

  return props;
};

export const constructComponent = (item) => {
  if (
    Components[item.component] &&
    typeof Components[item.component].type !== "undefined"
  ) {
    return React.createElement(Components[item.component].type, getProps(item));
  }

  return React.createElement(
    () => <UndefinedElement element={item.component} />,
    { key: item._uid }
  );
};
