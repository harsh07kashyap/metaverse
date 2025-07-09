import React,{useContext,useState, useMemo,useEffect} from "react";
import {io} from "socket.io-client";
const SocketContext = React.createContext(null);

export const useSocket=()=>{
    const socket=useContext(SocketContext);
    return socket;
}


export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io("http://localhost:8000");

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
      console.log("Socket disconnected");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};