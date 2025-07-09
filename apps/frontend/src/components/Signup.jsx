import { Link } from "react-router-dom";
import "../App.css"
import React, { useState,useContext } from "react";
import { useNavigate } from "react-router-dom";
import {UserContext} from "../context/ContextProvider"

const Signup = () => {
    const [credentials, setCredentials] = useState({ username: "", password: "",type:"" });
    let navigate = useNavigate();
    const {backendUrl}=useContext(UserContext);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const formData = {
        username: credentials.username,
        password: credentials.password,
        type:credentials.type,
      };
      const response = await fetch(`${backendUrl}/api/v1/signup`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // body data type must match "Content-Type" header
      });
      const json = await response.json();
      console.log(json);
      console.log(json.token)
      if (json.success) {
        localStorage.setItem("auth-token", json.token);
        navigate("/");
      }
    };
  
    const onChange = (e) => {
      setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };
  

    const [selectedOption, setSelectedOption] = useState('');
    const handleSelectChange = (e) => {
    setSelectedOption(e.target.value); // Update selected option
  };
    return (
      <>
        {" "}
        <div className="topform">
          <form
            className={`formClass flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg`} onSubmit={handleSubmit}
          >
            <div className="form">
              <p className="para1">Create Account</p>
              <p className="para2">Sign up to dive into world of Zepto</p>
              <div>
                <p className="para3">UserName</p>
                <input
                  className="input"
                  type="text"
                  id="username"
                  name="username"
                  onChange={onChange}
                  required
                  value={credentials.username}
                />
              </div>
              <div class="w-full">
                <p className="para3">Password</p>
                <input
                  className="input"
                  type="password"
                  id="password"
                  name="password"
                  onChange={onChange}
                  required
                  value={credentials.password}
                />
              </div>
              <div>
                <label htmlFor="option-select">Choose an option:</label>
                <select
                    id="option-select"
                    name="type"
                    value={credentials.type}
                    onChange={onChange}
                    className="form-control" // Optional, if using Bootstrap for styling
                >
                    <option value="">--Select an option--</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    
                </select>

                <p>Selected Option: {credentials.type}</p>
            </div>
              <div className="createTop">
                <button
                  className={`create bg-primary text-white w-full py-2 my-2 rounded-md text-base`} type="submit"
                >
                  Create account
                </button>
              </div>
              <p className="para2">
                Already have an account?{" "}
                <span class="text-primary underline cursor-pointer">
                  <Link to="/login">login</Link>
                </span>
              </p>
              
            </div>
          </form>
        </div>
      </>
    );
}

export default Signup
