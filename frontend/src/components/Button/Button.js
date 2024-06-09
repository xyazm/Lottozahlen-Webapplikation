import React from 'react';

const Button = ({ buttonId, text , onClick}) => {
  return (
    <button id={buttonId} onClick={onClick} className="flex items-center h-8 bg-rubBlue rounded-lg text-white text-s font-heading">
      <span className="m-4">
        {text}
      </span>
    </button>
  );
};

export default Button;