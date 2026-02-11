import React from "react";
import "./Spinner.css";

type SpinnerProps = {
  size?: number; 
};

const Spinner: React.FC<SpinnerProps> = ({ size = 52 }) => {
  return (
    <svg
      viewBox="25 25 50 50"
      style={{ width: size, height: size }}
      className="spinner"
    >
      <circle r="20" cy="50" cx="50" />
    </svg>
  );
};

export default Spinner;
