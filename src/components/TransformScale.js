import React, { useState, useEffect } from "react";

const TransformScale = (props) => {
  const defaultScale = 100;
  const [scale, setScale] = useState(props.scale || defaultScale);
  const scales = [
    25,
    33,
    50,
    67,
    75,
    80,
    90,
    100,
    110,
    125,
    150,
    175,
    200,
    250,
    300,
    400,
    500,
  ];

  useEffect(() => {
    if (scales.indexOf(scale) === -1) {
      resetScale();
    }

    props.onScaleChange(scale);
  }, [scale]);

  const handleDecrement = () => {
    const i = scales.indexOf(scale);
    if (i > 0) {
      setScale(scales[i - 1]);
    }
  };

  const handleIncrement = () => {
    const i = scales.indexOf(scale);
    if (i >= 0 && i < scales.length - 1) {
      setScale(scales[i + 1]);
    }
  };

  function resetScale() {
    setScale(defaultScale);
  }

  return (
    <div id="transform-scale">
      <div style={{ flex: 1 }}>{scale}%</div>
      <div
        onClick={handleDecrement}
        style={{ margin: "0px 7px", fontSize: 20, cursor: "pointer" }}
      >
        -
      </div>
      <div
        onClick={handleIncrement}
        style={{ margin: "0px 7px", fontSize: 20, cursor: "pointer" }}
      >
        +
      </div>
      <button
        onClick={() => resetScale()}
        style={{
          marginLeft: 10,
          border: "1px solid #bbb",
          borderRadius: "4px",
          cursor: "pointer",
          color: "white",
        }}
      >
        Reset
      </button>
    </div>
  );
};

export default TransformScale;
