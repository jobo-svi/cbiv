import RichTextEditor from "./editor/RichTextEditor";

const EditableGridColumn = (props) => {
    const style = {
        width: !props.column.gridWidth
            ? `${100 / props.row.columns.length}%`
            : `${props.column.gridWidth}%`,
    };

    return (
        <div
            id={props.column.id}
            className="grid-column"
            style={{
                minHeight: "100px",
                ...style,
                ...(props.column.props.style ? props.column.props.style : {}),
                border: "1px dashed black",
                background: "#D1D1D1",
            }}
        >
            <RichTextEditor
                initialValue={props.column.props.text}
                handleEdit={props.handleEdit}
            />
        </div>
    );
};

export default EditableGridColumn;
