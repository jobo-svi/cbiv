import React from "react";
import FlipCard from "./FlipCard";
import Header from "./Header";
import Image from "./Image";
import Paragraph from "./Paragraph";
import UndefinedElement from "./UndefinedElement";

export const Components = {
    header: [
        {
            type: Header,
            component: "header",
            props: {
                text: "<h1>My Header</h1>",
            },
            defaultHeight: 48,
        },
    ],
    paragraph: [
        {
            type: Paragraph,
            component: "paragraph",
            props: {
                text: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.</p>",
            },
            defaultHeight: 96,
        },
    ],
    image: [
        {
            type: Image,
            component: "image",
            props: {
                src: `img/image-2.jpg`,
                alt: "Alt Text",
            },
            defaultHeight: 500,
        },
    ],
    flipcard: [
        {
            type: FlipCard,
            component: "flipcard",
            defaultHeight: 300,
        },
    ],
    headerAndParagraph: [
        {
            type: Header,
            component: "header",
            props: {
                text: "<h1>My Header</h1>",
            },
            defaultHeight: 96,
        },
        {
            type: Paragraph,
            component: "paragraph",
            props: {
                text: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.</p>",
            },
            defaultHeight: 96,
        },
    ],
    imageAndParagraph: [
        {
            type: Image,
            component: "image",
            props: {
                src: `img/image-2.jpg`,
                alt: "Alt Text",
            },
            defaultHeight: 826,
        },
        {
            type: Paragraph,
            component: "paragraph",
            props: {
                text: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.</p>",
            },
            defaultHeight: 96,
        },
    ],
    fourFlipCards: [
        {
            type: FlipCard,
            component: "flipcard",
            defaultHeight: 300,
        },
        {
            type: FlipCard,
            component: "flipcard",
            defaultHeight: 300,
        },
        {
            type: FlipCard,
            component: "flipcard",
            defaultHeight: 300,
        },
        {
            type: FlipCard,
            component: "flipcard",
            defaultHeight: 300,
        },
    ],
};

// Get the props for a component. Recursively handle nested sub-components
const getProps = (item) => {
    const props = {
        key: item.id,
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
        typeof Components[item.component][0].type !== "undefined"
    ) {
        return React.createElement(
            Components[item.component][0].type,
            getProps(item)
        );
    }

    return React.createElement(
        () => <UndefinedElement element={item.component} />,
        { key: item.id }
    );
};
