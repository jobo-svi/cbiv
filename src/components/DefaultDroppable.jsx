import { useDroppable } from "@dnd-kit/core";

const DefaultDroppable = (props) => {
    const { setNodeRef } = useDroppable({
        id: "initial-droppable",
        data: {
            rowIndex: 0,
            type: "row",
        },
    });
    return (
        <div style={{ margin: "0 1rem" }}>
            <div
                id="initial-droppable"
                ref={setNodeRef}
                className="grid-row"
                style={{
                    height: "100px",
                    borderStyle: "dashed",
                    borderColor: "#A2A2A2",
                    margin: "0 auto",
                }}
            ></div>
        </div>
    );
};

export default DefaultDroppable;
