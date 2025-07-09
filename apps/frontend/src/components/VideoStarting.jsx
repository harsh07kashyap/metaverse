import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../App.css'
import { useSocket } from '../context/Socket';
import {useNavigate} from 'react-router-dom';

const VideoStarting=({userId,roomId})=>{
    const  socket  = useSocket();
    // const [roomId, setRoomId] = useState();
    // const [userId, setUserId] = useState();
    const navigate=useNavigate();

    const handleSubmitForm=useCallback((e)=>{
        e.preventDefault();
         if (!socket) return;
         socket.emit('room:join', { userId, roomId });
    },[socket, userId, roomId]);

    const handleJoinRoom=useCallback((data)=>{
        // console.log("Room joined",roomId);
        const {userId,roomId}=data;
        // navigate(`/room/${roomId}`);
        navigate(`/game/?token=${localStorage.getItem('auth-token')}&spaceId=${roomId}`);
    },[navigate])

    useEffect(() => {
        if (!socket) return;
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom);
        }
        
    }, [socket]);

    return(
        <div className='videostarting_container'>
            <div className='input_container'>
                <form onSubmit={handleSubmitForm}>
                    <input value={userId} className='input_container_inputs' type="text" id="userId" placeholder='Your UserName' />
                    <input value={roomId} className='input_container_inputs' type="text" id="roomId" placeholder='Click Join to enter that space' />
                    <button>Enter room</button>
                </form>
            </div>
        </div>
    )
}
export default VideoStarting;