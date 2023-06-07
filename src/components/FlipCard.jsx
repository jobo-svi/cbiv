import React, { useEffect, useState } from "react";

const FlipCard = (props) => {
  // const items = props.items.map(item => {
  //   return React.createElement(item.)
  // })

  return (
    <div className="flip-card-container">
      <div className="flip-card">
        <div className="flip-card-inner">
          <div className="flip-card-front">{props.front}</div>
          <div className="flip-card-back">{props.back}</div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
