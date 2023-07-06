import { useState } from "react";

const Input = ({ onClick, placeholder }) => {
    const [value, setValue] = useState("#000");
    function handleChange(event) {
        setValue(event.target.value);
    }

    return (
        <span style={{ position: "relative" }}>
            <input
                type="text"
                onChange={handleChange}
                value={value}
                placeholder={placeholder}
            />
            <button
                style={{
                    position: "absolute",
                    right: "2px",
                    top: "0px",
                    height: "20px",
                    lineHeight: "20px",
                }}
                onClick={() => onClick(value)}
            >
                done
            </button>
        </span>
    );
};

export default Input;
