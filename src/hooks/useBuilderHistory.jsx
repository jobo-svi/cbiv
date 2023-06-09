import { useEffect, useState } from "react";
import { diff, applyDiff, applyChange, revertChange } from "deep-diff";
import { diffArrays } from "diff";

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

            var before = {
                data: [],
            };

            var after = {
                data: [
                    {
                        id: "1",
                        columns: [
                            {
                                id: "1",
                                component: "paragraph",
                                props: {
                                    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                                },
                            },
                        ],
                    },
                ],
            };

            let result = after;

            var differences = diff(before, after);

            var reverted = differences.reduce((acc, change) => {
                diff.revertChange(acc, true, change);
                return acc;
            }, result);

            console.log(result);

            var unreverted = differences.reduce((acc, change) => {
                diff.applyChange(acc, true, change);
                return acc;
            }, result);
            console.log(result);

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

            //console.log(`session storage size: ${sessionStorageSize()}kb`);
        }
    }, [activeId]);

    useEffect(() => {
        if (!activeId) {
            // Also save to localstorage until we get real saving working.
            localStorage.setItem("builder-session", JSON.stringify(items));
        }
    }, [activeId, items]);

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

    const clear = () => {
        sessionStorage.setItem("builder-session-history", JSON.stringify([[]]));
        setIndex(0);
        setLastIndex(0);
    };

    return { undo, redo, index, lastIndex: lastIndex, clear };
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

let localStorageSize = function () {
    let _lsTotal = 0,
        _xLen,
        _x;
    for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) continue;
        _xLen = (localStorage[_x].length + _x.length) * 2;
        _lsTotal += _xLen;
    }
    return (_lsTotal / 1024).toFixed(2);
};

let sessionStorageSize = function () {
    let _lsTotal = 0,
        _xLen,
        _x;
    for (_x in sessionStorage) {
        if (!sessionStorage.hasOwnProperty(_x)) continue;
        _xLen = (sessionStorage[_x].length + _x.length) * 2;
        _lsTotal += _xLen;
    }
    return (_lsTotal / 1024).toFixed(2);
};
