

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import VideoSection from './components/VideoSection';
import Login from './components/Login';
import Signup from './components/Signup';
import Arena from './components/Game.jsx';
import My_maps from './components/My_maps';
import My_spaces from './components/My_spaces';
import VideoStarting from './components/VideoStarting.jsx';
import {AuthProvider} from "./context/AuthContext"
import { SocketProvider } from './context/Socket';
import  Room  from './components/Room';

// import { PeerProvider } from './context/Peer.jsx';

function App() {
  return (
    <SocketProvider>
     
    <AuthProvider>
    <Router>
      <Navbar/>
        <div className='main_content'>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/my-maps" element={<My_maps/>}/>
            <Route path="/create-space" element={<My_spaces/>}/>
            <Route path="/game" element={<Arena/>}/>
            
            // {/* <Route path="/videostarting" element={<VideoStarting/>}/> */}
            // {/* <Route path="/room/:roomId" element={<Room/>}/> */}
          </Routes>
        </div>
    </Router>
    </AuthProvider>
    
    </SocketProvider>
  );
  // return(
  //   <>
  //     <Arena/>
  //   </>
  // )
}

export default App;
