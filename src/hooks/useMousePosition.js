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
        window.addEventListener("mousemove", updateMousePosition);
        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, []);
    return mousePosition;
};

export default useMousePosition;
