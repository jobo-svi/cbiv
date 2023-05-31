import React, { useEffect } from "react";

const DebugValues = ({
    translateTiming,
    setTranslateTiming,
    columnDelayTiming,
    setColumnDelayTiming,
    slopTiming,
    setSlopTiming,
    gridGap,
    setGridGap,
}) => {
    // Persists debug settings across sessions
    useEffect(() => {
        localStorage.setItem("translateTiming", translateTiming);
        localStorage.setItem("columnDelayTiming", columnDelayTiming);
        localStorage.setItem("gridGap", gridGap);
        localStorage.setItem("slopTiming", slopTiming);
    }, [translateTiming, columnDelayTiming, gridGap, slopTiming]);

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                marginBottom: "40px",
            }}
        >
            {/* <label>
                <div>Translate speed (ms)</div>
                <input
                    type="number"
                    value={translateTiming}
                    onChange={(event) =>
                        setTranslateTiming(parseInt(event.target.value))
                    }
                />
            </label> */}
            <label>
                <div>Column hover time (ms)</div>
                <input
                    type="number"
                    value={columnDelayTiming}
                    onChange={(event) =>
                        setColumnDelayTiming(parseInt(event.target.value))
                    }
                />
            </label>
            {/* <label>
                <div>Slop time (ms)</div>
                <input
                    type="number"
                    value={slopTiming}
                    onChange={(event) =>
                        setSlopTiming(parseInt(event.target.value))
                    }
                />
            </label>
            <label>
                <div>Space between rows/cols</div>
                <input
                    type="number"
                    value={gridGap}
                    onChange={(event) =>
                        setGridGap(parseInt(event.target.value))
                    }
                />
            </label> */}
        </div>
    );
};

export default DebugValues;
