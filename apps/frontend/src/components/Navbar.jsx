import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect,useContext } from "react";
import {AuthContext} from "../context/AuthContext"
// import jwt from "jsonwebtoken";

const Header = () => {
  const { isLoggedIn, userRole,setIsLoggedIn,setUserRole } = useContext(AuthContext);

  const navigate = useNavigate();



  // useEffect(() => {
  //   const token = localStorage.getItem("auth-token");
  //   const role=localStorage.getItem("role")
  //   setIsLoggedIn(!!token); // Update login state based on token presence
  //   if(role) setUserRole(role);
  // }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth-token"); // Remove the token from localStorage
    localStorage.removeItem("role")
    setIsLoggedIn(false); // Update the state to reflect logout
    setUserRole(null); // Clear the user role
    navigate("/login"); // Redirect to the login page
  };

  return (
    <header className="navbar">
      <div className="navbar_logo">
        
        <Link to="/"><img src="https://zep.us/images/light/layout/logo_zep.svg"  alt="Logo" /></Link>
      </div>
      <nav className="navbar_links">
        {isLoggedIn ? (
          <>
          {userRole === "Admin" && (
            <Link to="/my-maps">
              <button className="login_button">My Maps</button>
            </Link>
          )}
          {userRole === "User" && (
            <Link to="/create-space">
              <button className="login_button">My Spaces</button>
            </Link>
          )}
          <button className="signup_button" onClick={handleLogout}>Logout</button>
        </>
        ) : (
          <>
            <Link to="/login">
              <button className="login_button">Login</button>
            </Link>
            <Link to="/signup">
              <button className="signup_button">Signup</button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
