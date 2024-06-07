import React from 'react';

const Button = ({ buttonId, text }) => {
  return (
    <button id={buttonId} className="flex items-center h-8 bg-rubBlue rounded-lg text-white text-s font-heading">
      <span className="m-4">
        {text}
      </span>
    </button>
  );
};

export default Button;