import { useEffect, useState } from "react";

export function useBuilderHistory(activeId, items) {
    const [index, setIndex] = useState(0);
    const [lastIndex, setLastIndex] = useState(0);

    useEffect(() => {
        // Clear the builder history on page load.
        sessionStorage.setItem(
            "builder-session-history",
            JSON.stringify([items])
        );
    }, []);

    useEffect(() => {
        let sessionHistory = getSessionHistory();

        // Write to history once we're no longer dragging the element.
        // Don't write to history if nothing changed since the last entry.
        if (!activeId) {
            if (
                JSON.stringify(items) === JSON.stringify(sessionHistory[index])
            ) {
                return;
            }

            // This removes all future (redo) states after current index.
            const copy = sessionHistory.slice(0, index + 1);
            copy.push(items);
            sessionHistory = copy;
            sessionStorage.setItem(
                "builder-session-history",
                JSON.stringify(sessionHistory)
            );

            setIndex(copy.length - 1);
            setLastIndex(copy.length - 1);
        }
    }, [activeId]);

    // Allows you to go back (undo) N steps.
    const undo = (steps = 1) => {
        const newIndex = Math.max(0, index - (steps || 1));
        setIndex(newIndex);

        let sessionHistory = getSessionHistory();
        setLastIndex(sessionHistory.length - 1);
        return sessionHistory[newIndex];
    };

    // Allows you to go forward (redo) N steps.
    const redo = (steps = 1) => {
        let sessionHistory = getSessionHistory();
        const newIndex = Math.min(
            sessionHistory.length - 1,
            index + (steps || 1)
        );
        setIndex(newIndex);
        setLastIndex(sessionHistory.length - 1);
        return sessionHistory[newIndex];
    };

    useEffect(() => {
        if (!activeId) {
            // Also save to localstorage until we get real saving working.
            localStorage.setItem("builder-session", JSON.stringify(items));
        }
    }, [activeId, items]);

    return { undo, redo, index, lastIndex: lastIndex };
}

function getSessionHistory() {
    let sessionHistory = [];

    if (sessionStorage.getItem("builder-session-history")) {
        sessionHistory = JSON.parse(
            sessionStorage.getItem("builder-session-history")
        );
    }

    return sessionHistory;
}
