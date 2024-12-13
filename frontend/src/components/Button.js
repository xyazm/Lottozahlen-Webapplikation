import React from 'react';

const Button = ({ 
  buttonId, 
  text, 
  onClick, 
  disabled = false, 
  className = ''
}) => {
  return (
    <button
      id={buttonId}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center bg-rubBlue rounded-lg text-white font-heading transition duration-150 ease-in-out transform hover:shadow-lg hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 h-8 p-2 ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;