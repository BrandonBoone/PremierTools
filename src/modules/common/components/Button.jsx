import React from 'react';

const Button = ({value, onClick}) => (
  <button
    style={{
      marginLeft:'4px',
    }}
    type='button'
    onClick={onClick}
  >
    {value}
  </button>
);

export default Button;
