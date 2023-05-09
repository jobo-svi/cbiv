import React from "react";
import FlipCard from "./FlipCard";
import Image from "./Image";
import Header from "./Header";
import Paragraph from "./Paragraph";
import UndefinedElement from "./UndefinedElement";

export const Components = {
    header: {
        type: Header,
        component: "header",
        props: {
            text: "My Header",
        },
        defaultHeight: 48,
    },
    paragraph: {
        type: Paragraph,
        component: "paragraph",
        props: {
            text:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.",
        },
        defaultHeight: 96,
    },
    image: {
        type: Image,
        component: "image",
        props: {
            src: `img/image-2.jpg`,
            alt: "Alt Text",
        },
        defaultHeight: 826,
    },
    // flipcard: {
    //     type: FlipCard,
    //     validChildComponents: [Image],
    // },
    // columnlayout: {
    //     type: ColumnLayout,
    // },
};

// TODO: need a map of what components can be children of what other components,
// and throw an error or ignore if invalid, ie: flipcard's child can't be another flipcard.

// Get the props for a component. Recursively handle nested sub-components
const getProps = (item) => {
    const props = {
        key: item._uid,
    };

    if (!item.props) {
        return props;
    }
    for (const [key, value] of Object.entries(item.props)) {
        const isChildComponent =
            value !== null &&
            typeof value === "object" &&
            value.hasOwnProperty("component");

        if (isChildComponent) {
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
        return React.createElement(
            Components[item.component].type,
            getProps(item)
        );
    }

    return React.createElement(
        () => <UndefinedElement element={item.component} />,
        { key: item._uid }
    );
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
