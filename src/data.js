import uuid from "react-uuid";

export const data = {
    content: {
        body: [
            {
                id: uuid(),
                component: "paragraph",
                props: {
                    text:
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.",
                },
            },
            {
                id: uuid(),
                component: "header",
                props: {
                    text: "Lorem Ipsum",
                },
            },
            {
                id: uuid(),
                component: "paragraph",
                props: {
                    text:
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.",
                },
            },
            {
                id: uuid(),
                component: "paragraph",
                props: {
                    text:
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.",
                },
            },
            // {
            //     id: "row1",
            //     columns: [
            //         {
            //             id: "ele1",
            //             component: "paragraph",
            //             props: {
            //                 text:
            //                     "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.",
            //             },
            //         },
            //     ],
            // },
            // {
            //     id: "row2",
            //     columns: [
            //         {
            //             id: "ele2",
            //             component: "header",
            //             props: {
            //                 text: "Lorem ipsum.",
            //             },
            //         },
            //     ],
            // },
        ],
    },
};
