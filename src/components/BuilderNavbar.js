import "../css/App.css";
import React from "react";

const BuilderNavbar = () => {
    return (
        <div className="navbar">
            <div className="course">
                <span className="course-image"></span>
                <span className="course-title">Course Title (edit)</span>
            </div>
            <div className="options">
                {/* <span className="option">Cancel</span>
            <span className="option">Save</span>
            <span className="option">Publish</span> */}
                <span className="option preview">Preview</span>
                {/* <span className="option">Gear icon</span>
            <span className="option">Chart icon</span> */}
            </div>
        </div>
    );
};

export default BuilderNavbar;
