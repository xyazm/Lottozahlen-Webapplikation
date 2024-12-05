import React from 'react';

const Button = ({ 
  buttonId, 
  text , 
  onClick, 
  disabled=false}) => {

  return (
    <button 
      id={buttonId} 
      onClick={onClick} 
      disabled={disabled}
      className="flex items-center h-8 bg-rubBlue rounded-lg text-white text-m font-heading transition duration-150 ease-in-out transform hover:shadow-lg hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      <span className="m-4">
        {text}
      </span>
    </button>
  );
};

export default Button;