import React from "react";
import "./FourOhFour.css";

const FourOhFour: React.FC = () => {
    return (
        <div className="FourOhFour">
            <h1>Oops! Page not found.</h1>
            <svg viewBox="0 0 400 300" className="svg-404">
                <rect width="100%" height="100%" fill="#F1F1F1"/>
                <text x="50%" y="50%" fill="#555" fontSize="48" textAnchor="middle" dominantBaseline="middle">404
                </text>
            </svg>
            <p>Click on the logo to go Home.</p>
        </div>
    );
};

export default FourOhFour;