// Which block-level element to render
const Element = ({ attributes, children, element }) => {
    const style = {
        textAlign: element.align,
        background: element.background,
    };

    if (element.type === "h1") {
        return (
            <h1 style={style} {...attributes}>
                {children}
            </h1>
        );
    } else if (element.type === "h2") {
        return (
            <h2 style={style} {...attributes}>
                {children}
            </h2>
        );
    } else if (element.type === "h3") {
        return (
            <h3 style={style} {...attributes}>
                {children}
            </h3>
        );
    } else {
        // Default to paragraph
        return (
            <p style={style} {...attributes}>
                {children}
            </p>
        );
    }
};

export default Element;
