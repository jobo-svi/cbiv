import uuid from "react-uuid";

export const data = {
  content: {
    body: [
      // {
      //   _uid: uuid(),
      //   component: "columnlayout",
      //   props: {
      //     cols: 3,
      //     items: [
      //       {
      //         _uid: uuid(),
      //         component: "image",
      //         position: 1,
      //         props: {
      //           src: `https://source.unsplash.com/random/150x150?t=${uuid()}`,
      //           alt: "some alt text",
      //         },
      //       },
      //     ],
      //   },
      // },
      {
        _uid: uuid(),
        component: "header",
        props: {
          text: "This is a header",
        },
      },
      {
        _uid: uuid(),
        component: "image",
        props: {
          src: `https://source.unsplash.com/random/150x150?t=${uuid()}`,
          alt: "more text",
          // horizontalAlignment: "center",
          // verticalAlignment: "center",
        },
      },
      {
        _uid: uuid(),
        component: "image",
        props: {
          src: `https://source.unsplash.com/random/150x150?t=${uuid()}`,
          alt: "more text",
          // horizontalAlignment: "end",
          // verticalAlignment: "end",
        },
      },
      // {
      //   _uid: uuid(),
      //   component: "image",
      //   props: {
      //     src: `https://source.unsplash.com/random/720x405?t=${uuid()}`,
      //     alt: "some alt text",
      //   },
      // },
      // {
      //   _uid: uuid(),
      //   component: "flipcard",
      //   props: {
      //     front: {
      //       _uid: uuid(),
      //       component: "image",
      //       props: {
      //         src: `https://source.unsplash.com/random/300x300?t=${uuid()}`,
      //         alt: "some alt text",
      //       },
      //     },
      //     back: {
      //       _uid: uuid(),
      //       component: "image",
      //       props: {
      //         src: `https://source.unsplash.com/random/300x300?t=${uuid()}`,
      //         alt: "some alt text",
      //       },
      //     },
      //   },
      // },
      // {
      //   _uid: uuid(),
      //   component: "flipcard",
      //   props: {
      //     frontImgSrc: `https://source.unsplash.com/random/300x300?t=${uuid()}`,
      //     topText: "haha",
      //     middleText: "what?",
      //     bottomText: "This is a bit longer",
      //     frontImgAltText: "Some alt text",
      //   },
      // },
      // {
      //   _uid: uuid(),
      //   component: "flipcard",
      //   props: {
      //     frontImgSrc: `https://source.unsplash.com/random/300x300?t=${uuid()}`,
      //     topText: "haha",
      //     middleText: "what?",
      //     bottomText: "This is a bit longer",
      //     frontImgAltText: "Some alt text",
      //   },
      // },
      // {
      //   _uid: uuid(),
      //   component: "nonexistent_component",
      //   title: "Bar",
      // },
    ],
  },
};
