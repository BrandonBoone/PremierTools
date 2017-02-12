import React from 'react';

const style = {
  fontFamily: 'Tahoma, sans-serif, Verdana, Geneva, Arial, sans-serrif',
  fontSize: '1.2em',
  color: '#666666',
  marginBottom: 0,
};

const Header = ({ title }) => (
  <h2
    style={style}
  >
    {title}
  </h2>
);

export default Header;
