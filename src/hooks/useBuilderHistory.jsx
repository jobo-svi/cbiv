import { useEffect, useState } from "react";
import { create } from "jsondiffpatch/dist/jsondiffpatch.umd";

export function useBuilderHistory(activeId, items, previousItems) {
    const [index, setIndex] = useState(-1);
    const [lastIndex, setLastIndex] = useState(-1);

    const diffpatcher = create({
        objectHash: function (obj) {
            return obj.id;
        },
    });

    useEffect(() => {
        // Clear the builder history on page load.
        sessionStorage.setItem("builder-session-history", JSON.stringify([]));
    }, []);

    useEffect(() => {
        // Only write to history if something changed, and we're done dragging.
        var differences = diffpatcher.diff(previousItems, items);
        if (activeId !== null || differences === undefined) {
            return;
        }

        // This removes all future (redo) states after current index.
        let sessionHistory = getSessionHistory();
        const copy = sessionHistory.slice(0, index + 1);
        copy.push(differences);
        sessionStorage.setItem("builder-session-history", JSON.stringify(copy));

        setIndex(copy.length - 1);
        setLastIndex(copy.length - 1);

        console.log(`session storage size: ${sessionStorageSize()}kb`);
    }, [activeId]);

    useEffect(() => {
        if (!activeId) {
            // Save to localstorage until we get real saving working.
            localStorage.setItem("builder-session", JSON.stringify(items));
        }
    }, [activeId, items]);

    const undo = () => {
        let sessionHistory = getSessionHistory();
        const differences = sessionHistory[index];

        const newIndex = index - 1;
        setIndex(newIndex);
        setLastIndex(sessionHistory.length - 1);

        let after = JSON.parse(JSON.stringify(items));
        diffpatcher.unpatch(after, differences);
        return after;
    };

    const redo = () => {
        let sessionHistory = getSessionHistory();

        const newIndex = Math.min(sessionHistory.length - 1, index + 1);
        setIndex(newIndex);
        setLastIndex(sessionHistory.length - 1);

        let after = JSON.parse(JSON.stringify(items));
        const differences = sessionHistory[newIndex];
        diffpatcher.patch(after, differences);
        return after;
    };

    const clear = () => {
        sessionStorage.setItem("builder-session-history", JSON.stringify([[]]));
        setIndex(-1);
        setLastIndex(-1);
    };

    function getSessionHistory() {
        let sessionHistory = [];

        if (sessionStorage.getItem("builder-session-history") !== undefined) {
            sessionHistory = JSON.parse(
                sessionStorage.getItem("builder-session-history")
            );
        }

        return sessionHistory;
    }

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

    return {
        undo,
        redo,
        clear,
        canUndo: index >= 0,
        canRedo: index < lastIndex,
    };
}
