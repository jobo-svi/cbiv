import uuid from "react-uuid";

export const data = {
  content: {
    body: [
      {
        _uid: uuid(),
        component: "header",
        props: {
          text: "Item 1",
        },
      },
      {
        _uid: uuid(),
        component: "header",
        props: {
          text: "Item 2",
        },
      },
      {
        _uid: uuid(),
        component: "header",
        props: {
          text: "Item 3",
        },
      },
            {
        _uid: uuid(),
        component: "header",
        props: {
          text: "Item 4",
        },
      },
      {
        _uid: uuid(),
        component: "header",
        props: {
          text: "Item 5",
        },
      },
    //   {
    //     _uid: uuid(),
    //     component: "image",
    //     props: {
    //       src: `https://source.unsplash.com/random/150x150?t=${uuid()}`,
    //       alt: "more text",
    //     },
    //   },
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
