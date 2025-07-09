import { createContext, useState } from "react";

export const UserContext = createContext();

const UserContextProvider = (props) => { 

  const backendUrl = import.meta.env.VITE_BACKEND_URL 

  const value = {
    backendUrl
  }
  return(
    <UserContext.Provider value = {value}>
      {props.children}
    </UserContext.Provider>
  )
}

export default UserContextProvider