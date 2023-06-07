import React, { useEffect, useState } from "react";

export function useBuilderHistory(activeId, items) {
    const [hasHistory, setHasHistory] = useState(false);

    useEffect(() => {
        // Clear the builder history on page load
        sessionStorage.removeItem("builder-session-history");
        setHasHistory(false);
    }, []);

    useEffect(() => {
        let sessionHistory = getSessionHistory();

        // Write to history once we're no longer dragging the element
        if (!activeId) {
            // Don't write to history if nothing changed since the last entry
            let mostRecent = JSON.stringify(items);
            if (
                items.length === 0 ||
                (sessionHistory[sessionHistory.length - 1] &&
                    mostRecent === JSON.stringify(sessionHistory[0]))
            ) {
                return;
            }

            sessionHistory.push(items);

            sessionStorage.setItem(
                "builder-session-history",
                JSON.stringify(sessionHistory)
            );

            setHasHistory(true);
        }
    }, [activeId]);

    return [hasHistory, setHasHistory];
}

export function undoHistory() {
    let sessionHistory = getSessionHistory();
    sessionHistory.pop();
    sessionStorage.setItem(
        "builder-session-history",
        JSON.stringify(sessionHistory)
    );

    if (sessionHistory[sessionHistory.length - 1]) {
        return sessionHistory[sessionHistory.length - 1];
    }

    return null;
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
