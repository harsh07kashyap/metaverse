import { Link } from "react-router-dom";
import "../App.css"
import React, { useState,useContext} from "react";
import { useNavigate } from "react-router-dom";
import {UserContext} from "../context/ContextProvider"
import {AuthContext} from "../context/AuthContext"

const Login = () => {
   const [credentials, setCredentials] = useState({ username: "", password: "" });
   const { setIsLoggedIn, setUserRole } = useContext(AuthContext);
   let navigate = useNavigate();
   const {backendUrl}=useContext(UserContext);

   function getRoleFromToken(token) {
    // console.log(token)
    if (!token) return null; // Ensure the token exists

  try {
      // Extract the payload part of the JWT (2nd part after splitting by ".")
      const base64Payload = token.split('.')[1];
      if (!base64Payload) return null;

      // Decode and parse the payload
      const decodedPayload = JSON.parse(window.atob(base64Payload));
      
      // Return the role field if it exists
      return decodedPayload.role || null;
  } catch (error) {
      console.error('Failed to decode token:', error.message);
      return null;
  }
}

   const handleSubmit = async (e) => {
      e.preventDefault();
      const loginData = {
        username: credentials.username,
        password: credentials.password,
      };
      const response = await fetch(`${backendUrl}/api/v1/signin`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData), // body data type must match "Content-Type" header
      });
  
      const json = await response.json();
      // console.log("Login response:", json);
      // console.log("Login response2:",json.token);
  
      if (json.success) {
        // console.log(json)
        localStorage.setItem("auth-token", json.token);
        // console.log(json.token.role)
        const token = localStorage.getItem("auth-token");
        const role = getRoleFromToken(token);
        localStorage.setItem("role",role)
        setIsLoggedIn(true); // Update global state
        setUserRole(role); // Update role globally
        console.log(role)
        navigate("/");
      }
    };

   const onChange = (e) => {
      setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

   return(
    <>
       <div className="topform">
        <form className={`formClass flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg`} onSubmit={handleSubmit}>
           <div className="form">
             <div>
              <p className="para1">Login</p>
              
              <div className="para3"><p>UserName</p>
              <input className="input" type="text" id="email" name="username" onChange={onChange} required={true} value={credentials.username}/>
              </div>
             <div>
                <p className="para3">Password</p>
                <input className="input" type="password" id="password" name="password" onChange={onChange} required={true} value={credentials.password}/>
              </div>
              <div className="loginTop">
              <button className={`login bg-primary text-white w-full py-2 my-2 rounded-md text-base`} type="submit" >Login</button>
              </div>
             <p className="para2">Create an new account? 
              <span className="text-primary underline cursor-pointer">
                <Link to="/signup" >Click here</Link>
                </span>
             </p>
          </div>
          </div>
        </form>
       </div> 
    </>
   )
}

export default Login;
