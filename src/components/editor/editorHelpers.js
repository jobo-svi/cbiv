import { jsx } from "slate-hyperscript";
import { isText } from "@udecode/plate-common";

/*
 * Slate doesn't handle converting to and from its schema, so we have to do it ourselves by recursively iterating through each node and converting to/from HTML.
 * Currently, we're serializing to HTML when the user saves to the database, and deserializing from HTML to Slate schema when we open the editor.
 * It sucks, but I can't think of a better way unless we want to save rich text elements in Slate's schema, and convert right before we display it.
 */
// Convert nodes to html on save
export const serialize = (node) => {
    if (isText(node)) {
        let string = node.text; //escapeHtml(node.text);

        if (node.strikethrough) {
            string = `<s>${string}</s>`;
        }

        if (node.underline) {
            string = `<u>${string}</u>`;
        }

        if (node.italic) {
            string = `<em>${string}</em>`;
        }

        if (node.bold) {
            string = `<strong>${string}</strong>`;
        }

        if (node.superscript) {
            string = `<sup>${string}</sup>`;
        }

        if (node.subscript) {
            string = `<sub>${string}</sub>`;
        }

        const markStyles = [];
        if (node.color) {
            markStyles.push(`color: ${node.color}`);
        }

        if (node.fontSize) {
            markStyles.push(`font-size: ${node.fontSize}`);
        }
        return `<span style="${markStyles.join(";")}">${string}</span>`;
    }

    const children = node.children.map((n) => serialize(n)).join("");

    const blockStyles = [];

    if (node.align) {
        blockStyles.push(`text-align: ${node.align}`);
    }

    if (node.backgroundColor) {
        blockStyles.push(`background-color: ${node.backgroundColor}`);
    }

    if (node.lineHeight) {
        blockStyles.push(`line-height: ${node.lineHeight}`);
    }

    if (node.indent) {
        blockStyles.push(`margin-left: ${node.marginLeft}`);
    }

    switch (node.type) {
        case "h1":
            return `<h1 style="${blockStyles.join(";")}">${children}</h1>`;
        case "h2":
            return `<h2 style="${blockStyles.join(";")}">${children}</h2>`;
        case "h3":
            return `<h3 style="${blockStyles.join(";")}">${children}</h3>`;
        case "h4":
            return `<h4 style="${blockStyles.join(";")}">${children}</h4>`;
        case "h5":
            return `<h5 style="${blockStyles.join(";")}">${children}</h5>`;
        case "h6":
            return `<h6 style="${blockStyles.join(";")}">${children}</h6>`;
        case "p":
            return `<p style="${blockStyles.join(";")}">${children}</p>`;
        case "blockquote":
            return `<blockquote style="${blockStyles.join(
                ";"
            )}">${children}</blockquote>`;
        default:
            return children;
    }
};

// convert html to nodes when opening the editor
export const deserialize = (el, markAttributes = {}) => {
    if (el.nodeType === Node.TEXT_NODE) {
        return jsx("text", markAttributes, el.textContent);
    } else if (el.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    const nodeAttributes = { ...markAttributes };

    if (el.nodeName === "S") {
        nodeAttributes.strikethrough = true;
    }

    if (el.nodeName === "U") {
        nodeAttributes.underline = true;
    }

    if (el.nodeName === "EM") {
        nodeAttributes.italic = true;
    }

    if (el.nodeName === "STRONG") {
        nodeAttributes.bold = true;
    }

    if (el.nodeName === "SUP") {
        nodeAttributes.superscript = true;
    }

    if (el.nodeName === "SUB") {
        nodeAttributes.subscript = true;
    }

    if (el.style.color) {
        nodeAttributes.color = el.style.color;
    }

    if (el.style.fontSize) {
        nodeAttributes.fontSize = el.style.fontSize;
    }

    const children = Array.from(el.childNodes)
        .map((node) => deserialize(node, nodeAttributes))
        .flat();

    if (children.length === 0) {
        children.push(jsx("text", nodeAttributes, ""));
    }

    const blockLevelAttributes = {};

    if (el.style.textAlign) {
        blockLevelAttributes.align = el.style.textAlign;
    }

    if (el.style.backgroundColor) {
        blockLevelAttributes.backgroundColor = el.style.backgroundColor;
    }

    if (el.style.lineHeight) {
        blockLevelAttributes.lineHeight = el.style.lineHeight;
    }

    if (el.style.marginLeft) {
        blockLevelAttributes.marginLeft = el.style.marginLeft;
    }

    switch (el.nodeName) {
        case "BODY":
            return jsx("fragment", {}, children);
        //   case 'BR':
        //     return '\n'
        case "H1":
            return jsx(
                "element",
                { type: "h1", ...blockLevelAttributes },
                children
            );
        case "H2":
            return jsx(
                "element",
                { type: "h2", ...blockLevelAttributes },
                children
            );
        case "H3":
            return jsx(
                "element",
                { type: "h3", ...blockLevelAttributes },
                children
            );

        case "H4":
            return jsx(
                "element",
                { type: "h4", ...blockLevelAttributes },
                children
            );

        case "H5":
            return jsx(
                "element",
                { type: "h5", ...blockLevelAttributes },
                children
            );

        case "H6":
            return jsx(
                "element",
                { type: "h6", ...blockLevelAttributes },
                children
            );

        case "P":
            return jsx(
                "element",
                { type: "p", ...blockLevelAttributes },
                children
            );
        case "BLOCKQUOTE":
            return jsx(
                "element",
                { type: "blockquote", ...blockLevelAttributes },
                children
            );
        default:
            return children;
    }
};
