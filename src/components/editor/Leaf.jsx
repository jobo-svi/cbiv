const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.strikethrough) {
        children = <s>{children}</s>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.superscript) {
        children = <sup>{children}</sup>;
    }

    if (leaf.subscript) {
        children = <sub>{children}</sub>;
    }

    return <span {...attributes}>{children}</span>;
};

export default Leaf;
