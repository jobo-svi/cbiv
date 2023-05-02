import uuid from "react-uuid";

export const data = {
    content: {
        body: [
            // {
            //     _uid: uuid(),
            //     component: "paragraph",
            //     props: {
            //         text:
            //             "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris mattis felis sed suscipit consequat. Nullam feugiat quam sit amet est tincidunt, nec malesuada augue posuere. Curabitur posuere libero eu nunc rhoncus, sit amet ullamcorper magna mattis. Nullam et mauris in risus malesuada fringilla ut et lacus. Phasellus congue at velit ac cursus. Integer pretium magna vitae ex vehicula lobortis. Morbi tincidunt purus a lorem pharetra molestie. Morbi ac volutpat diam. In sollicitudin luctus dictum. In sollicitudin nisl sapien, ut dignissim nibh consectetur vitae.",
            //     },
            // },

            {
                _uid: uuid(),
                columns: [
                    {
                        _uid: uuid(),
                        component: "header",
                        props: {
                            text: "Item 1",
                        },
                    },
                    // {
                    //     _uid: uuid(),
                    //     component: "header",
                    //     props: {
                    //         text: "Item 2",
                    //     },
                    // },
                ],
            },
            {
                _uid: uuid(),
                columns: [
                    {
                        _uid: uuid(),
                        component: "header",
                        props: {
                            text: "Item 2",
                        },
                    },
                    // {
                    //     _uid: uuid(),
                    //     component: "header",
                    //     props: {
                    //         text: "Item 2",
                    //     },
                    // },
                ],
            },

            //   {
            //     _uid: uuid(),
            //     component: "image",
            //     props: {
            //       src: `https://source.unsplash.com/random/150x150?t=${uuid()}`,
            //       alt: "more text",
            //     },
            //   },
        ],
    },
};
