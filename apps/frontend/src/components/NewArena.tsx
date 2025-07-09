import React, { useEffect, useRef, useState } from 'react';
import '../App.css'
import {ZegoUIKitPrebuilt} from "@zegocloud/zego-uikit-prebuilt"

const Arena = () => {
  const canvasRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [users, setUsers] = useState(new Map());
  const [params, setParams] = useState({ token: '', spaceId: '' });
  const [nearbyUserIds, setNearbyUserIds] = useState(new Set());
  const [isVideoActive, setIsVideoActive] = useState(false);
  const zegoRef=useRef<any>(null);

  function areUsersClose(userA, userB, threshold = 20) {
    const dx = userA.x - userB.x;
    const dy = userA.y - userB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    console.log(`Distance between ${userA.userId} and ${userB.userId}:`, distance);
    return distance <= threshold;
  }

  const adjustView = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentUser) return;
    const { x, y } = currentUser;
    canvas.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  };

  const myMeeting=async(element)=>{
    const appID=994844062;
    const serverSecret="85bf894caccb23ca6f2d5915e7f91e27";
    const kitToken=ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, params.spaceId, Date.now().toString(), params.token);
    const zc=ZegoUIKitPrebuilt.create(kitToken);
    zegoRef.current=zc;
    zc.joinRoom({
      container: element,
      scenario:{
        mode:ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton:false,

    })
  }

useEffect(() => {
  const newNearby = new Set();

  users.forEach(user => {
    if (user.userId !== currentUser.userId && areUsersClose(currentUser, user)) {
      newNearby.add(user.userId);
    }
  });

  setNearbyUserIds(newNearby);
}, [currentUser, users]);

useEffect(() => {
  const container = document.getElementById('zego-container');
  if (nearbyUserIds.size > 0 && !isVideoActive && container) {
    console.log("Starting video call with Zego...");
    myMeeting(container);
    setIsVideoActive(true);
  } else if (nearbyUserIds.size === 0 && isVideoActive) {
    // Optional: Destroy Zego room / UI
    console.log("Stopping video call and destroying Zego room...");
    if (zegoRef.current) {
      zegoRef.current.destroy(); // Properly disconnect video session
      zegoRef.current = null; // Reset the instance
      if(container) {
        container.innerHTML = ''; // Clear the container
      }
    }
    setIsVideoActive(false);
  }
}, [nearbyUserIds,isVideoActive]);

  // Initialize WebSocket connection and handle URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || '';
    const spaceId = urlParams.get('spaceId') || '';
    setParams({ token, spaceId });

    const handleUnload = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'user-left', payload: { userId: currentUser.userId } }));
      wsRef.current.close();
    }
  };

    
    // Initialize WebSocket
    wsRef.current = new WebSocket('ws://localhost:3001'); // Replace with your WS_URL
    
    wsRef.current.onopen = () => {
      // Join the space once connected
      wsRef.current.send(JSON.stringify({
        type: 'join',
        payload: {
          spaceId,
          token
        }
      }));
    };

    wsRef.current.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    const disableScroll = (e: any) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault(); // Prevents scrolling effect
    }
    };

    window.addEventListener("keydown", disableScroll);  
    window.addEventListener('beforeunload', handleUnload);

    // adjustView();
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (wsRef.current) {
        // wsRef.current.send(JSON.stringify({ type: 'user-left', payload: { userId: currentUser.userId } }));
        window.removeEventListener("keydown", disableScroll);
        wsRef.current.close();
        }
    };
  }, []);

  const handleWebSocketMessage = (message: any) => {
    console.log("handleWebSocketMessage")
    console.log(message.type)
    switch (message.type) {
      case 'space-joined':
        // Initialize current user position and other users
        // console.log("set")
        console.log({
            x: message.payload.spawn.x,
            y: message.payload.spawn.y,
            userId: message.payload.userId
          })
        setCurrentUser({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.userId
        });
        
        // Initialize other users from the payload
        const userMap = new Map();
        message.payload.users.forEach((user) => {
      console.log("hii ",user)
        userMap.set(user.id, {
            x: user.x,
            y: user.y,
            userId: user.id, // Ensure correct field name
        });
    });
        setUsers(userMap);
        break;

      case 'user-joined':
        setUsers(prev => {
          const newUsers = new Map(prev);
          
          newUsers.set(message.payload.userId, {
            x: message.payload.x,
            y: message.payload.y,
            userId: message.payload.userId
          });
          return newUsers;
        });
        break;

      case 'movement':
         setUsers((prev) => {
      const updatedUsers = new Map(prev);
      if (updatedUsers.has(message.payload.userId)) {
        updatedUsers.set(message.payload.userId, {
          ...updatedUsers.get(message.payload.userId), // Copy the existing data
          x: message.payload.x,
          y: message.payload.y, // Update position
        });
      }
      return updatedUsers;
    });
        break;

      case 'movement-rejected':
        // Reset current user position if movement was rejected
        setCurrentUser((prev: any) => ({
          ...prev,
          x: message.payload.x,
          y: message.payload.y
        }));
        break;

      case 'user-left':
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.delete(message.payload.userId);
          return newUsers;
        });
        break;
    }
  };

  // Handle user movement
  const handleMove = (newX: any, newY: any) => {
    if (!currentUser) return;
    
    // Send movement request
    wsRef.current.send(JSON.stringify({
      type: 'move',
      payload: {
        x: newX,
        y: newY,
        userId: currentUser.userId
      }
    }));
  };

  // Draw the arena
  useEffect(() => {
    console.log("render")
    const canvas = canvasRef.current;
    if (!canvas) return;
    console.log("below render")
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#eee';
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    console.log("before curerntusert")
    console.log(currentUser)
    // Draw current user
    if (currentUser && currentUser.x) {
        console.log("drawing myself")
        console.log(currentUser)
      ctx.beginPath();
      ctx.fillStyle = '#FF6B6B';
      ctx.arc(currentUser.x * 1, currentUser.y * 1, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('You', currentUser.x * 1, currentUser.y * 1 + 40);
    }

    // Draw other users
    users.forEach(user => {
    if (!user.x) {
        return
    }
    console.log("drawing other user")
    console.log(user)
      ctx.beginPath();
      ctx.fillStyle = '#4ECDC4';
      ctx.arc(user.x * 1, user.y * 1, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`User ${user.userId}`, user.x * 1, user.y * 1 + 40);
    });
  }, [currentUser, users]);

  const movementSpeed=10;
  const handleKeyDown = (e: any) => {
    if (!currentUser) return;

    const { x, y } = currentUser;
    switch (e.key) {
      case 'ArrowUp':
        handleMove(x, y - movementSpeed);
        break;
      case 'ArrowDown':
        handleMove(x, y + movementSpeed);
        break;
      case 'ArrowLeft':
        handleMove(x - movementSpeed, y);
        break;
      case 'ArrowRight':
        handleMove(x + movementSpeed, y);
        break;
    }
  };

  return (
    <>
       
    <div className="p-4" onKeyDown={handleKeyDown} tabIndex={0}>
          <div id="zego-container" ref={myMeeting} className="w-full h-[200px]"></div>
        {/* <h1 className="text-2xl font-bold mb-4">Arena</h1> */}
        <div className="mb-4">
          {/* <p className="text-sm text-gray-600">Token: {params.token}</p>
          <p className="text-sm text-gray-600">Space ID: {params.spaceId}</p> */}
          <p className="text-sm text-gray-600">Connected Users: {users.size + (currentUser ? 1 : 0)}</p>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={1000}
            height={1000}
            className="bg-white"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">Use arrow keys to move your avatar</p>
    </div>
    </>
  );
};

export default Arena;