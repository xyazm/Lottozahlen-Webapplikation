import React from 'react';
import { ReactComponent as RightIcon }  from '../../assets/right.svg'

const Button = ({ text }) => {
  return (
    <button className="flex items-center h-8 bg-rubBlue rounded-lg text-white text-s font-heading">
      <span className="m-4">
        {text}
      </span>
    </button>
  );
};

export default Button;