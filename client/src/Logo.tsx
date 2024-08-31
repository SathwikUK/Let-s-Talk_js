import React from 'react';
import logo from './../mike.png';
import { Link } from 'react-router-dom';
 // Replace with your logo file path

const Logo: React.FC = () => {
  return (
    <div className="logo">
        <Link to="/sign-in">
      <img src={logo} alt="Logo" />
      </Link>
    </div>
  );
};

export default Logo;
