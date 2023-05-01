import React, { useRef, useEffect } from "react";

const useMousePosition = () => {
    const mousePosition = useRef({
        x: null,
        y: null,
    });

    useEffect(() => {
        const updateMousePosition = (ev) => {
            mousePosition.current = { x: ev.clientX, y: ev.clientY };
        };
        window.addEventListener("pointermove", updateMousePosition);
        return () => {
            window.removeEventListener("pointermove", updateMousePosition);
        };
    }, []);
    return mousePosition;
};

export default useMousePosition;
