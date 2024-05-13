import React from 'react';

function MyButton() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}

export default function Dashboard() {
  return(
    <div>
      <h2>Dashboard with Button</h2>
      <MyButton />
    </div>
  );
}